"use server";

import { db } from "@/db";
import { claims, listings } from "@/db/schema";
import { eq, and, ne, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { rejectClaimSchema } from "../schema";

/**
 * Approve a single business ownership claim
 * Sets listing ownerId to claimant, marks listing as claimed, and auto-rejects other pending claims.
 */
export async function approveClaimAction(claimId: number) {
  try {
    const [claim] = await db
      .select({
        id: claims.id,
        listingId: claims.listingId,
        userId: claims.userId,
      })
      .from(claims)
      .where(eq(claims.id, claimId))
      .limit(1);

    if (!claim) {
      return { success: false, message: "Claim record not found." };
    }

    await db.transaction(async (tx) => {
      // 1. Mark this claim as approved
      await tx
        .update(claims)
        .set({
          status: "approved",
          rejectionReason: null,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(claims.id, claimId));

      // 2. Assign listing ownership to the claimant and mark as claimed
      await tx
        .update(listings)
        .set({
          ownerId: claim.userId,
          isClaimed: true,
          updatedAt: new Date(),
        })
        .where(eq(listings.id, claim.listingId));

      // 3. Auto-reject any conflicting pending claims for this listing
      await tx
        .update(claims)
        .set({
          status: "rejected",
          rejectionReason: "Another ownership claim was approved for this business.",
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(claims.listingId, claim.listingId),
            eq(claims.status, "pending"),
            ne(claims.id, claimId),
          ),
        );
    });

    revalidatePath("/admin/claims");
    revalidatePath("/admin/listings");
    revalidatePath(`/listings/${claim.listingId}`);

    return {
      success: true,
      message: "Claim approved and listing ownership assigned.",
    };
  } catch (error) {
    console.error("Error approving claim:", error);
    return { success: false, message: "Failed to approve claim." };
  }
}

/**
 * Reject a business ownership claim with a validated reason
 */
export async function rejectClaimAction(claimId: number, reason: string) {
  try {
    const parsed = rejectClaimSchema.safeParse({ claimId, rejectionReason: reason });
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid rejection reason.",
      };
    }

    const [claim] = await db
      .select({ id: claims.id, listingId: claims.listingId })
      .from(claims)
      .where(eq(claims.id, claimId))
      .limit(1);

    if (!claim) {
      return { success: false, message: "Claim record not found." };
    }

    await db
      .update(claims)
      .set({
        status: "rejected",
        rejectionReason: reason.trim(),
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(claims.id, claimId));

    revalidatePath("/admin/claims");

    return { success: true, message: "Claim rejected successfully." };
  } catch (error) {
    console.error("Error rejecting claim:", error);
    return { success: false, message: "Failed to reject claim." };
  }
}

/**
 * Delete a claim record permanently
 */
export async function deleteClaimAction(claimId: number) {
  try {
    const [claim] = await db
      .select({ id: claims.id })
      .from(claims)
      .where(eq(claims.id, claimId))
      .limit(1);

    if (!claim) {
      return { success: false, message: "Claim record not found." };
    }

    await db.delete(claims).where(eq(claims.id, claimId));

    revalidatePath("/admin/claims");

    return { success: true, message: "Claim record deleted." };
  } catch (error) {
    console.error("Error deleting claim:", error);
    return { success: false, message: "Failed to delete claim." };
  }
}

/**
 * Bulk approve multiple claims simultaneously
 */
export async function bulkApproveClaimsAction(claimIds: number[]) {
  if (!claimIds || claimIds.length === 0) {
    return { success: false, message: "No claims selected for approval." };
  }

  try {
    const targetClaims = await db
      .select({
        id: claims.id,
        listingId: claims.listingId,
        userId: claims.userId,
      })
      .from(claims)
      .where(inArray(claims.id, claimIds));

    await db.transaction(async (tx) => {
      for (const claim of targetClaims) {
        // Mark claim as approved
        await tx
          .update(claims)
          .set({
            status: "approved",
            rejectionReason: null,
            reviewedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(claims.id, claim.id));

        // Assign listing owner and mark as claimed
        await tx
          .update(listings)
          .set({
            ownerId: claim.userId,
            isClaimed: true,
            updatedAt: new Date(),
          })
          .where(eq(listings.id, claim.listingId));

        // Auto-reject any conflicting pending claims for the same listing
        await tx
          .update(claims)
          .set({
            status: "rejected",
            rejectionReason: "Another ownership claim was approved for this business.",
            reviewedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(claims.listingId, claim.listingId),
              eq(claims.status, "pending"),
              ne(claims.id, claim.id),
            ),
          );
      }
    });

    revalidatePath("/admin/claims");
    revalidatePath("/admin/listings");

    return {
      success: true,
      message: `Successfully approved ${targetClaims.length} claims.`,
    };
  } catch (error) {
    console.error("Error bulk approving claims:", error);
    return { success: false, message: "Failed to bulk approve claims." };
  }
}

/**
 * Bulk reject multiple claims with a common reason
 */
export async function bulkRejectClaimsAction(claimIds: number[], reason: string) {
  if (!claimIds || claimIds.length === 0) {
    return { success: false, message: "No claims selected for rejection." };
  }

  if (!reason || !reason.trim() || reason.trim().length < 3) {
    return { success: false, message: "A valid rejection reason is required." };
  }

  try {
    await db
      .update(claims)
      .set({
        status: "rejected",
        rejectionReason: reason.trim(),
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(inArray(claims.id, claimIds));

    revalidatePath("/admin/claims");

    return {
      success: true,
      message: `Successfully rejected ${claimIds.length} claims.`,
    };
  } catch (error) {
    console.error("Error bulk rejecting claims:", error);
    return { success: false, message: "Failed to bulk reject claims." };
  }
}

/**
 * Bulk delete multiple claims
 */
export async function bulkDeleteClaimsAction(claimIds: number[]) {
  if (!claimIds || claimIds.length === 0) {
    return { success: false, message: "No claims selected for deletion." };
  }

  try {
    await db.delete(claims).where(inArray(claims.id, claimIds));

    revalidatePath("/admin/claims");

    return {
      success: true,
      message: `Successfully deleted ${claimIds.length} claims.`,
    };
  } catch (error) {
    console.error("Error bulk deleting claims:", error);
    return { success: false, message: "Failed to bulk delete claims." };
  }
}


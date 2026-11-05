"use server";

import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { recalculateListingRating } from "../utils";
import { rejectReviewSchema, ownerReplySchema } from "../schema";

export async function approveReviewAction(reviewId: number) {
  try {
    const [existing] = await db
      .select({ id: reviews.id, listingId: reviews.listingId })
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (!existing) {
      return { success: false, message: "Review not found." };
    }

    await db
      .update(reviews)
      .set({
        status: "approved",
        rejectionReason: null,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId));

    await recalculateListingRating(existing.listingId);

    revalidatePath("/admin/reviews");
    revalidatePath(`/listings/${existing.listingId}`);

    return { success: true, message: "Review approved successfully." };
  } catch (error) {
    console.error("Error approving review:", error);
    return { success: false, message: "Failed to approve review." };
  }
}

export async function rejectReviewAction(reviewId: number, reason?: string) {
  try {
    if (reason && reason.trim()) {
      const parsed = rejectReviewSchema.safeParse({ reason });
      if (!parsed.success) {
        return {
          success: false,
          message: parsed.error.issues[0]?.message || "Invalid rejection reason.",
        };
      }
    }

    const [existing] = await db
      .select({ id: reviews.id, listingId: reviews.listingId })
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (!existing) {
      return { success: false, message: "Review not found." };
    }

    await db
      .update(reviews)
      .set({
        status: "rejected",
        rejectionReason: reason?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId));

    await recalculateListingRating(existing.listingId);

    revalidatePath("/admin/reviews");
    revalidatePath(`/listings/${existing.listingId}`);

    return { success: true, message: "Review rejected." };
  } catch (error) {
    console.error("Error rejecting review:", error);
    return { success: false, message: "Failed to reject review." };
  }
}

export async function updateOwnerReplyAction(
  reviewId: number,
  replyText: string,
) {
  try {
    const parsed = ownerReplySchema.safeParse({ replyText });
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid reply text.",
      };
    }

    const [existing] = await db
      .select({ id: reviews.id, listingId: reviews.listingId })
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (!existing) {
      return { success: false, message: "Review not found." };
    }

    await db
      .update(reviews)
      .set({
        ownerReply: replyText.trim(),
        ownerRepliedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId));

    revalidatePath("/admin/reviews");
    revalidatePath(`/listings/${existing.listingId}`);

    return { success: true, message: "Owner reply updated successfully." };
  } catch (error) {
    console.error("Error updating owner reply:", error);
    return { success: false, message: "Failed to update owner reply." };
  }
}

export async function deleteReviewAction(reviewId: number) {
  try {
    const [existing] = await db
      .select({ id: reviews.id, listingId: reviews.listingId })
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (!existing) {
      return { success: false, message: "Review not found." };
    }

    await db.delete(reviews).where(eq(reviews.id, reviewId));

    await recalculateListingRating(existing.listingId);

    revalidatePath("/admin/reviews");
    revalidatePath(`/listings/${existing.listingId}`);

    return { success: true, message: "Review deleted successfully." };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { success: false, message: "Failed to delete review." };
  }
}


"use server";

import { db } from "@/db";
import { listings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ListingStatusType =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "expired";

export interface UpdateListingStatusParams {
  listingId: number;
  status: ListingStatusType;
  rejectionReason?: string;
}

/**
 * Quick status update server action (Approve, Reject, Mark Pending)
 */
export async function updateListingStatusAction({
  listingId,
  status,
  rejectionReason,
}: UpdateListingStatusParams) {
  try {
    const existing = await db.query.listings.findFirst({
      where: eq(listings.id, listingId),
      columns: { id: true, title: true, status: true },
    });

    if (!existing) {
      return {
        success: false,
        message: "Listing nahi mili.",
      };
    }

    const updateData: {
      status: ListingStatusType;
      adminNotes?: string | null;
      updatedAt: Date;
    } = {
      status,
      updatedAt: new Date(),
    };

    if (status === "rejected" && rejectionReason) {
      updateData.adminNotes = rejectionReason.trim();
    } else if (status === "approved") {
      // Re-approved hone par rejection note clear kar dein
      updateData.adminNotes = null;
    }

    await db
      .update(listings)
      .set(updateData)
      .where(eq(listings.id, listingId));

    revalidatePath("/admin/listings");

    const statusLabels: Record<ListingStatusType, string> = {
      approved: "Approved",
      rejected: "Rejected",
      pending: "Pending",
      draft: "Draft",
      expired: "Expired",
    };

    return {
      success: true,
      message: `Listing status "${statusLabels[status] || status}" update ho gaya hai.`,
    };
  } catch (error) {
    console.error("UPDATE_LISTING_STATUS_ERROR:", error);
    return {
      success: false,
      message: "Listing status update karte waqt error aaya.",
    };
  }
}

/**
 * 1-click Toggle Featured status action
 */
export async function toggleListingFeaturedAction(
  listingId: number,
  currentFeatured: boolean,
) {
  try {
    const nextFeatured = !currentFeatured;

    await db
      .update(listings)
      .set({
        isFeatured: nextFeatured,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, listingId));

    revalidatePath("/admin/listings");

    return {
      success: true,
      isFeatured: nextFeatured,
      message: nextFeatured
        ? "Listing featured mark ho gayi hai."
        : "Listing unfeatured kar di gayi hai.",
    };
  } catch (error) {
    console.error("TOGGLE_LISTING_FEATURED_ERROR:", error);
    return {
      success: false,
      message: "Featured status badalte waqt error aaya.",
    };
  }
}

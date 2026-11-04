"use server";

import { db } from "@/db";
import { listings } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Bulk Status Update (Approve or Reject multiple listings at once)
 */
export async function bulkUpdateListingStatusAction(
  ids: number[],
  status: "approved" | "rejected",
) {
  try {
    if (!ids || ids.length === 0) {
      return {
        success: false,
        message: "No listings selected.",
      };
    }

    const updateData: {
      status: "approved" | "rejected";
      updatedAt: Date;
      adminNotes?: string | null;
    } = {
      status,
      updatedAt: new Date(),
    };

    if (status === "approved") {
      updateData.adminNotes = null;
    }

    await db
      .update(listings)
      .set(updateData)
      .where(inArray(listings.id, ids));

    revalidatePath("/admin/listings");

    return {
      success: true,
      message: `Successfully updated ${ids.length} listing${ids.length > 1 ? "s" : ""} to ${status}.`,
    };
  } catch (error) {
    console.error("BULK_UPDATE_LISTING_STATUS_ERROR:", error);
    return {
      success: false,
      message: "Failed to update listings status. Please try again.",
    };
  }
}

/**
 * Bulk Permanent Delete Listings
 */
export async function bulkDeleteListingsAction(ids: number[]) {
  try {
    if (!ids || ids.length === 0) {
      return {
        success: false,
        message: "No listings selected.",
      };
    }

    await db.delete(listings).where(inArray(listings.id, ids));

    revalidatePath("/admin/listings");

    return {
      success: true,
      message: `Successfully deleted ${ids.length} listing${ids.length > 1 ? "s" : ""}.`,
    };
  } catch (error) {
    console.error("BULK_DELETE_LISTINGS_ERROR:", error);
    return {
      success: false,
      message: "Failed to delete listings. Please try again.",
    };
  }
}


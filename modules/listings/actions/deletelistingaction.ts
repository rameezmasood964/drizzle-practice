"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { listings } from "@/db/schema";

export async function deleteListingAction(id: number) {
  try {
    if (!id || isNaN(id)) {
      return {
        success: false,
        message: "Invalid listing ID.",
      };
    }

    // Hard delete query
    const [deletedRecord] = await db
      .delete(listings)
      .where(eq(listings.id, id))
      .returning({ id: listings.id, title: listings.title });

    if (!deletedRecord) {
      return {
        success: false,
        message: "Listing nahi mili ya pehle se delete ho chuki hai.",
      };
    }

    // Cache revalidate karein taake dashboard table turant update ho jaye
    revalidatePath("/admin/listings");

    return {
      success: true,
      message: `"${deletedRecord.title}" ko permanently delete kar diya gaya hai.`,
    };
  } catch (error) {
    console.error("DELETE_LISTING_ERROR:", error);
    return {
      success: false,
      message: "Listing delete karte waqt server error aaya.",
    };
  }
}
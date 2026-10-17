import { db } from "@/app/db";
import { listings, categories, listingImages } from "@/app/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function getListings() {
  try {
    const data = await db
      .select({
        id: listings.id,
        title: listings.title,
        slug: listings.slug,
        phone: listings.phone,
        area: listings.area,
        address: listings.address,
        status: listings.status,
        isVerified: listings.isVerified,
        isFeatured: listings.isFeatured,
        createdAt: listings.createdAt,
        details: listings.details,
        categories: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
        primaryImage: listingImages.imageUrl,
      })
      .from(listings)
      .innerJoin(categories, eq(listings.categoryId, categories.id))

      .leftJoin(
        listingImages,
        and(
          eq(listings.id, listingImages.listingId),
          eq(listingImages.isPrimary, true),
        ),
      )
      .orderBy(desc(listings.createdAt));
    return { success: true, data };
  } catch (error) {
    console.log("listing get krty hoye error", error);
    return { success: false, error: "Failed to get listings" };
  }
}

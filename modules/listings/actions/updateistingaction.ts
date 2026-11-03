"use server";

import { revalidatePath } from "next/cache";
import { and, ne, eq, like, notInArray } from "drizzle-orm";

import { db } from "@/db";
import { listings, listingImages } from "@/db/schema";
import { listingFormSchema } from "../schema";
import type { ListingFormValues } from "../types";

// Update ke waqt collision check (apni current listing ko chhor kar check karega)
async function generateUniqueSlugForUpdate(
  rawInput: string,
  currentId: number,
): Promise<string> {
  const baseSlug = rawInput
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const existingMatches = await db
    .select({ slug: listings.slug, id: listings.id })
    .from(listings)
    .where(
      and(like(listings.slug, `${baseSlug}%`), ne(listings.id, currentId)),
    );

  if (existingMatches.length === 0) return baseSlug;

  const slugSet = new Set(existingMatches.map((item) => item.slug));
  if (!slugSet.has(baseSlug)) return baseSlug;

  let counter = 1;
  let candidateSlug = `${baseSlug}-${counter}`;
  while (slugSet.has(candidateSlug)) {
    counter++;
    candidateSlug = `${baseSlug}-${counter}`;
  }

  return candidateSlug;
}

export async function updateListingAction(
  id: number,
  formData: ListingFormValues,
) {
  try {
    const validatedData = listingFormSchema.safeParse(formData);

    if (!validatedData.success) {
      return {
        success: false,
        message: "Validation fail ho gayi hai.",
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    const data = validatedData.data;
    const parentCatId = Number(data.categoryId);
    const targetCategoryId = data.subCategoryId
      ? Number(data.subCategoryId)
      : parentCatId;

    // 1. Slug check
    const finalUniqueSlug = await generateUniqueSlugForUpdate(data.title, id);

    // 2. Business hours format
    const formattedBusinessHours: Record<
      string,
      { isOpen: boolean; open: string; close: string }
    > = {};

    if (data.businessHours) {
      for (const [day, val] of Object.entries(
        data.businessHours as Record<string, any>,
      )) {
        const dayData = val as {
          isOpen: boolean;
          openTime?: string;
          closeTime?: string;
        };
        formattedBusinessHours[day] = {
          isOpen: Boolean(dayData?.isOpen),
          open: dayData?.openTime || "09:00 AM",
          close: dayData?.closeTime || "10:00 PM",
        };
      }
    }

    // 3. Database Main Listing Update
    const [updatedListing] = await db
      .update(listings)
      .set({
        title: data.title,
        slug: finalUniqueSlug,
        description: data.description || null,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email || null,
        website: data.website || null,
        address: data.address,
        landmark: data.landmark || null,
        mapsUrl: data.mapsUrl,
        areaId: Number(data.areaId),
        categoryId: targetCategoryId,
        details: (data.customFields || {}) as Record<string, any>,
        businessHours: formattedBusinessHours,
        status: data.status,
        isFeatured: Boolean(data.isFeatured),
        updatedAt: new Date(),
      })
      .where(eq(listings.id, id))
      .returning();

    // 4. 🖼️ IMAGES SYNC LOGIC (Purani vs Nayi Images Handle Karna)
    if (data.images && data.images.length > 0) {
      // (A) DB mein pehle se mojood images fetch karein
      const existingDbImages = await db
        .select({
          id: listingImages.id,
          imageUrl: listingImages.imageUrl,
        })
        .from(listingImages)
        .where(eq(listingImages.listingId, id));

      const existingUrlsSet = new Set(existingDbImages.map((img) => img.imageUrl));

      // (B) Form mein maujood valid URLs
      const formImageUrls = data.images
        .map((img) => img.url)
        .filter((url) => Boolean(url) && !url.startsWith("blob:"));

      // (C) Jo DB mein theen magar form se user ne remove kar deen, unhe delete karein
      if (formImageUrls.length > 0) {
        await db
          .delete(listingImages)
          .where(
            and(
              eq(listingImages.listingId, id),
              notInArray(listingImages.imageUrl, formImageUrls),
            ),
          );
      } else {
        await db.delete(listingImages).where(eq(listingImages.listingId, id));
      }

      // (D) Har image ko check karein: agar pehle se DB mein hai to update, warna insert
      for (let index = 0; index < data.images.length; index++) {
        const img = data.images[index];
        if (!img.url || img.url.startsWith("blob:")) continue;

        const isCover = Boolean(img.isCover || index === 0);

        if (existingUrlsSet.has(img.url)) {
          // Pehle se mojood image: sort order aur cover flag update karein
          await db
            .update(listingImages)
            .set({
              isPrimary: isCover,
              sortOrder: index,
            })
            .where(
              and(
                eq(listingImages.listingId, id),
                eq(listingImages.imageUrl, img.url),
              ),
            );
        } else {
          // Nayi upload shuda image: DB mein insert karein
          await db.insert(listingImages).values({
            listingId: id,
            imageUrl: img.url,
            isPrimary: isCover,
            sortOrder: index,
          });
        }
      }
    } else {
      // Agar user ne saari images delete kar di hon
      await db.delete(listingImages).where(eq(listingImages.listingId, id));
    }

    revalidatePath("/admin/listings");
    revalidatePath(`/listings/${finalUniqueSlug}`);

    return {
      success: true,
      message: "Listing kamyabi se update ho gayi hai!",
      data: updatedListing,
    };
  } catch (error: any) {
    console.error("UPDATE_LISTING_ERROR:", error);
    return {
      success: false,
      message: "Listing update karte waqt error aaya.",
    };
  }
}

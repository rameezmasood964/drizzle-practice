"use server";

import { revalidatePath } from "next/cache";
import { and, ne, eq, like, notInArray, or } from "drizzle-orm";

import { db } from "@/db";
import { listings, listingImages, categories } from "@/db/schema";
import { listingFormSchema } from "../schema";
import type { ListingFormValues } from "../types";
import { createSlug } from "@/lib/utils";
import { isFieldRequired, purgeHiddenFieldValues } from "@/modules/categories/utils";
import { getFieldsForCategory } from "@/modules/categories/queries";

// Update ke waqt collision check (apni current listing ko chhor kar check karega)
async function generateUniqueSlugForUpdate(
  rawInput: string,
  currentId: number,
): Promise<string> {
  const baseSlug = createSlug(rawInput);

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

    // 1. Fetch existing listing with category information from DB
    const [existingListing] = await db
      .select({
        id: listings.id,
        categoryId: listings.categoryId,
        categoryParentId: categories.parentId,
        details: listings.details,
      })
      .from(listings)
      .leftJoin(categories, eq(listings.categoryId, categories.id))
      .where(eq(listings.id, id))
      .limit(1);

    if (!existingListing) {
      return {
        success: false,
        message: "Listing nahi mili.",
      };
    }

    let finalCategoryId = existingListing.categoryId;
    const isExistingRoot = existingListing.categoryParentId === null;

    if (isExistingRoot) {
      // Listing was assigned directly to a root parent category
      if (data.subCategoryId && data.subCategoryId.trim() !== "") {
        const subCatIdNum = Number(data.subCategoryId);
        // Validate that this subcategory belongs to the existing listing's parent category
        const [validSubCategory] = await db
          .select({
            id: categories.id,
            parentId: categories.parentId,
          })
          .from(categories)
          .where(
            and(
              eq(categories.id, subCatIdNum),
              eq(categories.parentId, existingListing.categoryId),
            ),
          )
          .limit(1);

        if (!validSubCategory) {
          return {
            success: false,
            message: "Selected sub-category does not belong to this category.",
            errors: {
              subCategoryId: ["Invalid sub-category for this parent category"],
            },
          };
        }

        finalCategoryId = validSubCategory.id;
      }
    } else {
      // Listing already had a subcategory assigned:
      // Category and subcategory cannot be changed. Enforce integrity by keeping finalCategoryId as existingListing.categoryId.
      finalCategoryId = existingListing.categoryId;
    }

    // 2. 🛡️ Dynamic Custom Fields DB Verification via Bridge Table & Inheritance
    const dbCategoryFields = await getFieldsForCategory(finalCategoryId, {
      includeInherited: true,
    });

    const existingDetails = (existingListing.details || {}) as Record<
      string,
      any
    >;
    const rawCustomFieldsData = (data.customFields || {}) as Record<string, any>;

    // Merge existing details with updated custom fields
    const candidateDetails = {
      ...existingDetails,
      ...rawCustomFieldsData,
    };

    // Purge hidden fields so stale values from previous answers are removed
    const mergedDetails = purgeHiddenFieldValues(dbCategoryFields, candidateDetails);

    for (const field of dbCategoryFields) {
      if (field.type === "boolean") continue;

      const isRequired = isFieldRequired(
        field,
        mergedDetails,
        true,
        existingDetails,
      );

      if (isRequired) {
        const val = mergedDetails[field.key];
        const isEmpty =
          val === undefined ||
          val === null ||
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === "string" && val.trim() === "") ||
          (field.type === "number" && isNaN(Number(val)));

        if (isEmpty) {
          return {
            success: false,
            message: `${field.label || field.key} bharna lazmi hai.`,
            errors: {
              [`customFields.${field.key}`]: [
                `${field.label || field.key} required hai`,
              ],
            },
          };
        }
      }
    }

    // 3. Slug check
    const finalUniqueSlug = await generateUniqueSlugForUpdate(data.title, id);

    // 4. Business hours format
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

    // 5. Database Main Listing Update
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
        categoryId: finalCategoryId,
        details: mergedDetails,
        businessHours: formattedBusinessHours,
        status: data.status,
        isFeatured: Boolean(data.isFeatured),
        updatedAt: new Date(),
      })
      .where(eq(listings.id, id))
      .returning();

    // 6. 🖼️ IMAGES SYNC LOGIC (Purani vs Nayi Images Handle Karna)
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

    try {
      revalidatePath("/admin/listings");
      revalidatePath(`/admin/listings/${id}/edit`);
      revalidatePath(`/listings/${finalUniqueSlug}`);
    } catch {
      // safe fallback outside Next.js request context
    }

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

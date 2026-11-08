"use server";

import { db } from "@/db";
import {
  listings,
  categories,
  categoryFields,
  listingImages,
} from "@/db/schema";
import { listingFormSchema } from "../schema";
import type { ListingFormValues } from "../schema";
import { eq, or, like, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createSlug } from "@/lib/utils";
import { isFieldRequired, purgeHiddenFieldValues } from "@/modules/categories/utils";

// 🛠️ Helper function jo unique slug guarantee karta hai
async function generateUniqueSlug(rawInput: string): Promise<string> {
  // 1. Text ko clean karke standard slug banayein
  const baseSlug = createSlug(rawInput);

  // 2. Database mein dhoondein ke kya is naam ya prefix se slugs mojood hain
  const existingMatches = await db
    .select({ slug: listings.slug })
    .from(listings)
    .where(like(listings.slug, `${baseSlug}%`));

  if (existingMatches.length === 0) {
    return baseSlug;
  }

  const slugSet = new Set(existingMatches.map((item) => item.slug));

  // Agar exact baseSlug mojood nahi hai toh wahi use karein
  if (!slugSet.has(baseSlug)) {
    return baseSlug;
  }

  // 3. Agar exist karta hai toh counter (-1, -2, ...) barhayein
  let counter = 1;
  let candidateSlug = `${baseSlug}-${counter}`;

  while (slugSet.has(candidateSlug)) {
    counter++;
    candidateSlug = `${baseSlug}-${counter}`;
  }

  return candidateSlug;
}

export async function createListingAction(formData: ListingFormValues) {
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

    // 1. 🛡️ Sub-Category DB Verification
    const childCategories = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.parentId, parentCatId))
      .limit(1);

    if (
      childCategories.length > 0 &&
      (!data.subCategoryId || data.subCategoryId.trim() === "")
    ) {
      return {
        success: false,
        message: "Is category ke liye sub-category select karna lazmi hai.",
        errors: {
          subCategoryId: ["Sub-category select karein"],
        },
      };
    }

    const targetCategoryId = data.subCategoryId
      ? Number(data.subCategoryId)
      : parentCatId;

    // 2. 🛡️ Dynamic Custom Fields DB Verification
    const relevantCategoryIds: number[] = [parentCatId];
    if (data.subCategoryId && data.subCategoryId.trim() !== "") {
      relevantCategoryIds.push(Number(data.subCategoryId));
    }

    const dbCategoryFields = await db
      .select()
      .from(categoryFields)
      .where(
        and(
          eq(categoryFields.isActive, true),
          inArray(categoryFields.categoryId, relevantCategoryIds),
        ),
      );

    // Deduplicate fields by key: subcategory definition takes precedence over parent category
    const subCatId =
      data.subCategoryId && data.subCategoryId.trim() !== ""
        ? Number(data.subCategoryId)
        : null;
    const fieldsMap = new Map<string, typeof categoryFields.$inferSelect>();

    // Process parent category fields first
    for (const field of dbCategoryFields) {
      if (field.categoryId === parentCatId) {
        fieldsMap.set(field.key, field);
      }
    }

    // Overwrite with subcategory fields (child takes precedence)
    if (subCatId) {
      for (const field of dbCategoryFields) {
        if (field.categoryId === subCatId) {
          fieldsMap.set(field.key, field);
        }
      }
    }

    const deduplicatedFields = Array.from(fieldsMap.values());
    const rawCustomFieldsData = (data.customFields || {}) as Record<string, any>;
    // Purge hidden fields so they are never saved or validated on the server
    const customFieldsData = purgeHiddenFieldValues(deduplicatedFields, rawCustomFieldsData);

    for (const field of deduplicatedFields) {
      if (field.type === "boolean") continue;

      const required = isFieldRequired(field, customFieldsData);
      if (required) {
        const val = customFieldsData[field.key];
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

    // 3. 🛡️ Auto Unique Slug Generation (Seedha title se generate hoga)
    const finalUniqueSlug = await generateUniqueSlug(data.title);

    // 4. Business Hours Formatting
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

    // 5. Database Insert
    const [newListing] = await db
      .insert(listings)
      .values({
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
        details: customFieldsData,
        businessHours: formattedBusinessHours,
        status: data.status,
        isFeatured: Boolean(data.isFeatured),
      })
      .returning();

    // 🖼️ 6. Images Insert in listingImages table
    if (data.images && data.images.length > 0) {
      await db.insert(listingImages).values(
        data.images.map((img, index) => ({
          listingId: newListing.id,
          imageUrl: img.url,
          isPrimary: Boolean(img.isCover || index === 0),
          sortOrder: index,
        })),
      );
    }

    try {
      revalidatePath("/admin/listings");
    } catch {
      // safe fallback outside Next.js request context
    }

    return {
      success: true,
      message: "Listing kamyabi se create ho gayi hai!",
      data: newListing,
    };
  } catch (error: any) {
    console.error("CREATE_LISTING_ERROR:", error);

    return {
      success: false,
      message: "Server par listing save karte waqt masla aaya hai.",
    };
  }
}

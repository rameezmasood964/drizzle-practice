// modules/listings/utils/completeness.ts

import { isFieldRequired } from "@/modules/categories/utils";

export interface MissingFieldInfo {
  key: string;
  label: string;
}

export interface ListingCompletenessResult {
  isComplete: boolean;
  missingFields: MissingFieldInfo[];
  missingCount: number;
}

/**
 * Computed health check helper to verify if a listing has all active
 * required dynamic custom fields filled in its details JSONB column.
 */
export function checkListingCompleteness(
  listing: {
    categoryId?: number | null;
    category?: { id: number; parentId?: number | null } | null;
    parentCategory?: { id: number } | null;
    details?: unknown;
  },
  categoryFieldsMap: Record<string, any[]> = {},
): ListingCompletenessResult {
  const targetCatId = listing.category?.id || listing.categoryId;
  if (!targetCatId) {
    return { isComplete: true, missingFields: [], missingCount: 0 };
  }

  const parentCatId =
    listing.category?.parentId || listing.parentCategory?.id || null;

  // 1. Collect fields for target category and parent category
  const targetFields = categoryFieldsMap[String(targetCatId)] || [];
  const parentFields = parentCatId
    ? categoryFieldsMap[String(parentCatId)] || []
    : [];

  // 2. Filter active fields only
  const activeTargetFields = targetFields.filter(
    (f) => f.isActive !== false,
  );
  const activeParentFields = parentFields.filter(
    (f) => f.isActive !== false,
  );

  // 3. Deduplicate by key: child category definitions take precedence over parent
  const fieldsMap = new Map<string, any>();
  for (const field of activeParentFields) {
    fieldsMap.set(field.key, field);
  }
  for (const field of activeTargetFields) {
    fieldsMap.set(field.key, field);
  }

  const relevantFields = Array.from(fieldsMap.values());
  const details = (listing.details || {}) as Record<string, any>;

  const missingFields: MissingFieldInfo[] = [];

  // 4. Verify each required non-boolean field
  for (const field of relevantFields) {
    if (field.type === "boolean") continue;

    if (isFieldRequired(field, details)) {
      const val = details[field.key];
      const isEmpty =
        val === undefined ||
        val === null ||
        (Array.isArray(val) && val.length === 0) ||
        (typeof val === "string" && val.trim() === "") ||
        (field.type === "number" && isNaN(Number(val)));

      if (isEmpty) {
        missingFields.push({
          key: field.key,
          label: field.label || field.name || field.key,
        });
      }
    }
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    missingCount: missingFields.length,
  };
}


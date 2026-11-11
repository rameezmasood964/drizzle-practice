import { db } from "@/db";
import {
  categories,
  categoryFields,
  categoryFieldAssignments,
  type CategoryField,
} from "@/db/schema";
import { eq, isNull, asc, inArray, and, sql } from "drizzle-orm";
import type { CategoryTreeItem } from "./types";

export interface GetCategoriesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export async function getCategories(params?: GetCategoriesParams) {
  try {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.max(1, Number(params?.limit) || 10);
    const search = params?.search?.trim();

    // Fetch all categories for full tree resolution & form dropdowns
    const allCategories = await db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
    });

    if (search) {
      const searchLower = search.toLowerCase();
      const matching = allCategories.filter((c) =>
        c.name.toLowerCase().includes(searchLower),
      );

      const totalCount = matching.length;
      const totalPages = Math.ceil(totalCount / limit) || 1;
      const offset = (page - 1) * limit;
      const data = matching.slice(offset, offset + limit);

      return {
        data,
        allCategories,
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      };
    }

    // Default hierarchy: Paginate root categories, and include their subcategories
    const rootCategories = allCategories.filter((c) => c.parentId === null);
    const totalCount = rootCategories.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedRoots = rootCategories.slice(offset, offset + limit);

    // Iteratively collect all direct and nested descendants belonging to the paginated roots
    const includedCategoryIds = new Set(paginatedRoots.map((r) => r.id));
    let addedNew = true;

    while (addedNew) {
      addedNew = false;
      for (const cat of allCategories) {
        if (
          cat.parentId !== null &&
          includedCategoryIds.has(cat.parentId) &&
          !includedCategoryIds.has(cat.id)
        ) {
          includedCategoryIds.add(cat.id);
          addedNew = true;
        }
      }
    }

    const subCategories = allCategories.filter(
      (c) => c.parentId !== null && includedCategoryIds.has(c.id),
    );

    const data = [...paginatedRoots, ...subCategories];

    return {
      data,
      allCategories,
      totalCount,
      totalPages,
      currentPage: page,
      limit,
    };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return {
      data: [],
      allCategories: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      limit: 10,
    };
  }
}

export async function getCategoryById(categoryId: number) {
  try {
    const data = await db.query.categories.findFirst({
      where: (categories, { eq }) => eq(categories.id, categoryId),
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch category by ID:", error);
    return null;
  }
}

/**
 * Resolves a category by numeric ID, slug, or name.
 * Supports:
 * 1. Numeric ID (e.g. 1 or "1")
 * 2. Exact slug match (e.g. "hostel", "boys_hostels", "policeman-hostel")
 * 3. Case-insensitive name match (e.g. "Hostels", "hostels")
 * 4. Plural / Singular slug fallback (e.g. "hostels" -> "hostel", "hostel" -> "hostels")
 * 5. Hyphen / Underscore slug variation (e.g. "boys-hostels" -> "boys_hostels")
 */
export async function getCategoryByIdOrSlug(identifier: string | number) {
  try {
    if (identifier === null || identifier === undefined) return null;
    const trimmed = String(identifier).trim();
    if (!trimmed) return null;

    const lower = trimmed.toLowerCase();
    const asNumber = Number(trimmed);

    // 1. Numeric ID lookup
    if (!isNaN(asNumber) && Number.isInteger(asNumber) && asNumber > 0) {
      const byId = await db.query.categories.findFirst({
        where: (cats, { eq }) => eq(cats.id, asNumber),
      });
      if (byId) return byId;
    }

    // 2. Exact slug lookup (case-insensitive)
    const bySlug = await db.query.categories.findFirst({
      where: (cats, { eq, sql }) => eq(sql`lower(${cats.slug})`, lower),
    });
    if (bySlug) return bySlug;

    // 3. Exact name lookup (case-insensitive)
    const byName = await db.query.categories.findFirst({
      where: (cats, { eq, sql }) => eq(sql`lower(${cats.name})`, lower),
    });
    if (byName) return byName;

    // 4. Plural / Singular slug fallback
    if (lower.endsWith("s")) {
      const singular = lower.slice(0, -1);
      const bySingular = await db.query.categories.findFirst({
        where: (cats, { eq, sql }) => eq(sql`lower(${cats.slug})`, singular),
      });
      if (bySingular) return bySingular;
    } else {
      const plural = `${lower}s`;
      const byPlural = await db.query.categories.findFirst({
        where: (cats, { eq, sql }) => eq(sql`lower(${cats.slug})`, plural),
      });
      if (byPlural) return byPlural;
    }

    // 5. Hyphen <-> Underscore slug variation
    const altSlug = lower.includes("-")
      ? lower.replace(/-/g, "_")
      : lower.includes("_")
        ? lower.replace(/_/g, "-")
        : null;

    if (altSlug) {
      const byAltSlug = await db.query.categories.findFirst({
        where: (cats, { eq, sql }) => eq(sql`lower(${cats.slug})`, altSlug),
      });
      if (byAltSlug) return byAltSlug;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch category by ID or slug:", error);
    return null;
  }
}

export type CategoryFieldWithInheritance = CategoryField & {
  isInherited?: boolean;
};

/**
 * Fetches active dynamic fields assigned to a specific category via categoryFieldAssignments.
 * Single Source of Truth for category field inheritance:
 * - If target is a Root Category (parentId === null): every field has isInherited: false.
 * - If target is a Subcategory (parentId !== null):
 *     - isInherited: false if directly assigned to this category in categoryFieldAssignments.
 *     - isInherited: true if assigned to parent category and not directly assigned to this category.
 * - Child fields supersede parent fields on key collision.
 */
export async function getFieldsForCategory(
  categoryId: number,
  options?: { includeInherited?: boolean },
): Promise<CategoryFieldWithInheritance[]> {
  try {
    // 1. Fetch target category to inspect its parentId
    const category = await db.query.categories.findFirst({
      where: (cats, { eq }) => eq(cats.id, categoryId),
    });

    if (!category) return [];

    const isRoot = category.parentId === null;
    const parentId = category.parentId;
    const shouldIncludeInherited = Boolean(
      options?.includeInherited && !isRoot && parentId,
    );

    const categoryIds = [categoryId];
    if (shouldIncludeInherited && parentId) {
      categoryIds.push(parentId);
    }

    const rows = await db
      .select({
        assignmentCategoryId: categoryFieldAssignments.categoryId,
        field: categoryFields,
      })
      .from(categoryFieldAssignments)
      .innerJoin(
        categoryFields,
        and(
          eq(categoryFieldAssignments.fieldId, categoryFields.id),
          eq(categoryFields.isActive, true),
        ),
      )
      .where(inArray(categoryFieldAssignments.categoryId, categoryIds))
      .orderBy(asc(categoryFields.sortOrder));

    // Case 1: Target is a Root Category (category.parentId === null) or inheritance not requested
    // Every field returned for this category MUST have isInherited: false. Root categories have no parents and can never inherit fields.
    if (isRoot || !shouldIncludeInherited || !parentId) {
      return rows.map((r) => ({
        ...r.field,
        isInherited: false,
      }));
    }

    // Case 2: Target is a Subcategory (category.parentId !== null) with inheritance enabled
    // A field has isInherited: false if and only if there is a record in category_field_assignments where categoryId === targetCategoryId.
    // A field has isInherited: true only if it exists in category_field_assignments for parentId AND DOES NOT exist for targetCategoryId.
    const directChildFieldKeys = new Set<string>();
    const directChildFieldIds = new Set<number>();

    for (const row of rows) {
      if (row.assignmentCategoryId === categoryId) {
        directChildFieldKeys.add(row.field.key);
        directChildFieldIds.add(row.field.id);
      }
    }

    const uniqueFieldsMap = new Map<string, CategoryFieldWithInheritance>();

    // Step 1: Parent fields (inherited candidates)
    for (const row of rows) {
      if (row.assignmentCategoryId === parentId) {
        const isDirectOnChild =
          directChildFieldIds.has(row.field.id) ||
          directChildFieldKeys.has(row.field.key);

        uniqueFieldsMap.set(row.field.key, {
          ...row.field,
          isInherited: !isDirectOnChild,
        });
      }
    }

    // Step 2: Child fields (strictly direct assignments, isInherited = false)
    for (const row of rows) {
      if (row.assignmentCategoryId === categoryId) {
        uniqueFieldsMap.set(row.field.key, {
          ...row.field,
          isInherited: false,
        });
      }
    }

    return Array.from(uniqueFieldsMap.values()).sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
  } catch (error) {
    console.error("Failed to fetch fields for category:", error);
    return [];
  }
}

/**
 * Returns dynamic fields directly assigned to a category.
 * Backwards-compatible adapter delegating to getFieldsForCategory.
 */
export async function getCategoryFields(
  categoryId: number,
): Promise<CategoryFieldWithInheritance[]> {
  return getFieldsForCategory(categoryId, { includeInherited: false });
}

/**
 * Returns dynamic fields with parent inheritance.
 * Backwards-compatible adapter delegating to getFieldsForCategory.
 */
export async function getCategoryFieldsWithInheritance(
  categoryId: number,
): Promise<CategoryFieldWithInheritance[]> {
  return getFieldsForCategory(categoryId, { includeInherited: true });
}

/**
 * Helper to fetch all category IDs currently assigned to a specific field.
 * Used in Admin Field Builder to populate multi-category assignment checkboxes.
 */
export async function getAssignedCategoryIdsByFieldId(fieldId: number): Promise<number[]> {
  try {
    const rows = await db
      .select({ categoryId: categoryFieldAssignments.categoryId })
      .from(categoryFieldAssignments)
      .where(eq(categoryFieldAssignments.fieldId, fieldId));

    return rows.map((r) => r.categoryId);
  } catch (error) {
    console.error("Failed to fetch assigned category IDs for field:", error);
    return [];
  }
}



export async function getCategoriesWithSubcategories() {
  try {
    // 1. Saari categories database se mangwao
    const allCategories = await db.query.categories.findMany({
      where: (categories, { eq }) => eq(categories.isActive, true),
      orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
    });

    // 2. Wo nikalo jinka koi parent nahi hai (Main Categories)
    const parents = allCategories.filter((cat) => !cat.parentId);

    // 3. Har Main Category ke andar uske bachon (Subcategories) ki list daal do
    const result = parents.map((parent) => ({
      id: String(parent.id),
      name: parent.name,
      slug: parent.slug,
      subCategories: allCategories
        .filter((child) => child.parentId === parent.id)
        .map((child) => ({
          id: String(child.id),
          name: child.name,
          slug: child.slug,
          categoryId: String(parent.id),
        })),
    }));

    return result;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}





/**
 * Pre-fetch Props Map:
 * Fetches all active custom fields mapped via categoryFieldAssignments
 * and groups them by categoryId.
 * Output: { "1": [fields...], "2": [fields...] }
 */
export async function getAllCategoryFieldsMap(): Promise<Record<string, CategoryField[]>> {
  try {
    const assignments = await db
      .select({
        categoryId: categoryFieldAssignments.categoryId,
        field: categoryFields,
      })
      .from(categoryFieldAssignments)
      .innerJoin(
        categoryFields,
        and(
          eq(categoryFieldAssignments.fieldId, categoryFields.id),
          eq(categoryFields.isActive, true),
        ),
      )
      .orderBy(asc(categoryFields.sortOrder));

    const fieldsMap: Record<string, CategoryField[]> = {};

    for (const row of assignments) {
      const key = String(row.categoryId);
      if (!fieldsMap[key]) {
        fieldsMap[key] = [];
      }
      fieldsMap[key].push(row.field);
    }

    return fieldsMap;
  } catch (error) {
    console.error("Failed to fetch all category fields map:", error);
    return {};
  }
}

/**
 * Root/Parent categories fetcher for dropdown filters and listings dashboard
 */
export async function getRootCategories() {
  try {
    return await db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(isNull(categories.parentId))
      .orderBy(asc(categories.name));
  } catch (error) {
    console.error("GET_ROOT_CATEGORIES_ERROR:", error);
    return [];
  }
}

/**
 * Returns active category hierarchy structured as parents with subcategories.
 * Used by CategoryAssignmentSelector in the Admin Field Builder.
 */
export async function getCategoriesHierarchy(): Promise<CategoryTreeItem[]> {
  try {
    const all = await db.query.categories.findMany({
      where: (cats, { eq }) => eq(cats.isActive, true),
      orderBy: (cats, { asc }) => [asc(cats.sortOrder), asc(cats.name)],
    });

    const parents = all.filter((c) => !c.parentId);
    const children = all.filter((c) => c.parentId !== null);

    const parentIds = new Set(parents.map((p) => p.id));

    const result: CategoryTreeItem[] = parents.map((parent) => {
      // Direct children
      const directChildren = children.filter((c) => c.parentId === parent.id);
      const directChildIds = new Set(directChildren.map((c) => c.id));
      
      // Also collect any deeper nested descendants under this parent
      const subChildren = children.filter(
        (c) => c.parentId !== null && directChildIds.has(c.parentId),
      );

      const allSub = [...directChildren, ...subChildren].map((sub) => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        parentId: sub.parentId ?? undefined,
      }));

      return {
        id: parent.id,
        name: parent.name,
        slug: parent.slug,
        parentId: null,
        subCategories: allSub,
      };
    });

    // In case there are orphan active categories whose parent is inactive or missing
    const orphanChildren = children.filter(
      (c) => !parentIds.has(c.parentId!) && !children.some((ch) => ch.id === c.parentId),
    );

    for (const orphan of orphanChildren) {
      result.push({
        id: orphan.id,
        name: orphan.name,
        slug: orphan.slug,
        parentId: null,
        subCategories: [],
      });
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch categories hierarchy:", error);
    return [];
  }
}

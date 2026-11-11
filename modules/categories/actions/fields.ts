"use server";

import { db } from "@/db";
import { revalidatePath } from "next/cache";

function safeRevalidatePath(path: string, type?: "page" | "layout") {
  try {
    revalidatePath(path, type);
  } catch {
    // Graceful fallback when executed outside Next.js request context
  }
}

import { z } from "zod";
import {
  categoryFields,
  categories,
  categoryFieldAssignments,
} from "@/db/schema";
import { and, eq, sql, inArray } from "drizzle-orm";
import { canFieldDependOn } from "../utils";
import {
  getAssignedCategoryIdsByFieldId,
  getCategoriesHierarchy,
} from "../queries";
import type { CategoryTreeItem } from "../types";

// Schema for creating category field with multi-category assignments
const createCategoryFieldSchema = z
  .object({
    categoryId: z.number().int().positive("Invalid category ID").optional(),
    categoryIds: z
      .array(z.number().int().positive())
      .min(1, "Kam az kam aik category select karein")
      .optional(),
    label: z.string().min(1, "Field Label zaroori hai").max(100),
    key: z
      .string()
      .min(1, "Field Key zaroori hai")
      .max(50)
      .regex(
        /^[a-z0-9_]+$/,
        "Key sirf lowercase letters, numbers aur underscores par mushtamil ho",
      ),
    type: z.enum([
      "text",
      "number",
      "textarea",
      "select",
      "multiselect",
      "boolean",
    ]),
    options: z.array(z.string().trim().min(1)).nullable().optional(),
    placeholder: z.string().nullable().optional(),
    helpText: z.string().nullable().optional(),
    isRequired: z.boolean().default(false),
    isFilterable: z.boolean().default(false),
    // Conditional Visibility fields
    dependsOnFieldKey: z.string().trim().nullable().optional(),
    conditionOperator: z
      .enum(["equals", "not_equals", "is_not_empty", "contains"])
      .default("equals")
      .nullable()
      .optional(),
    conditionValue: z.string().trim().nullable().optional(),
    requiredIfVisible: z.boolean().default(false).optional(),
  })
  .superRefine((data, ctx) => {
    const hasCategory =
      (data.categoryIds && data.categoryIds.length > 0) ||
      (data.categoryId !== undefined && data.categoryId !== null);
    if (!hasCategory) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Kam az kam aik category select karein.",
        path: ["categoryIds"],
      });
    }

    if (data.type === "select" || data.type === "multiselect") {
      const validOptions = (data.options || []).filter(
        (opt) => typeof opt === "string" && opt.trim().length > 0,
      );
      if (validOptions.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Select aur Multiselect fields ke liye kam az kam 1 option lazmi hai.",
          path: ["options"],
        });
      }
    }

    if (data.dependsOnFieldKey && data.dependsOnFieldKey.trim() !== "") {
      if (data.dependsOnFieldKey.trim() === data.key.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Field cannot depend on itself.",
          path: ["dependsOnFieldKey"],
        });
      }
      if (data.conditionOperator !== "is_not_empty") {
        if (!data.conditionValue || data.conditionValue.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Condition value select karna zaroori hai.",
            path: ["conditionValue"],
          });
        }
      }
    }
  });

export type myCustom = z.infer<typeof createCategoryFieldSchema>;

export async function createCategoriesField(input: myCustom) {
  try {
    const result = createCategoryFieldSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message || "Validation failed",
      };
    }

    const data = result.data;

    // Resolve target category IDs
    const rawTargetIds = Array.from(
      new Set(
        data.categoryIds && data.categoryIds.length > 0
          ? data.categoryIds
          : data.categoryId
          ? [data.categoryId]
          : [],
      ),
    );

    if (rawTargetIds.length === 0) {
      return {
        success: false,
        error: "Kam az kam aik category select karein.",
      };
    }

    // Canonical ID Ordering: Root/Parent category IDs take precedence for legacy categoryId column
    const targetCategoryRecords = await db.query.categories.findMany({
      where: inArray(categories.id, rawTargetIds),
    });

    const targetCatMap = new Map(targetCategoryRecords.map((c) => [c.id, c]));
    const targetCategoryIds = [...rawTargetIds].sort((a, b) => {
      const aIsRoot = targetCatMap.get(a)?.parentId === null ? 0 : 1;
      const bIsRoot = targetCatMap.get(b)?.parentId === null ? 0 : 1;
      return aIsRoot - bIsRoot;
    });

    // Check duplicate key across assigned target categories
    const existingKeyAssignments = await db
      .select({
        categoryId: categoryFieldAssignments.categoryId,
        categoryName: categories.name,
      })
      .from(categoryFieldAssignments)
      .innerJoin(
        categoryFields,
        and(
          eq(categoryFieldAssignments.fieldId, categoryFields.id),
          eq(categoryFields.isActive, true),
          eq(categoryFields.key, data.key),
        ),
      )
      .innerJoin(
        categories,
        eq(categoryFieldAssignments.categoryId, categories.id),
      )
      .where(inArray(categoryFieldAssignments.categoryId, targetCategoryIds));

    if (existingKeyAssignments.length > 0) {
      return {
        success: false,
        error: `Yeh Field Key pehle se "${existingKeyAssignments[0].categoryName}" category mein moojood hai.`,
      };
    }

    // Dynamic sort order calculation across selected categories
    const [maxOrderResult] = await db
      .select({
        maxOrder: sql<number>`COALESCE(MAX(${categoryFields.sortOrder}), -1)::int`,
      })
      .from(categoryFields)
      .innerJoin(
        categoryFieldAssignments,
        eq(categoryFields.id, categoryFieldAssignments.fieldId),
      )
      .where(inArray(categoryFieldAssignments.categoryId, targetCategoryIds));

    const nextSortOrder = (maxOrderResult?.maxOrder ?? -1) + 1;

    // Validate conditional dependency & cycle check if enabled
    let finalDependsOnKey: string | null = null;
    let finalConditionOperator: string | null = null;
    let finalConditionValue: string | null = null;
    let finalRequiredIfVisible = false;

    if (data.dependsOnFieldKey && data.dependsOnFieldKey.trim() !== "") {
      const controllingKey = data.dependsOnFieldKey.trim();

      // Collect parents of target categories for inheritance scope
      const relevantScopeCatIds = new Set<number>(targetCategoryIds);
      for (const cat of targetCategoryRecords) {
        if (cat.parentId) {
          relevantScopeCatIds.add(cat.parentId);
        }
      }

      const assignedFieldsInScope = await db
        .select({ field: categoryFields })
        .from(categoryFieldAssignments)
        .innerJoin(
          categoryFields,
          and(
            eq(categoryFieldAssignments.fieldId, categoryFields.id),
            eq(categoryFields.isActive, true),
          ),
        )
        .where(
          inArray(
            categoryFieldAssignments.categoryId,
            Array.from(relevantScopeCatIds),
          ),
        );

      const allCategoryFields = assignedFieldsInScope.map((r) => r.field);

      const controllingField = allCategoryFields.find(
        (f) => f.key.trim().toLowerCase() === controllingKey.toLowerCase(),
      );

      if (!controllingField) {
        return {
          success: false,
          error:
            "Selected controlling field is not found in the selected categories or parent categories.",
        };
      }

      if (!canFieldDependOn(data.key, controllingKey, allCategoryFields)) {
        return {
          success: false,
          error:
            "Circular dependency detected: Field cannot depend on this field.",
        };
      }

      finalDependsOnKey = controllingField.key;
      finalConditionOperator = data.conditionOperator || "equals";
      finalConditionValue =
        data.conditionOperator === "is_not_empty"
          ? null
          : data.conditionValue?.trim() || null;
      finalRequiredIfVisible = Boolean(data.requiredIfVisible);
    }

    // Transactional persistence: insert category_fields and synchronize categoryFieldAssignments
    const createdFieldId = await db.transaction(async (tx) => {
      // 1. Insert into category_fields
      const [newField] = await tx
        .insert(categoryFields)
        .values({
          categoryId: targetCategoryIds[0], // canonical reference for backwards compatibility
          key: data.key,
          label: data.label.trim(),
          type: data.type,
          isRequired: data.isRequired,
          isFilterable: data.isFilterable,
          options:
            data.options && data.options.length > 0 ? data.options : null,
          placeholder: data.placeholder?.trim() || null,
          helpText: data.helpText?.trim() || null,
          sortOrder: nextSortOrder,
          isActive: true,
          dependsOnFieldKey: finalDependsOnKey,
          conditionOperator: finalConditionOperator,
          conditionValue: finalConditionValue,
          requiredIfVisible: finalRequiredIfVisible,
        })
        .returning({ id: categoryFields.id });

      // 2. Insert assignments for all target category IDs
      const assignments = targetCategoryIds.map((cId) => ({
        fieldId: newField.id,
        categoryId: cId,
      }));

      await tx.insert(categoryFieldAssignments).values(assignments);

      return newField.id;
    });

    // Revalidate paths for all affected categories
    for (const cId of targetCategoryIds) {
      safeRevalidatePath(`/admin/categories/${cId}/fields`);
    }
    safeRevalidatePath("/admin/categories/[id]/fields", "page");
    safeRevalidatePath("/admin/categories");
    safeRevalidatePath("/categories");
    safeRevalidatePath("/explore");

    return {
      success: true,
      message: "Field kamyabi se add ho gayi!",
      fieldId: createdFieldId,
    };
  } catch (error: any) {
    console.error("Failed to create category field:", error);

    const pgError = error.cause || error;
    const errorCode = pgError.code || error.code;
    const errorDetail = (
      pgError.detail ||
      pgError.message ||
      error.message ||
      ""
    ).toLowerCase();

    console.log("Extracted Error Code in field:", errorCode);
    console.log("Extracted Error Detail in field:", errorDetail);
    if (errorCode === "23505") {
      return {
        success: false,
        error: "Yeh Field Key pehle se kisi category mein moojood hai.",
      };
    }

    return {
      success: false,
      error: "Field save nahi ho saki. Dobara koshish karein.",
    };
  }
}

// Delete field action
export async function deleteField(fieldId: number, categoryId: number) {
  try {
    // 1. Check if assignment exists in junction table
    const assignment = await db.query.categoryFieldAssignments.findFirst({
      where: and(
        eq(categoryFieldAssignments.fieldId, fieldId),
        eq(categoryFieldAssignments.categoryId, categoryId),
      ),
    });

    if (assignment) {
      // Remove assignment for this category
      await db
        .delete(categoryFieldAssignments)
        .where(
          and(
            eq(categoryFieldAssignments.fieldId, fieldId),
            eq(categoryFieldAssignments.categoryId, categoryId),
          ),
        );

      // Check if any other category assignments remain for this field
      const remainingAssignments =
        await db.query.categoryFieldAssignments.findFirst({
          where: eq(categoryFieldAssignments.fieldId, fieldId),
        });

      if (!remainingAssignments) {
        // If no categories reference this field, soft-deactivate the field record
        await db
          .update(categoryFields)
          .set({ isActive: false })
          .where(eq(categoryFields.id, fieldId));
      }

      // Cascade delete: If this field has dependent fields, remove their assignments for this categoryId
      const targetField = await db.query.categoryFields.findFirst({
        where: eq(categoryFields.id, fieldId),
      });

      if (targetField) {
        const dependentFields = await db.query.categoryFields.findMany({
          where: and(
            eq(categoryFields.dependsOnFieldKey, targetField.key),
            eq(categoryFields.isActive, true),
          ),
        });

        if (dependentFields.length > 0) {
          const depIds = dependentFields.map((d) => d.id);
          await db
            .delete(categoryFieldAssignments)
            .where(
              and(
                inArray(categoryFieldAssignments.fieldId, depIds),
                eq(categoryFieldAssignments.categoryId, categoryId),
              ),
            );

          for (const depId of depIds) {
            const hasRemaining =
              await db.query.categoryFieldAssignments.findFirst({
                where: eq(categoryFieldAssignments.fieldId, depId),
              });
            if (!hasRemaining) {
              await db
                .update(categoryFields)
                .set({ isActive: false })
                .where(eq(categoryFields.id, depId));
            }
          }
        }
      }
    } else {
      // Fallback for legacy records without assignments row
      const existingField = await db.query.categoryFields.findFirst({
        where: eq(categoryFields.id, fieldId),
      });

      if (!existingField) {
        return {
          success: false,
          error:
            "Field nahi mili ya aapke paas isay delete karne ki ijazat nahi hai.",
        };
      }

      await db
        .update(categoryFields)
        .set({ isActive: false })
        .where(eq(categoryFields.id, fieldId));
    }

    safeRevalidatePath(`/admin/categories/${categoryId}/fields`);
    safeRevalidatePath("/admin/categories/[id]/fields", "page");
    safeRevalidatePath("/admin/categories");
    safeRevalidatePath("/categories");
    safeRevalidatePath("/explore");

    return {
      success: true,
      message: "Field kamyabi se delete ho gayi.",
    };
  } catch (error) {
    console.error("Delete field error:", error);
    return {
      success: false,
      error: "Field delete nahi ho saki. Dobara koshish karein.",
    };
  }
}

const updateCategoryFieldSchema = z
  .object({
    categoryIds: z
      .array(z.number().int().positive())
      .min(1, "Kam az kam aik category select karein")
      .optional(),
    label: z.string().min(1, "Field Label zaroori hai").max(100),
    options: z.array(z.string()).nullable().optional(),
    placeholder: z.string().nullable().optional(),
    helpText: z.string().nullable().optional(),
    isRequired: z.boolean().default(false),
    isFilterable: z.boolean().default(false),
    // Conditional Visibility fields
    dependsOnFieldKey: z.string().trim().nullable().optional(),
    conditionOperator: z
      .enum(["equals", "not_equals", "is_not_empty", "contains"])
      .default("equals")
      .nullable()
      .optional(),
    conditionValue: z.string().trim().nullable().optional(),
    requiredIfVisible: z.boolean().default(false).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.dependsOnFieldKey && data.dependsOnFieldKey.trim() !== "") {
      if (data.conditionOperator !== "is_not_empty") {
        if (!data.conditionValue || data.conditionValue.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Condition value select karna zaroori hai.",
            path: ["conditionValue"],
          });
        }
      }
    }
  });

export type UpdateCategoryFieldInput = z.infer<
  typeof updateCategoryFieldSchema
>;

export async function updateCategoryFields(
  fieldId: number,
  categoryId: number,
  input: UpdateCategoryFieldInput,
) {
  try {
    const result = updateCategoryFieldSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message || "Validation failed",
      };
    }

    const data = result.data;

    // Verify existing field
    const existingField = await db.query.categoryFields.findFirst({
      where: eq(categoryFields.id, fieldId),
    });

    if (!existingField) {
      return {
        success: false,
        error: "Field nahi mili.",
      };
    }

    if (
      existingField.type === "select" ||
      existingField.type === "multiselect"
    ) {
      const validOptions = (data.options || []).filter(
        (opt) => typeof opt === "string" && opt.trim().length > 0,
      );
      if (validOptions.length === 0) {
        return {
          success: false,
          error:
            "Select aur Multiselect fields ke liye kam az kam 1 option lazmi hai.",
        };
      }
    }

    // Resolve target category IDs
    const rawTargetIds = Array.from(
      new Set(
        data.categoryIds && data.categoryIds.length > 0
          ? data.categoryIds
          : categoryId
          ? [categoryId]
          : [],
      ),
    );

    if (rawTargetIds.length === 0) {
      return {
        success: false,
        error: "Kam az kam aik category select karein.",
      };
    }

    // Canonical ID Ordering: Root/Parent category IDs take precedence for legacy categoryId column
    const targetCategoryRecords = await db.query.categories.findMany({
      where: inArray(categories.id, rawTargetIds),
    });

    const targetCatMap = new Map(targetCategoryRecords.map((c) => [c.id, c]));
    const targetCategoryIds = [...rawTargetIds].sort((a, b) => {
      const aIsRoot = targetCatMap.get(a)?.parentId === null ? 0 : 1;
      const bIsRoot = targetCatMap.get(b)?.parentId === null ? 0 : 1;
      return aIsRoot - bIsRoot;
    });

    // Check for key collision with other fields in the target categories
    const keyCollisions = await db
      .select({
        categoryName: categories.name,
      })
      .from(categoryFieldAssignments)
      .innerJoin(
        categoryFields,
        and(
          eq(categoryFieldAssignments.fieldId, categoryFields.id),
          eq(categoryFields.isActive, true),
          eq(categoryFields.key, existingField.key),
        ),
      )
      .innerJoin(
        categories,
        eq(categoryFieldAssignments.categoryId, categories.id),
      )
      .where(
        and(
          inArray(categoryFieldAssignments.categoryId, targetCategoryIds),
          sql`${categoryFieldAssignments.fieldId} != ${fieldId}`,
        ),
      );

    if (keyCollisions.length > 0) {
      return {
        success: false,
        error: `Yeh Field Key pehle se "${keyCollisions[0].categoryName}" category mein kisi doosri field ke tor par moojood hai.`,
      };
    }

    // Validate conditional dependency & cycle check if enabled
    let finalDependsOnKey: string | null = null;
    let finalConditionOperator: string | null = null;
    let finalConditionValue: string | null = null;
    let finalRequiredIfVisible = false;

    if (data.dependsOnFieldKey && data.dependsOnFieldKey.trim() !== "") {
      const controllingKey = data.dependsOnFieldKey.trim();

      const relevantScopeCatIds = new Set<number>(targetCategoryIds);
      for (const cat of targetCategoryRecords) {
        if (cat.parentId) {
          relevantScopeCatIds.add(cat.parentId);
        }
      }

      const assignedFieldsInScope = await db
        .select({ field: categoryFields })
        .from(categoryFieldAssignments)
        .innerJoin(
          categoryFields,
          and(
            eq(categoryFieldAssignments.fieldId, categoryFields.id),
            eq(categoryFields.isActive, true),
          ),
        )
        .where(
          inArray(
            categoryFieldAssignments.categoryId,
            Array.from(relevantScopeCatIds),
          ),
        );

      const allCategoryFields = assignedFieldsInScope.map((r) => r.field);

      const controllingField = allCategoryFields.find(
        (f) => f.key.trim().toLowerCase() === controllingKey.toLowerCase(),
      );

      if (!controllingField) {
        return {
          success: false,
          error:
            "Selected controlling field is not found in the selected categories or parent categories.",
        };
      }

      if (
        !canFieldDependOn(existingField.key, controllingKey, allCategoryFields)
      ) {
        return {
          success: false,
          error:
            "Circular dependency detected: Field cannot depend on this field.",
        };
      }

      finalDependsOnKey = controllingField.key;
      finalConditionOperator = data.conditionOperator || "equals";
      finalConditionValue =
        data.conditionOperator === "is_not_empty"
          ? null
          : data.conditionValue?.trim() || null;
      finalRequiredIfVisible = Boolean(data.requiredIfVisible);
    }

    // Transaction: update category_fields and synchronize categoryFieldAssignments
    let allAffectedCategoryIds: number[] = [];

    await db.transaction(async (tx) => {
      // 1. Update the record in category_fields
      await tx
        .update(categoryFields)
        .set({
          label: data.label.trim(),
          placeholder: data.placeholder?.trim() || null,
          helpText: data.helpText?.trim() || null,
          options:
            data.options && data.options.length > 0 ? data.options : null,
          isRequired: data.isRequired,
          isFilterable: data.isFilterable,
          dependsOnFieldKey: finalDependsOnKey,
          conditionOperator: finalConditionOperator,
          conditionValue: finalConditionValue,
          requiredIfVisible: finalRequiredIfVisible,
          ...(targetCategoryIds.length > 0
            ? { categoryId: targetCategoryIds[0] }
            : {}),
        })
        .where(eq(categoryFields.id, fieldId));

      // 2. Synchronize rows in category_field_assignments
      const currentRows = await tx
        .select({ categoryId: categoryFieldAssignments.categoryId })
        .from(categoryFieldAssignments)
        .where(eq(categoryFieldAssignments.fieldId, fieldId));

      const currentIds = currentRows.map((r) => r.categoryId);
      const currentSet = new Set(currentIds);
      const targetSet = new Set(targetCategoryIds);

      allAffectedCategoryIds = Array.from(
        new Set([...currentIds, ...targetCategoryIds, categoryId]),
      );

      // IDs to insert (newly checked)
      const toInsert = targetCategoryIds.filter((id) => !currentSet.has(id));
      // IDs to delete (unchecked)
      const toDelete = currentIds.filter((id) => !targetSet.has(id));

      if (toDelete.length > 0) {
        await tx
          .delete(categoryFieldAssignments)
          .where(
            and(
              eq(categoryFieldAssignments.fieldId, fieldId),
              inArray(categoryFieldAssignments.categoryId, toDelete),
            ),
          );
      }

      if (toInsert.length > 0) {
        await tx.insert(categoryFieldAssignments).values(
          toInsert.map((cId) => ({
            fieldId,
            categoryId: cId,
          })),
        );
      }

      // 3. Cascade Category Sync for Dependent Fields
      // When a controlling field's category assignments change, all fields that depend on its key
      // must automatically inherit the exact same category assignments to prevent orphaned conditions.
      const allDependentFieldIds: number[] = [];
      const keysToCheck = [existingField.key];

      while (keysToCheck.length > 0) {
        const currentBatchKeys = [...keysToCheck];
        keysToCheck.length = 0;

        const childFields = await tx
          .select({ id: categoryFields.id, key: categoryFields.key })
          .from(categoryFields)
          .where(
            and(
              inArray(categoryFields.dependsOnFieldKey, currentBatchKeys),
              eq(categoryFields.isActive, true),
            ),
          );

        for (const child of childFields) {
          if (!allDependentFieldIds.includes(child.id)) {
            allDependentFieldIds.push(child.id);
            keysToCheck.push(child.key);
          }
        }
      }

      if (allDependentFieldIds.length > 0 && targetCategoryIds.length > 0) {
        // Delete existing assignments for all dependent fields
        await tx
          .delete(categoryFieldAssignments)
          .where(inArray(categoryFieldAssignments.fieldId, allDependentFieldIds));

        // Insert new assignments matching targetCategoryIds
        const newDependentAssignments: { fieldId: number; categoryId: number }[] = [];
        for (const depId of allDependentFieldIds) {
          for (const cId of targetCategoryIds) {
            newDependentAssignments.push({
              fieldId: depId,
              categoryId: cId,
            });
          }
        }

        if (newDependentAssignments.length > 0) {
          await tx
            .insert(categoryFieldAssignments)
            .values(newDependentAssignments);
        }

        // Update legacy categoryId column for all dependent fields to match canonical category
        await tx
          .update(categoryFields)
          .set({ categoryId: targetCategoryIds[0] })
          .where(inArray(categoryFields.id, allDependentFieldIds));
      }
    });

    // Cache refresh for all affected categories
    for (const cId of allAffectedCategoryIds) {
      safeRevalidatePath(`/admin/categories/${cId}/fields`);
    }
    safeRevalidatePath("/admin/categories/[id]/fields", "page");
    safeRevalidatePath("/admin/categories");
    safeRevalidatePath("/categories");
    safeRevalidatePath("/explore");

    return {
      success: true,
      message: "Field kamyabi se update ho gayi.",
    };
  } catch (error) {
    console.error("Update field error:", error);
    return {
      success: false,
      error: "Field update nahi ho saki. Dobara koshish karein.",
    };
  }
}

/**
 * Server Action helper to fetch assigned category IDs for a field.
 * Used when opening the Field Builder in edit mode.
 */
export async function getAssignedCategoryIdsAction(
  fieldId: number,
): Promise<number[]> {
  try {
    return await getAssignedCategoryIdsByFieldId(fieldId);
  } catch (error) {
    console.error("Failed to fetch field assigned category IDs:", error);
    return [];
  }
}

/**
 * Server Action helper to fetch full category hierarchy.
 */
export async function getCategoriesHierarchyAction(): Promise<
  CategoryTreeItem[]
> {
  try {
    return await getCategoriesHierarchy();
  } catch (error) {
    console.error("Failed to fetch category hierarchy action:", error);
    return [];
  }
}

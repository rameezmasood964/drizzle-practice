"use client";

import { useEffect, useMemo } from "react";
import { FolderTree, Lock, Sparkles } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ListingFormValues } from "@/modules/listings/types";

interface SubCategory {
  id: string | number;
  name: string;
  slug?: string;
  parentId?: string | number;
  categoryId?: string | number;
}

interface Category {
  id: string | number;
  name: string;
  slug?: string;
  subCategories?: SubCategory[];
  subcategories?: SubCategory[]; // Dono naming conventions safe handling
}

interface CategorySectionProps {
  categories?: Category[];
  isEditing?: boolean;
  initialSubCategoryId?: string | number | null;
}

const CategorySection = ({
  categories = [],
  isEditing = false,
  initialSubCategoryId = "",
}: CategorySectionProps) => {
  const {
    control,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<ListingFormValues>();

  const selectedCategoryId = watch("categoryId");
  const selectedSubCategoryId = watch("subCategoryId");

  // Selected parent category ke subCategories nikaalna (safe check for both keys)
  const availableSubCategories = useMemo(() => {
    if (!selectedCategoryId) return [];
    const parent = categories.find(
      (c) => String(c.id) === String(selectedCategoryId),
    );
    return parent?.subCategories || parent?.subcategories || [];
  }, [selectedCategoryId, categories]);

  const hasSubCategories = availableSubCategories.length > 0;

  // Did the listing originally have a subcategory assigned?
  const hadInitialSubCategory = Boolean(
    initialSubCategoryId && String(initialSubCategoryId).trim() !== "",
  );

  // Can the user edit the subcategory?
  // - In CREATE mode: Yes, always (when subcategories exist).
  // - In EDIT mode: Only if it had NO subcategory originally AND the category now has subcategories.
  const canEditSubCategory =
    !isEditing || (!hadInitialSubCategory && hasSubCategories);

  // Auto-clear/sync effect
  useEffect(() => {
    if (isEditing && !canEditSubCategory) return;

    if (selectedCategoryId) {
      if (!hasSubCategories) {
        setValue("subCategoryId", "");
        clearErrors("subCategoryId");
      } else {
        const exists = availableSubCategories.some(
          (sub) => String(sub.id) === String(selectedSubCategoryId),
        );
        if (!exists && selectedSubCategoryId) {
          setValue("subCategoryId", "");
        }
      }
    }
  }, [
    isEditing,
    canEditSubCategory,
    selectedCategoryId,
    hasSubCategories,
    availableSubCategories,
    selectedSubCategoryId,
    setValue,
    clearErrors,
  ]);

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <FolderTree className="h-4 w-4 text-primary" />
            Category
          </CardTitle>
          {isEditing && (
            <span className="flex items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              <Lock className="h-3 w-3" />{" "}
              {canEditSubCategory ? "Category Locked" : "Locked"}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 1. Main Category (Always locked on edit) */}
        <div className="space-y-1.5">
          <Label htmlFor="categoryId" className="text-sm font-medium">
            Category <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(val) => {
                  if (!isEditing) {
                    field.onChange(val);
                  }
                }}
                disabled={isEditing}
              >
                <SelectTrigger
                  id="categoryId"
                  disabled={isEditing}
                  className={`bg-background ${
                    isEditing
                      ? "pointer-events-none cursor-not-allowed bg-muted/60 opacity-80"
                      : ""
                  } ${
                    errors.categoryId
                      ? "border-destructive ring-1 ring-destructive"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && (
            <p className="text-xs text-destructive">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        {/* 2. Sub-category (Conditionally unlocked if unassigned) */}
        <div className="space-y-1.5">
          <Label htmlFor="subCategoryId" className="text-sm font-medium">
            Sub-category{" "}
            {hasSubCategories && !isEditing && (
              <span className="text-destructive">*</span>
            )}
            {isEditing && canEditSubCategory && (
              <span className="text-xs font-normal text-muted-foreground">
                (Optional)
              </span>
            )}
          </Label>
          <Controller
            control={control}
            name="subCategoryId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(val) => {
                  if (canEditSubCategory) {
                    field.onChange(val);
                  }
                }}
                disabled={
                  !canEditSubCategory || !selectedCategoryId || !hasSubCategories
                }
              >
                <SelectTrigger
                  id="subCategoryId"
                  disabled={
                    !canEditSubCategory || !selectedCategoryId || !hasSubCategories
                  }
                  className={`bg-background ${
                    !canEditSubCategory
                      ? "pointer-events-none cursor-not-allowed bg-muted/60 opacity-80"
                      : ""
                  } ${
                    errors.subCategoryId && hasSubCategories
                      ? "border-destructive ring-1 ring-destructive"
                      : ""
                  }`}
                >
                  <SelectValue
                    placeholder={
                      !selectedCategoryId
                        ? "Select category first"
                        : !hasSubCategories
                          ? "No sub-categories available"
                          : "Select Sub-category"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSubCategories.map((sub) => (
                    <SelectItem key={sub.id} value={String(sub.id)}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Edit status hints */}
          {isEditing && canEditSubCategory && (
            <div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>New subcategories available. You can assign one now.</span>
            </div>
          )}

          {isEditing && !canEditSubCategory && (
            <p className="text-[11px] text-muted-foreground">
              Dynamic schema integrity ke liye category change lock hai.
            </p>
          )}

          {errors.subCategoryId && hasSubCategories && !isEditing && (
            <p className="text-xs text-destructive">
              {errors.subCategoryId.message as string}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategorySection;

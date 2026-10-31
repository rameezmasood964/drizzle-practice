"use client";

import { useMemo } from "react";
import { Layers } from "lucide-react";
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
import type { ListingFormValues, Category } from "@/modules/listings/types";

interface CategorySectionProps {
  categories?: Category[];
}

const CategorySection = ({ categories = [] }: CategorySectionProps) => {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ListingFormValues>();

  const selectedCategoryId = watch("categoryId");

  const currentCategory = useMemo(() => {
    return categories.find((cat) => String(cat.id) === String(selectedCategoryId));
  }, [categories, selectedCategoryId]);

  const subCategories = currentCategory?.subCategories || [];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Layers className="h-4 w-4 text-primary" />
          Category
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Category */}
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
                  field.onChange(val);
                  setValue("subCategoryId", "", { shouldValidate: true });
                }}
              >
                <SelectTrigger
                  id="categoryId"
                  className={`bg-background ${errors.categoryId ? "border-destructive focus:ring-destructive" : ""}`}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No categories available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && (
            <p className="text-xs text-destructive">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Sub-category */}
        <div className="space-y-1.5">
          <Label htmlFor="subCategoryId" className="text-sm font-medium">
            Sub-category <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={control}
            name="subCategoryId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={field.onChange}
                disabled={!selectedCategoryId || subCategories.length === 0}
              >
                <SelectTrigger
                  id="subCategoryId"
                  className={`bg-background ${
                    errors.subCategoryId ? "border-destructive focus:ring-destructive" : ""
                  }`}
                >
                  <SelectValue
                    placeholder={
                      !selectedCategoryId
                        ? "Select category first"
                        : subCategories.length === 0
                        ? "No sub-categories available"
                        : "Select a sub-category"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {subCategories.map((sub) => (
                    <SelectItem key={sub.id} value={String(sub.id)}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Select a category first to see matching sub-categories
          </p>
          {errors.subCategoryId && (
            <p className="text-xs text-destructive">{errors.subCategoryId.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategorySection;
"use client";

import { useMemo } from "react";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ListingFormValues } from "@/modules/listings/types";

interface CustomFieldsSectionProps {
  categoryFieldsMap?: Record<string, any[]>;
}

const CustomFieldsSection = ({
  categoryFieldsMap = {},
}: CustomFieldsSectionProps) => {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<ListingFormValues>();

  const categoryId = watch("categoryId");
  const subCategoryId = watch("subCategoryId");

  // Inheritance Logic: Subcategory fields + Parent category fields
  const fields = useMemo(() => {
    if (!categoryId && !subCategoryId) return [];

    const parentFields = categoryId
      ? categoryFieldsMap[String(categoryId)] || []
      : [];
    const childFields = subCategoryId
      ? categoryFieldsMap[String(subCategoryId)] || []
      : [];

    if (!subCategoryId) return parentFields;

    const childKeys = new Set(childFields.map((f) => f.key));
    const inheritedParentFields = parentFields.filter(
      (pf) => !childKeys.has(pf.key),
    );

    return [...childFields, ...inheritedParentFields];
  }, [categoryId, subCategoryId, categoryFieldsMap]);

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Category Specific Details
          </CardTitle>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            Dynamic
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!categoryId ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Please select a category and sub-category first to load specific
            amenities.
          </div>
        ) : fields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No additional custom fields required for this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fields.map((field) => {
              const fieldName = `customFields.${field.key}` as const;
              const fieldError = (errors?.customFields as Record<string, any>)?.[
                field.key
              ];

              const displayName =
                field.label || field.name || field.key || "Field";
              const placeholderText =
                field.placeholder || `Enter ${displayName.toLowerCase()}`;

              // 1. Text Field
              if (field.type === "text") {
                return (
                  <div key={field.id || field.key} className="space-y-1.5">
                    <Label
                      htmlFor={`customField-${field.key}`}
                      className="text-sm font-medium"
                    >
                      {displayName}{" "}
                      {field.isRequired && (
                        <span className="text-destructive">*</span>
                      )}
                    </Label>
                    <Input
                      id={`customField-${field.key}`}
                      placeholder={placeholderText}
                      className={`bg-background ${
                        fieldError
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      {...register(fieldName)}
                    />
                    {fieldError && (
                      <p className="text-xs text-destructive">
                        {fieldError.message as string}
                      </p>
                    )}
                    {field.helpText && !fieldError && (
                      <p className="text-xs text-muted-foreground">
                        {field.helpText}
                      </p>
                    )}
                  </div>
                );
              }

              // 2. Number Field
              if (field.type === "number") {
                return (
                  <div key={field.id || field.key} className="space-y-1.5">
                    <Label
                      htmlFor={`customField-${field.key}`}
                      className="text-sm font-medium"
                    >
                      {displayName}{" "}
                      {field.isRequired && (
                        <span className="text-destructive">*</span>
                      )}
                    </Label>
                    <Input
                      id={`customField-${field.key}`}
                      type="number"
                      placeholder={field.placeholder || "0"}
                      className={`bg-background ${
                        fieldError
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      {...register(fieldName, { valueAsNumber: true })}
                    />
                    {fieldError && (
                      <p className="text-xs text-destructive">
                        {fieldError.message as string}
                      </p>
                    )}
                    {field.helpText && !fieldError && (
                      <p className="text-xs text-muted-foreground">
                        {field.helpText}
                      </p>
                    )}
                  </div>
                );
              }

              // 3. Dropdown (Select) Field
              if (field.type === "select") {
                const options = Array.isArray(field.options)
                  ? field.options
                  : [];
                return (
                  <div key={field.id || field.key} className="space-y-1.5">
                    <Label
                      htmlFor={`customField-${field.key}`}
                      className="text-sm font-medium"
                    >
                      {displayName}{" "}
                      {field.isRequired && (
                        <span className="text-destructive">*</span>
                      )}
                    </Label>
                    <Controller
                      control={control}
                      name={fieldName}
                      render={({ field: selectField }) => (
                        <Select
                          value={(selectField.value as string) || ""}
                          onValueChange={selectField.onChange}
                        >
                          <SelectTrigger
                            id={`customField-${field.key}`}
                            className={`bg-background ${
                              fieldError
                                ? "border-destructive focus-visible:ring-destructive"
                                : ""
                            }`}
                          >
                            <SelectValue
                              placeholder={
                                field.placeholder || `Select ${displayName}`
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((opt: string) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {fieldError && (
                      <p className="text-xs text-destructive">
                        {fieldError.message as string}
                      </p>
                    )}
                    {field.helpText && !fieldError && (
                      <p className="text-xs text-muted-foreground">
                        {field.helpText}
                      </p>
                    )}
                  </div>
                );
              }

              // 4. Boolean (Switch Toggle) Field
              if (field.type === "boolean") {
                return (
                  <div
                    key={field.id || field.key}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3"
                  >
                    <div className="space-y-0.5">
                      <Label
                        htmlFor={`customField-${field.key}`}
                        className="cursor-pointer text-sm font-medium"
                      >
                        {displayName}
                      </Label>
                      {field.helpText && (
                        <p className="text-xs text-muted-foreground">
                          {field.helpText}
                        </p>
                      )}
                    </div>
                    <Controller
                      control={control}
                      name={fieldName}
                      defaultValue={false}
                      render={({ field: switchField }) => (
                        <Switch
                          id={`customField-${field.key}`}
                          checked={Boolean(switchField.value)}
                          onCheckedChange={switchField.onChange}
                        />
                      )}
                    />
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomFieldsSection;
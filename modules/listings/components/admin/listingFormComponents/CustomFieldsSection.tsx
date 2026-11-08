"use client";

import { useMemo, useEffect } from "react";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { isFieldVisible, isFieldRequired } from "@/modules/categories/utils";

function parseOptions(rawOptions: unknown): string[] {
  if (Array.isArray(rawOptions)) {
    return rawOptions
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof rawOptions === "string" && rawOptions.trim() !== "") {
    return rawOptions
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

interface CustomFieldsSectionProps {
  categoryFieldsMap?: Record<string, any[]>;
  initialData?: any;
  isEditing?: boolean;
}

const CustomFieldsSection = ({
  categoryFieldsMap = {},
  initialData,
  isEditing = false,
}: CustomFieldsSectionProps) => {
  const {
    register,
    control,
    watch,
    clearErrors,
    formState: { errors },
  } = useFormContext<ListingFormValues>();

  const isEditMode = Boolean(isEditing || initialData?.id);
  const initialDetails = useMemo(() => {
    return (initialData?.details || {}) as Record<string, any>;
  }, [initialData]);

  const categoryId = watch("categoryId");
  const subCategoryId = watch("subCategoryId");
  const customFieldsValues = (watch("customFields") || {}) as Record<string, any>;

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

  // Clear any existing errors for hidden conditional fields or optional legacy fields
  useEffect(() => {
    fields.forEach((field) => {
      const isVis = isFieldVisible(field, customFieldsValues);
      if (!isVis) {
        clearErrors(`customFields.${field.key}` as any);
      } else if (isEditMode) {
        const wasPresent =
          field.key in initialDetails &&
          initialDetails[field.key] !== undefined &&
          initialDetails[field.key] !== null &&
          (typeof initialDetails[field.key] === "string"
            ? initialDetails[field.key].trim() !== ""
            : true) &&
          (Array.isArray(initialDetails[field.key])
            ? initialDetails[field.key].length > 0
            : true);

        if (!wasPresent) {
          clearErrors(`customFields.${field.key}` as any);
        }
      }
    });
  }, [isEditMode, fields, initialDetails, customFieldsValues, clearErrors]);

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
              const isVisible = isFieldVisible(field, customFieldsValues);
              if (!isVisible) {
                return null;
              }

              const fieldName = `customFields.${field.key}` as const;
              const fieldError = (errors?.customFields as Record<string, any>)?.[
                field.key
              ];

              const displayName =
                field.label || field.name || field.key || "Field";
              const placeholderText =
                field.placeholder || `Enter ${displayName.toLowerCase()}`;

              // Legacy listings: Check if field was originally filled in initial details
              const wasPresentInOriginal =
                isEditMode &&
                field.key in initialDetails &&
                initialDetails[field.key] !== undefined &&
                initialDetails[field.key] !== null &&
                (typeof initialDetails[field.key] === "string"
                  ? initialDetails[field.key].trim() !== ""
                  : true) &&
                (Array.isArray(initialDetails[field.key])
                  ? initialDetails[field.key].length > 0
                  : true);

              const isEffectiveRequired = isFieldRequired(
                field,
                customFieldsValues,
                isEditMode,
                initialDetails,
              );

              const isLegacyMissing =
                isEditMode &&
                Boolean(field.isRequired || (field.dependsOnFieldKey && field.requiredIfVisible)) &&
                !wasPresentInOriginal;

              // 1. Text Field
              if (field.type === "text") {
                return (
                  <div key={field.id || field.key} className="space-y-1.5">
                    <Label
                      htmlFor={`customField-${field.key}`}
                      className="text-sm font-medium flex items-center gap-1.5 flex-wrap"
                    >
                      <span>{displayName}</span>
                      {isEffectiveRequired && (
                        <span className="text-destructive">*</span>
                      )}
                      {isLegacyMissing && (
                        <span className="text-[11px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
                          Optional for this listing
                        </span>
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
                      {...register(fieldName, {
                        required: isEffectiveRequired
                          ? `${displayName} bharna lazmi hai.`
                          : false,
                        onChange: () => {
                          if (fieldError) clearErrors(fieldName as any);
                        },
                      })}
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
                      className="text-sm font-medium flex items-center gap-1.5 flex-wrap"
                    >
                      <span>{displayName}</span>
                      {isEffectiveRequired && (
                        <span className="text-destructive">*</span>
                      )}
                      {isLegacyMissing && (
                        <span className="text-[11px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
                          Optional for this listing
                        </span>
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
                      {...register(fieldName, {
                        setValueAs: (v) =>
                          v === "" || v === null || isNaN(Number(v))
                            ? undefined
                            : Number(v),
                        validate: (v) =>
                          !isEffectiveRequired ||
                          (v !== undefined && !isNaN(Number(v))) ||
                          `${displayName} bharna lazmi hai.`,
                        onChange: () => {
                          if (fieldError) clearErrors(fieldName as any);
                        },
                      })}
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
                const options = parseOptions(field.options);
                return (
                  <div key={field.id || field.key} className="space-y-1.5">
                    <Label
                      htmlFor={`customField-${field.key}`}
                      className="text-sm font-medium flex items-center gap-1.5 flex-wrap"
                    >
                      <span>{displayName}</span>
                      {isEffectiveRequired && (
                        <span className="text-destructive">*</span>
                      )}
                      {isLegacyMissing && (
                        <span className="text-[11px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
                          Optional for this listing
                        </span>
                      )}
                    </Label>
                    <Controller
                      control={control}
                      name={fieldName}
                      rules={
                        isEffectiveRequired
                          ? { required: `${displayName} bharna lazmi hai.` }
                          : undefined
                      }
                      render={({ field: selectField }) => (
                        <Select
                          value={(selectField.value as string) || ""}
                          onValueChange={(val) => {
                            selectField.onChange(val);
                            if (fieldError) clearErrors(fieldName as any);
                          }}
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

              // 4. Multi-Select (Checkbox Group / Badges) Field
              if (
                field.type === "multiselect" ||
                (field.type as string) === "multi-select"
              ) {
                const options = parseOptions(field.options);
                return (
                  <div
                    key={field.id || field.key}
                    className="space-y-2 col-span-1 md:col-span-2"
                  >
                    <Label className="text-sm font-medium flex items-center gap-1.5 flex-wrap">
                      <span>{displayName}</span>
                      {isEffectiveRequired && (
                        <span className="text-destructive">*</span>
                      )}
                      {isLegacyMissing && (
                        <span className="text-[11px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
                          Optional for this listing
                        </span>
                      )}
                    </Label>
                    <Controller
                      control={control}
                      name={fieldName}
                      defaultValue={[]}
                      rules={
                        isEffectiveRequired
                          ? {
                              validate: (val) =>
                                (Array.isArray(val) && val.length > 0) ||
                                `${displayName} bharna lazmi hai.`,
                            }
                          : undefined
                      }
                      render={({ field: controllerField }) => {
                        const currentValue: string[] = Array.isArray(
                            controllerField.value,
                          )
                          ? controllerField.value
                          : [];

                        if (options.length === 0) {
                          return (
                            <p className="text-xs text-muted-foreground italic">
                              No options configured for this multi-select field.
                            </p>
                          );
                        }

                        return (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {options.map((opt: string) => {
                              const isChecked = currentValue.includes(opt);
                              return (
                                <label
                                  key={opt}
                                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer transition-all select-none ${
                                    isChecked
                                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                                      : "border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                  }`}
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      const nextValue = checked
                                        ? [...currentValue, opt]
                                        : currentValue.filter(
                                            (item) => item !== opt,
                                          );
                                      controllerField.onChange(nextValue);
                                      if (fieldError)
                                        clearErrors(fieldName as any);
                                    }}
                                    className="data-checked:bg-primary data-checked:text-primary-foreground"
                                  />
                                  <span>{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        );
                      }}
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

              // 5. Textarea Field
              if (field.type === "textarea") {
                return (
                  <div
                    key={field.id || field.key}
                    className="space-y-1.5 col-span-1 md:col-span-2"
                  >
                    <Label
                      htmlFor={`customField-${field.key}`}
                      className="text-sm font-medium flex items-center gap-1.5 flex-wrap"
                    >
                      <span>{displayName}</span>
                      {isEffectiveRequired && (
                        <span className="text-destructive">*</span>
                      )}
                      {isLegacyMissing && (
                        <span className="text-[11px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
                          Optional for this listing
                        </span>
                      )}
                    </Label>
                    <Textarea
                      id={`customField-${field.key}`}
                      placeholder={placeholderText}
                      rows={3}
                      className={`bg-background resize-y ${
                        fieldError
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      {...register(fieldName, {
                        required: isEffectiveRequired
                          ? `${displayName} bharna lazmi hai.`
                          : false,
                        onChange: () => {
                          if (fieldError) clearErrors(fieldName as any);
                        },
                      })}
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

              // 6. Boolean (Switch Toggle) Field
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
                          onCheckedChange={(checked) => {
                            switchField.onChange(checked);
                            if (fieldError) clearErrors(fieldName as any);
                          }}
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
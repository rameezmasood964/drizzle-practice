"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createCategoriesField,
  updateCategoryFields,
  getAssignedCategoryIdsAction,
  getCategoriesHierarchyAction,
} from "../../actions/fields";
import type { CategoryFieldItem, CategoryTreeItem } from "../../types";
import { canFieldDependOn } from "../../utils";
import CategoryAssignmentSelector from "./CategoryAssignmentSelector";

interface AddCategoryFieldFormProps {
  categoryId: string | number;
  onSuccess: () => void;
  initialData?: any;
  allFields?: CategoryFieldItem[];
  categoriesHierarchy?: CategoryTreeItem[];
}

const AddCategoryFieldForm = ({
  categoryId,
  onSuccess,
  initialData,
  allFields = [],
  categoriesHierarchy = [],
}: AddCategoryFieldFormProps) => {
  // Field Basic States
  const [fieldType, setFieldType] = useState(initialData?.type || "text");
  const [label, setLabel] = useState(initialData?.label || "");
  const [key, setKey] = useState(initialData?.key || "");
  const [options, setOptions] = useState(
    initialData?.options ? initialData.options.join(", ") : "",
  );
  const [placeholder, setPlaceholder] = useState(
    initialData?.placeholder || "",
  );
  const [helpText, setHelpText] = useState(initialData?.helpText || "");
  const [isRequired, setIsRequired] = useState(
    Boolean(initialData?.dependsOnFieldKey ? false : initialData?.isRequired),
  );
  const [isFilterable, setIsFilterable] = useState(
    Boolean(initialData?.isFilterable),
  );

  // Category Assignment States
  const [treeCategories, setTreeCategories] = useState<CategoryTreeItem[]>(
    categoriesHierarchy || [],
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    () => {
      if (initialData?.assignedCategoryIds) {
        return initialData.assignedCategoryIds;
      }
      if (initialData?.categoryId) {
        return [Number(initialData.categoryId)];
      }
      return [Number(categoryId)];
    },
  );
  const [categoryError, setCategoryError] = useState("");
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

  // Conditional Visibility States
  const [isConditional, setIsConditional] = useState(
    Boolean(initialData?.dependsOnFieldKey),
  );
  const [dependsOnFieldKey, setDependsOnFieldKey] = useState(
    initialData?.dependsOnFieldKey || "",
  );
  const [conditionOperator, setConditionOperator] = useState(
    initialData?.conditionOperator || "equals",
  );
  const [conditionValue, setConditionValue] = useState(
    initialData?.conditionValue || "",
  );
  const [requiredIfVisible, setRequiredIfVisible] = useState(
    Boolean(initialData?.requiredIfVisible),
  );

  const [optionsError, setOptionsError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = Boolean(initialData);

  // Load category hierarchy if not provided via props
  useEffect(() => {
    if (!categoriesHierarchy || categoriesHierarchy.length === 0) {
      getCategoriesHierarchyAction().then((tree) => {
        if (tree && tree.length > 0) {
          setTreeCategories(tree);
        }
      });
    } else {
      setTreeCategories(categoriesHierarchy);
    }
  }, [categoriesHierarchy]);

  // Load assigned category IDs when editing an existing field
  useEffect(() => {
    if (isEditMode && initialData?.id) {
      let isMounted = true;
      setIsLoadingAssignments(true);

      getAssignedCategoryIdsAction(Number(initialData.id))
        .then((assignedIds) => {
          if (isMounted && assignedIds && assignedIds.length > 0) {
            setSelectedCategoryIds(assignedIds);
          }
        })
        .catch((err) => {
          console.error("Error loading assigned category IDs:", err);
        })
        .finally(() => {
          if (isMounted) setIsLoadingAssignments(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      // In create mode: default to current category
      setSelectedCategoryIds([Number(categoryId)]);
    }
  }, [isEditMode, initialData?.id, categoryId]);

  const generateKey = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  // Compatible controlling fields (no self-dependency, no cycles)
  const availableControllingFields = useMemo(() => {
    if (!allFields || allFields.length === 0) return [];
    const currentKey = (key || initialData?.key || "").trim().toLowerCase();
    const currentId = initialData?.id;

    return allFields.filter((f) => {
      if (f.isActive === false) return false;
      if (currentId && f.id === currentId) return false;
      if (f.key.trim().toLowerCase() === currentKey) return false;
      return canFieldDependOn(currentKey, f.key, allFields);
    });
  }, [allFields, key, initialData]);

  // Selected controlling field
  const selectedControllingField = useMemo(() => {
    return availableControllingFields.find((f) => f.key === dependsOnFieldKey);
  }, [availableControllingFields, dependsOnFieldKey]);

  // Predefined options for value selection if controlling field is select/multiselect/boolean
  const conditionValueOptions = useMemo(() => {
    if (!selectedControllingField) return [];
    if (selectedControllingField.type === "boolean") {
      return ["Yes", "No"];
    }
    if (
      selectedControllingField.type === "select" ||
      selectedControllingField.type === "multiselect"
    ) {
      if (Array.isArray(selectedControllingField.options)) {
        return selectedControllingField.options;
      }
      if (typeof selectedControllingField.options === "string") {
        return (selectedControllingField.options as string)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    return [];
  }, [selectedControllingField]);

  // Handle Form Submit
  const handleSubmit = async () => {
    // 1. Validate Category Selection
    if (selectedCategoryIds.length === 0) {
      setCategoryError("Kam az kam 1 category select karna lazmi hai.");
      toast.error("Kam az kam 1 category select karein.");
      return;
    }
    setCategoryError("");

    // 2. Validate Options for select/multiselect
    const isOptionField = fieldType === "select" || fieldType === "multiselect";
    const optionsArray = isOptionField
      ? options
          .split(",")
          .map((item: any) => item.trim())
          .filter(Boolean)
      : null;

    if (isOptionField && (!optionsArray || optionsArray.length === 0)) {
      setOptionsError(
        "Kam az kam 1 option enter karna lazmi hai (comma-separated).",
      );
      toast.error(
        "Dropdown options enter karein (kam az kam 1 option lazmi hai)",
      );
      return;
    }
    setOptionsError("");

    // 3. Validate Conditional Logic
    if (isConditional) {
      if (!dependsOnFieldKey || dependsOnFieldKey.trim() === "") {
        toast.error("Controlling field select karein (Show If).");
        return;
      }
      if (
        conditionOperator !== "is_not_empty" &&
        (!conditionValue || conditionValue.trim() === "")
      ) {
        toast.error("Condition value enter/select karein.");
        return;
      }
    }

    setIsLoading(true);
    try {
      let response;

      const conditionalPayload = {
        dependsOnFieldKey: isConditional ? dependsOnFieldKey : null,
        conditionOperator: isConditional ? conditionOperator : null,
        conditionValue:
          isConditional && conditionOperator !== "is_not_empty"
            ? conditionValue.trim()
            : null,
        requiredIfVisible: isConditional ? requiredIfVisible : false,
      };

      if (isEditMode) {
        // EDIT MODE: Update field metadata and synchronize assigned category IDs
        const updatePayload = {
          categoryIds: selectedCategoryIds,
          label: label.trim(),
          options: optionsArray,
          placeholder: placeholder.trim() || null,
          helpText: helpText.trim() || null,
          isRequired: isConditional ? false : isRequired,
          isFilterable,
          ...conditionalPayload,
        };

        response = await updateCategoryFields(
          Number(initialData.id),
          Number(categoryId),
          updatePayload,
        );
      } else {
        // CREATE MODE: Insert field and category_field_assignments
        const createPayload = {
          categoryId: Number(categoryId),
          categoryIds: selectedCategoryIds,
          label: label.trim(),
          key: key.trim(),
          type: fieldType as any,
          options: optionsArray,
          placeholder: placeholder.trim() || null,
          helpText: helpText.trim() || null,
          isRequired: isConditional ? false : isRequired,
          isFilterable,
          ...conditionalPayload,
        };

        response = await createCategoriesField(createPayload);
      }

      if (response.success) {
        toast.success(
          response.message ||
            (isEditMode
              ? "Field updated successfully!"
              : "Custom field added successfully!"),
        );
        onSuccess();
      } else {
        toast.error(response.error || "Failed to save field");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Field Label */}
        <div className="space-y-1.5">
          <Label htmlFor="label">Field Label</Label>
          <Input
            id="label"
            placeholder="e.g. Consultation Fee (Rs.)"
            value={label}
            onChange={(e) => {
              const val = e.target.value;
              setLabel(val);
              if (!isEditMode) {
                setKey(generateKey(val));
              }
            }}
          />
        </div>

        {/* Field Key */}
        <div className="space-y-1.5">
          <Label htmlFor="key">Field Key (JSON Key)</Label>
          <Input
            id="key"
            placeholder="e.g. consultation_fee"
            className="font-mono text-sm"
            value={key}
            disabled={isEditMode}
            onChange={(e) => setKey(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">
            Unique identifier used in database attributes.
          </p>
        </div>

        {/* Field Type Selector */}
        <div className="space-y-1.5">
          <Label>Field Type</Label>
          <Select
            value={fieldType}
            onValueChange={setFieldType}
            disabled={isEditMode}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text (Single Line)</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="textarea">Textarea (Long Text)</SelectItem>
              <SelectItem value="select">Dropdown Select</SelectItem>
              <SelectItem value="multiselect">Multi Select</SelectItem>
              <SelectItem value="boolean">Switch / Checkbox</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Options Input (Only visible for Select / Multiselect) */}
        {(fieldType === "select" || fieldType === "multiselect") && (
          <div className="space-y-1.5">
            <Label htmlFor="options" className="flex items-center gap-1">
              Dropdown Options (Comma Separated){" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="options"
              placeholder="e.g. Option 1, Option 2, Option 3"
              className={
                optionsError
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
              value={options}
              onChange={(e) => {
                setOptions(e.target.value);
                if (optionsError && e.target.value.trim()) {
                  setOptionsError("");
                }
              }}
            />
            {optionsError ? (
              <p className="text-[12px] font-medium text-destructive">
                {optionsError}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Enter comma-separated values (e.g. Small, Medium, Large)
              </p>
            )}
          </div>
        )}

        {/* Placeholder */}
        <div className="space-y-1.5">
          <Label htmlFor="placeholder">Placeholder (Optional)</Label>
          <Input
            id="placeholder"
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">
            Hint text shown inside the input field.
          </p>
        </div>

        {/* Help Text */}
        <div className="space-y-1.5">
          <Label htmlFor="helpText">Help Text (Optional)</Label>
          <Input
            id="helpText"
            placeholder="e.g. Only enter numeric fee without Rs or PKR"
            value={helpText}
            onChange={(e) => setHelpText(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">
            Guidance text shown below the field.
          </p>
        </div>

        {/* Category Assignment Multi-Select Interface */}
        <CategoryAssignmentSelector
          categories={treeCategories}
          selectedCategoryIds={selectedCategoryIds}
          onChange={(ids) => {
            setSelectedCategoryIds(ids);
            if (categoryError && ids.length > 0) {
              setCategoryError("");
            }
          }}
          error={categoryError}
          disabled={isLoading || isLoadingAssignments}
        />

        {/* Conditional Visibility Section */}
        <div className="pt-3 border-t space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">
                  Enable Conditional Visibility
                </Label>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Show or hide this field based on another field&apos;s answer.
              </p>
            </div>
            <Switch
              checked={isConditional}
              onCheckedChange={(checked) => {
                setIsConditional(checked);
                if (checked) {
                  setIsRequired(false);
                } else {
                  setDependsOnFieldKey("");
                  setConditionValue("");
                  setRequiredIfVisible(false);
                }
              }}
            />
          </div>

          {isConditional && (
            <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-3.5">
              {availableControllingFields.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No other active fields available in this category or parent
                  category to depend on.
                </p>
              ) : (
                <>
                  {/* Show If (Controlling Field) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center justify-between">
                      <span>
                        Show If (Controlling Field){" "}
                        <span className="text-destructive">*</span>
                      </span>
                      {selectedControllingField && (
                        <span className="text-[10px] text-muted-foreground uppercase font-mono">
                          {selectedControllingField.type}
                        </span>
                      )}
                    </Label>
                    <Select
                      value={dependsOnFieldKey}
                      onValueChange={(val) => {
                        setDependsOnFieldKey(val);
                        const target = availableControllingFields.find(
                          (f) => f.key === val,
                        );
                        if (target?.type === "boolean") {
                          setConditionValue("Yes");
                        } else if (
                          target?.options &&
                          Array.isArray(target.options) &&
                          target.options.length > 0
                        ) {
                          setConditionValue(target.options[0]);
                        } else {
                          setConditionValue("");
                        }
                      }}
                    >
                      <SelectTrigger className="w-full bg-background text-xs">
                        <SelectValue placeholder="Select controlling field" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableControllingFields.map((f) => (
                          <SelectItem
                            key={f.key}
                            value={f.key}
                            className="text-xs"
                          >
                            {f.label} ({f.key})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Condition & Value */}
                  <div
                    className={`grid grid-cols-1 ${
                      conditionOperator === "is_not_empty"
                        ? ""
                        : "sm:grid-cols-2"
                    } gap-3`}
                  >
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Condition</Label>
                      <Select
                        value={conditionOperator}
                        onValueChange={setConditionOperator}
                      >
                        <SelectTrigger className="w-full bg-background text-xs">
                          <SelectValue placeholder="Condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals" className="text-xs">
                            Equals (=)
                          </SelectItem>
                          <SelectItem value="not_equals" className="text-xs">
                            Not Equals (≠)
                          </SelectItem>
                          <SelectItem value="contains" className="text-xs">
                            Contains (Multi-Select)
                          </SelectItem>
                          <SelectItem value="is_not_empty" className="text-xs">
                            Is Not Empty (Any Selection)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {conditionOperator !== "is_not_empty" && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">
                          Value <span className="text-destructive">*</span>
                        </Label>
                        {conditionValueOptions.length > 0 ? (
                          <Select
                            value={conditionValue}
                            onValueChange={setConditionValue}
                          >
                            <SelectTrigger className="w-full bg-background text-xs">
                              <SelectValue placeholder="Select value" />
                            </SelectTrigger>
                            <SelectContent>
                              {conditionValueOptions.map((opt) => (
                                <SelectItem
                                  key={opt}
                                  value={opt}
                                  className="text-xs"
                                >
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder="e.g. Yes"
                            className="bg-background text-xs h-9"
                            value={conditionValue}
                            onChange={(e) => setConditionValue(e.target.value)}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Required If Visible */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-medium">
                        Required If Visible
                      </Label>
                      <p className="text-[10px] text-muted-foreground">
                        Make this field mandatory only when it becomes visible.
                      </p>
                    </div>
                    <Switch
                      checked={requiredIfVisible}
                      onCheckedChange={setRequiredIfVisible}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="pt-2 border-t space-y-3">
          {!isConditional && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Required Field</Label>
                <p className="text-[11px] text-muted-foreground">
                  Listing cannot be published without this field.
                </p>
              </div>
              <Switch
                checked={isRequired}
                onCheckedChange={(checked) => setIsRequired(checked)}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Filterable</Label>
              <p className="text-[11px] text-muted-foreground">
                Show as a search filter on the category page.
              </p>
            </div>
            <Switch
              checked={isFilterable}
              onCheckedChange={(checked) => setIsFilterable(checked)}
            />
          </div>
        </div>
      </div>

      {/* Fixed Footer Buttons */}
      <div className="p-4 px-6 border-t bg-background flex items-center justify-end gap-3 mt-auto shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          className="cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || isLoadingAssignments}
          className="cursor-pointer"
        >
          {isLoading ? "Saving..." : isEditMode ? "Update Field" : "Save Field"}
        </Button>
      </div>
    </div>
  );
};

export default AddCategoryFieldForm;

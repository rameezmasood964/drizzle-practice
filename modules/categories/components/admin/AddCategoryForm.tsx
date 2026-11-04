"use client";

import { Input } from "@/components/ui/input";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addcategory, updatecategory } from "../../actions/categories";

interface CategoryFormProps {
  onSuccess?: () => void;
  categories: any[];
  initialData?: any;
}

const CategoryForm = ({
  onSuccess,
  categories,
  initialData,
}: CategoryFormProps) => {
  const isEditing = !!initialData;
  const actionToRun = isEditing ? updatecategory : addcategory;

  // Strict 2-level hierarchy: Only root categories (parentId === null) can be parents.
  // When editing, also exclude the current category itself.
  const rootCategories = (categories || []).filter(
    (cat) => cat.parentId === null && (!isEditing || cat.id !== initialData?.id),
  );

  const [state, formAction, isPending] = useActionState(
    actionToRun as any,
    null,
  );

  const formState = state as any;

  useEffect(() => {
    if (formState?.success) {
      toast.success(
        formState.message ||
          (isEditing
            ? "Category updated successfully!"
            : "Category added successfully!"),
      );
      onSuccess?.();
    } else if (formState?.message && !formState?.errors) {
      toast.error(formState.message);
    }
  }, [formState, onSuccess, isEditing]);

  return (
    <form className="space-y-4 py-2" action={formAction}>
      {/* Hidden Category ID for Edit Mode */}
      {isEditing && <input type="hidden" name="id" value={initialData.id} />}

      {/* Category Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Hostels or Doctor"
          defaultValue={formState?.inputs?.name || initialData?.name || ""}
        />
        {formState?.errors?.name && (
          <p className="text-xs text-destructive font-medium">
            {formState.errors.name[0]}
          </p>
        )}
      </div>

      {/* Icon Field */}
      <div className="space-y-2">
        <Label htmlFor="icon">
          Category Icon {isEditing ? "(Optional)" : "(Required)"}
        </Label>
        <Input
          id="icon"
          name="icon"
          type="file"
          accept="image/*"
          className="cursor-pointer"
        />
        {formState?.errors?.icon && (
          <p className="text-xs text-destructive font-medium">
            {formState.errors.icon[0]}
          </p>
        )}
      </div>

      {/* Parent Category Select */}
      <div className="space-y-2">
        <Label htmlFor="parent">Parent Category</Label>
        <Select
          name="parentId"
          defaultValue={String(
            formState?.inputs?.parentId || initialData?.parentId || "0",
          )}
        >
          <SelectTrigger id="parent" className="w-full cursor-pointer">
            <SelectValue placeholder="Select parent category" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="0">None (Root Category)</SelectItem>

            {rootCategories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formState?.errors?.parentId && (
          <p className="text-xs text-destructive font-medium">
            {formState.errors.parentId[0]}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button type="submit" disabled={isPending} className="cursor-pointer">
          {isPending
            ? isEditing
              ? "Updating..."
              : "Adding Category..."
            : isEditing
              ? "Update Category"
              : "Add Category"}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;

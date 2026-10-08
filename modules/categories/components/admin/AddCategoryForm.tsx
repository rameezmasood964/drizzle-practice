"use client";

import { Input } from "@/components/ui/input";
import { useActionState } from "react";
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

import { addcategory } from "../../actions";
import { useEffect } from "react";

interface CategoryFormProps {
  onSuccess?: () => void;
}

const CategoryForm = ({ onSuccess }: CategoryFormProps) => {
  const [state, formAction, isPending] = useActionState(addcategory, null);


  useEffect(() => {
  if (state?.success) {
    toast.success(state.message || "Category added successfully!");
    onSuccess?.();

    // "Message HAI ✅ AUR Errors NAHI hain ✅ mean agr error ni ha to global errro ha naky singlee" 
  } else if (state?.message && !state?.errors) {
    // sirf general errors ka toast, field errors ka nahi
    toast.error(state.message);
  }
}, [state, onSuccess]);

  return (
    <form className="space-y-4 py-2" action={formAction}>
     
      {/* Category Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Hostels or Doctor"
          defaultValue={String(state?.inputs?.name || "")}
        />

        {/* Field-level error for name */}
        {state?.errors?.name && (
          <p className="text-xs text-destructive font-medium">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      {/* Slug Field */}
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          type="text"
          placeholder="e.g. hostels"
          defaultValue={String(state?.inputs?.slug || "")}
        />

        {/* Field-level error for slug */}
        {state?.errors?.slug && (
          <p className="text-xs text-destructive font-medium">
            {state.errors.slug[0]}
          </p>
        )}
      </div>

      {/* icon field  */}

      <div className="space-y-2">
        <Label htmlFor="icon">Category Icon (Required)</Label>
        <Input
          id="icon"
          name="icon"
          type="file"
          accept="image/*"
          className="cursor-pointer"
        />

        {/* Field-level error for icon */}
        {state?.errors?.icon && (
          <p className="text-xs text-destructive font-medium">
            {state.errors.icon[0]}
          </p>
        )}
      </div>

      {/* Parent Category Select */}
      <div className="space-y-2">
        <Label htmlFor="parent">Parent Category</Label>
        <Select
          name="parentId"
          defaultValue={String(state?.inputs?.parentId || "0")}
        >
          <SelectTrigger id="parent" className="w-full cursor-pointer">
            <SelectValue placeholder="Select parent category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">None (Root Category)</SelectItem>
            <SelectItem value="1">Hostels</SelectItem>
            <SelectItem value="4">Doctor</SelectItem>
            <SelectItem value="5">Lawyer</SelectItem>
          </SelectContent>
        </Select>

        {/* Field-level error for parentId */}
        {state?.errors?.parentId && (
          <p className="text-xs text-destructive font-medium">
            {state.errors.parentId[0]}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding Category..." : "Add Category"}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;

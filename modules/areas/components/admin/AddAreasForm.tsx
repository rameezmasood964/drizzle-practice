"use client";

import { useState, useEffect, useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import type { AddAreasFormProps } from "../../types";
import { addArea, updateArea } from "../../actions/areas";

export default function AddAreasForm({
  initialData = null,
  onSuccess,
}: AddAreasFormProps) {
  const actionToUse = initialData ? updateArea : addArea;
  const [state, formAction, isPending] = useActionState(actionToUse, null);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
  });

  const [errors, setErrors] = useState<{ name?: string[]; slug?: string[] }>(
    {},
  );

  useEffect(() => {
    if (state?.errors) {
      setErrors(state.errors);
    }

    if (state?.success) {
      toast.success(state.message);
      setErrors({});

      if (!initialData) {
        setFormData({ name: "", slug: "" });
      }

      if (onSuccess) {
        onSuccess();
      }
    } else if (state && "inputs" in state && state.inputs) {
      setFormData((prev) => ({
        ...prev,
        name: state.inputs?.name ?? prev.name,
        slug: state.inputs?.slug ?? prev.slug,
      }));
    }
  }, [state, initialData, onSuccess]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }

    setFormData((prev) => ({
      ...prev,
      name,
      slug: initialData ? prev.slug : generatedSlug,
    }));
  };

  return (
    <form action={formAction} className="space-y-4 pt-2">
      {state?.message && !state?.success && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive">
          {state.message}
        </div>
      )}

      {/* Edit Mode ke liye Area ID */}
      {initialData?.id && (
        <input type="hidden" name="id" value={initialData.id} />
      )}

      {/* Area Name Input */}
      <div className="space-y-2">
        <Label htmlFor="area-name">Area Name</Label>
        <Input
          id="area-name"
          name="name"
          placeholder="e.g. Model Town, Satellite Town"
          value={formData.name}
          onChange={handleNameChange}
          required
        />
        {errors.name && (
          <p className="text-xs font-medium text-destructive">
            {errors.name[0]}
          </p>
        )}
      </div>

      {/* Area Slug Input */}
      <div className="space-y-2">
        <Label htmlFor="area-slug">Slug (URL Identifier)</Label>
        <Input
          id="area-slug"
          name="slug"
          placeholder="e.g. model-town"
          value={formData.slug}
          onChange={(e) => {
            if (errors.slug) {
              setErrors((prev) => ({ ...prev, slug: undefined }));
            }
            setFormData((prev) => ({ ...prev, slug: e.target.value }));
          }}
          required
        />
        {errors.slug && (
          <p className="text-xs font-medium text-destructive">
            {errors.slug[0]}
          </p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending
            ? "Saving..."
            : initialData
              ? "Update Area"
              : "Create Area"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

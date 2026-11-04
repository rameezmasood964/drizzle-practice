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
  });

  const [errors, setErrors] = useState<{ name?: string[] }>({});

  useEffect(() => {
    if (state?.errors) {
      setErrors(state.errors);
    }

    if (state?.success) {
      toast.success(state.message);
      setErrors({});

      if (!initialData) {
        setFormData({ name: "" });
      }

      if (onSuccess) {
        onSuccess();
      }
    } else if (state && "inputs" in state && state.inputs) {
      setFormData((prev) => ({
        ...prev,
        name: state.inputs?.name ?? prev.name,
      }));
    }
  }, [state, initialData, onSuccess]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;

    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }

    setFormData({ name });
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

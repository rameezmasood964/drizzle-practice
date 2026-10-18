"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface AddCategoryFieldFormProps {
  categoryId: string | number;
  onSuccess: () => void;
}

const AddCategoryFieldForm = ({
  categoryId,
  onSuccess,
}: AddCategoryFieldFormProps) => {
  const [fieldType, setFieldType] = useState("text");

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Field Label */}
        <div className="space-y-1.5">
          <Label htmlFor="label">Field Label</Label>
          <Input id="label" placeholder="e.g. Consultation Fee (Rs.)" />
        </div>

        {/* Field Key */}
        <div className="space-y-1.5">
          <Label htmlFor="key">Field Key (JSON Key)</Label>
          <Input
            id="key"
            placeholder="e.g. consultation_fee"
            className="font-mono text-sm"
          />
          <p className="text-[11px] text-muted-foreground">
            Unique identifier used in database attributes.
          </p>
        </div>

        {/* Field Type Selector */}
        <div className="space-y-1.5">
          <Label>Field Type</Label>
          <Select value={fieldType} onValueChange={setFieldType}>
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
            <Label htmlFor="options">Dropdown Options (Comma Separated)</Label>
            <Input id="options" placeholder="e.g. Dentist, Cardiologist, ENT" />
          </div>
        )}

        {/* Placeholder */}
        <div className="space-y-1.5">
          <Label htmlFor="placeholder">Placeholder (Optional)</Label>
          <Input id="placeholder" placeholder="e.g. Enter fee amount in PKR" />
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
          />
          <p className="text-[11px] text-muted-foreground">
            Guidance text shown below the field.
          </p>
        </div>

        {/* Toggles */}
        <div className="pt-2 border-t space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Required Field</Label>
              <p className="text-[11px] text-muted-foreground">
                Listing cannot be published without this field.
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Filterable</Label>
              <p className="text-[11px] text-muted-foreground">
                Show as a search filter on the category page.
              </p>
            </div>
            <Switch />
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
        <Button type="button" onClick={onSuccess} className="cursor-pointer">
          Save Field
        </Button>
      </div>
    </div>
  );
};

export default AddCategoryFieldForm;

"use client";

import { Info } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ListingFormValues } from "@/modules/listings/types";

const BasicInfoSection = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ListingFormValues>();

  const descriptionText = watch("description") || "";

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Info className="h-4 w-4 text-primary" />
          Basic Information
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Business Name (Full Width) */}
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-sm font-medium">
            Business Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="e.g. Al-Noor Boys Hostel"
            className={`bg-background ${
              errors.title
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }`}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            {...register("description")}
            rows={4}
            placeholder="Provide a detailed description of the business, facilities, and key highlights..."
            className={`resize-none bg-background ${
              errors.description
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }`}
          />
          <div className="flex items-center justify-between">
            {errors.description ? (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            ) : (
              <span className="text-xs text-muted-foreground">
                Minimum 20 characters required
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {descriptionText.length} characters
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoSection;
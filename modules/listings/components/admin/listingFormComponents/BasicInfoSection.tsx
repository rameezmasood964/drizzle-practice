"use client";

import { Info } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ListingFormValues } from "@/modules/listings/types";

const BasicInfoSection = () => {
  // 1. Parent context se methods extract karein
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ListingFormValues>();

  // Real-time description text count karne ke liye
  const descriptionText = watch("description") || "";

  // 2. Title change hone par auto-slug generate karne ka handler
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Form state mein title update karein
    setValue("title", value, { shouldValidate: true });

    // Auto-generate clean URL slug
    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Special characters remove
      .replace(/\s+/g, "-") // Spaces to hyphens
      .replace(/--+/g, "-"); // Double hyphens fix

    setValue("slug", generatedSlug, { shouldValidate: true });
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      {/* Header */}
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Info className="h-4 w-4 text-primary" />
          Basic Information
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Row 1: Business Name (Title) & Slug */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Business Name */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm font-medium">
              Business Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              {...register("title")}
              onChange={handleTitleChange}
              placeholder="e.g. Al-Noor Boys Hostel"
              className={`bg-background ${errors.title ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="slug" className="text-sm font-medium">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="al-noor-boys-hostel"
              className={`bg-muted font-mono text-sm text-foreground ${errors.slug ? "border-destructive" : ""}`}
            />
            <p className="text-xs text-muted-foreground">
              Auto-generated from business name
            </p>
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>
        </div>

        {/* Row 2: Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            {...register("description")}
            rows={4}
            placeholder="Provide a detailed description of the business, facilities, and key highlights..."
            className={`resize-none bg-background ${errors.description ? "border-destructive focus-visible:ring-destructive" : ""}`}
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
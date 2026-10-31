"use client";

import { Phone } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ListingFormValues } from "@/modules/listings/types";

const ContactSection = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ListingFormValues>();

  return (
    <Card className="border-border bg-card shadow-sm">
      {/* Section Header */}
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Phone className="h-4 w-4 text-primary" />
          Contact Details
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Row 1: Phone Number & WhatsApp Number */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="03001234567"
              className={`bg-background ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp" className="text-sm font-medium">
              WhatsApp Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              {...register("whatsapp")}
              placeholder="+92 300 1234567"
              className={`bg-background ${errors.whatsapp ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.whatsapp && (
              <p className="text-xs text-destructive">{errors.whatsapp.message}</p>
            )}
          </div>
        </div>

        {/* Row 2: Email & Website */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="info@business.com"
              className={`bg-background ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <Label htmlFor="website" className="text-sm font-medium">
              Website <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="website"
              type="url"
              {...register("website")}
              placeholder="https://www.example.com"
              className={`bg-background ${errors.website ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.website && (
              <p className="text-xs text-destructive">{errors.website.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactSection;
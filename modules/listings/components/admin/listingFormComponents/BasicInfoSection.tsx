"use client";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";



const BasicInfoSection = () => {
 return (
    <Card className="border-border bg-card shadow-sm">
      {/* Section Header */}
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Info className="h-4 w-4 text-primary" />
          Basic Information
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Row 1: Business Name and Slug */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Business Name */}
          <div className="space-y-1.5">
            <Label htmlFor="businessName" className="text-sm font-medium">
              Business Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="businessName"
              placeholder="e.g. Al-Noor Boys Hostel"
              className="bg-background"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="slug" className="text-sm font-medium">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              placeholder="al-noor-boys-hostel"
              className="bg-muted text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Auto-generated from name
            </p>
          </div>
        </div>

        {/* Row 2: Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="Provide a detailed description of the business, facilities, and key highlights..."
            className="resize-none bg-background"
          />
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">0/500</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BasicInfoSection
"use client";

import { SlidersHorizontal, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CustomFieldsSection = () => {
  // Demo purpose ke liye assume kar rahe hain ke 'Hostels' category selected hai
  const isCategorySelected = true;

  return (
    <Card className="border-border bg-card shadow-sm">
      {/* Section Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Category Specific Details
          </CardTitle>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            Dynamic
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isCategorySelected ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Please select a category and sub-category first to load specific
            amenities and features.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Example 1: Select Type Field (Room Type) */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Room Sharing Type</Label>
              <Select defaultValue="2-seater">
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-seater">Single / 1-Seater</SelectItem>
                  <SelectItem value="2-seater">2-Seater (Shared)</SelectItem>
                  <SelectItem value="3-seater">3-Seater (Shared)</SelectItem>
                  <SelectItem value="dormitory">Dormitory</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Example 2: Number Field (Security Deposit / Fee) */}
            <div className="space-y-1.5">
              <Label htmlFor="monthlyRent" className="text-sm font-medium">
                Monthly Rent (PKR)
              </Label>
              <Input
                id="monthlyRent"
                type="number"
                placeholder="e.g. 15000"
                className="bg-background"
              />
            </div>

            {/* Example 3: Boolean / Toggle Field (WiFi Included) */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/20">
              <div className="space-y-0.5">
                <Label
                  htmlFor="wifi-toggle"
                  className="text-sm font-medium cursor-pointer"
                >
                  WiFi Available
                </Label>
                <p className="text-xs text-muted-foreground">
                  High-speed internet facility
                </p>
              </div>
              <Switch id="wifi-toggle" defaultChecked />
            </div>

            {/* Example 4: Boolean / Toggle Field (Mess / Food) */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/20">
              <div className="space-y-0.5">
                <Label
                  htmlFor="mess-toggle"
                  className="text-sm font-medium cursor-pointer"
                >
                  Mess / Food Included
                </Label>
                <p className="text-xs text-muted-foreground">
                  3 times meal provided daily
                </p>
              </div>
              <Switch id="mess-toggle" defaultChecked />
            </div>

            {/* Example 5: Boolean / Toggle Field (UPS / Generator Backup) */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/20 md:col-span-2">
              <div className="space-y-0.5">
                <Label
                  htmlFor="backup-toggle"
                  className="text-sm font-medium cursor-pointer"
                >
                  Power Backup (UPS / Generator)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Uninterrupted electricity during load shedding
                </p>
              </div>
              <Switch id="backup-toggle" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomFieldsSection;

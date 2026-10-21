
"use client";

import { Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CategorySection = () => {
  return (
    <Card className="border-border bg-card shadow-sm">
      {/* Section Header */}
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Layers className="h-4 w-4 text-primary" />
          Category
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Category */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select defaultValue="hostels">
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hostels">Hostels</SelectItem>
              <SelectItem value="doctors">Doctors / Clinics</SelectItem>
              <SelectItem value="restaurants">Restaurants & Cafes</SelectItem>
              <SelectItem value="salons">Salons & Spas</SelectItem>
              <SelectItem value="education">Schools & Academies</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sub-category */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">
            Sub-category <span className="text-destructive">*</span>
          </Label>
          <Select>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select a sub-category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boys-hostel">Boys Hostel</SelectItem>
              <SelectItem value="girls-hostel">Girls Hostel</SelectItem>
              <SelectItem value="working-women">Working Women Hostel</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Select a category first to see matching sub-categories
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default CategorySection

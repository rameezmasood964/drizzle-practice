"use client";

import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LocationSection = () => {
  return (
    <Card className="border-border bg-card shadow-sm">
      {/* Section Header */}
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          Location
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Row 1: Full Address & Area */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Full Address */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-sm font-medium">
              Full Address <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="address"
              rows={3}
              placeholder="House # 12, Street 5, Satellite Town, Bahawalpur, Punjab"
              className="resize-none bg-background"
            />
          </div>

          {/* Area / Locality */}
          <div className="space-y-1.5">
            <Label htmlFor="area" className="text-sm font-medium">
              Area / Locality
            </Label>
            <Input
              id="area"
              placeholder="e.g. Satellite Town"
              className="bg-background"
            />
          </div>
        </div>

        {/* Row 2: City & Google Maps Link */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* City Select */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              City <span className="text-destructive">*</span>
            </Label>
            <Select defaultValue="bahawalpur">
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bahawalpur">Bahawalpur</SelectItem>
                <SelectItem value="lahore">Lahore</SelectItem>
                <SelectItem value="islamabad">Islamabad</SelectItem>
                <SelectItem value="karachi">Karachi</SelectItem>
                <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                <SelectItem value="multan">Multan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Google Maps Link */}
          <div className="space-y-1.5">
            <Label htmlFor="mapsUrl" className="text-sm font-medium">
              Google Maps Link{" "}
              <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="mapsUrl"
              type="url"
              placeholder="https://maps.google.com/?q=..."
              className="bg-background"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationSection;

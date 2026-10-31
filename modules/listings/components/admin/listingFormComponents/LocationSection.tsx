"use client";

import { MapPin } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
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
import type { LocationSectionProps, ListingFormValues } from "@/modules/listings/types";

const LocationSection = ({ areas = [] }: LocationSectionProps) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ListingFormValues>();

  return (
    <Card className="border-border bg-card shadow-sm">
      {/* Section Header */}
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          Location Details
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Row 1: Area Dropdown (Mandatory) */}
        <div className="space-y-1.5">
          <Label htmlFor="areaId" className="text-sm font-medium">
            Area / Locality <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={control}
            name="areaId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
              >
                <SelectTrigger
                  id="areaId"
                  className={`bg-background ${errors.areaId ? "border-destructive focus:ring-destructive" : ""}`}
                >
                  <SelectValue placeholder="Select an area in Bahawalpur" />
                </SelectTrigger>
                <SelectContent>
                  {areas.length > 0 ? (
                    areas.map((area) => (
                      <SelectItem key={area.id} value={String(area.id)}>
                        {area.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No areas available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.areaId && (
            <p className="text-xs text-destructive">{errors.areaId.message}</p>
          )}
        </div>

        {/* Row 2: Full Address (Mandatory) */}
        <div className="space-y-1.5">
          <Label htmlFor="address" className="text-sm font-medium">
            Full Address <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="address"
            rows={2}
            {...register("address")}
            placeholder="House / Shop #, Street name, Block..."
            className={`resize-none bg-background ${errors.address ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
          {errors.address && (
            <p className="text-xs text-destructive">{errors.address.message}</p>
          )}
        </div>

        {/* Row 3: Nearby Landmark (Optional) */}
        <div className="space-y-1.5">
          <Label htmlFor="landmark" className="text-sm font-medium">
            Nearby Landmark{" "}
            <span className="text-xs text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="landmark"
            {...register("landmark")}
            placeholder="e.g. Near Fawara Chowk, Opposite Dubai Mahal Road"
            className="bg-background"
          />
          {errors.landmark && (
            <p className="text-xs text-destructive">{errors.landmark.message}</p>
          )}
        </div>

        {/* Row 4: Google Maps Link / Location URL (Mandatory) */}
        <div className="space-y-1.5">
          <Label htmlFor="mapsUrl" className="text-sm font-medium">
            Location URL (Google Maps) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="mapsUrl"
            type="url"
            {...register("mapsUrl")}
            placeholder="https://maps.app.goo.gl/... ya https://maps.google.com/?q=..."
            className={`bg-background ${errors.mapsUrl ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
          <p className="text-xs text-muted-foreground">
            Google Maps ka shareable link paste karein taake users asani se location trace kar sakein.
          </p>
          {errors.mapsUrl && (
            <p className="text-xs text-destructive">{errors.mapsUrl.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationSection;
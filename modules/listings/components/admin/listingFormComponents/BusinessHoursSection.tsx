"use client";

import { Clock } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ListingFormValues } from "../../schema";

const DAYS_CONFIG = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

const BusinessHoursSection = () => {
  const { register, control, watch } = useFormContext<ListingFormValues>();

  return (
    <Card className="border-border bg-card shadow-sm">
      {/* Section Header */}
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Clock className="h-4 w-4 text-primary" />
          Business Hours
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {DAYS_CONFIG.map(({ key, label }) => {
          // Live check agar yeh din open hai ya closed
          const isOpen = watch(`businessHours.${key}.isOpen`);

          return (
            <div
              key={key}
              className={`flex flex-col gap-2 rounded-lg border p-2.5 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                isOpen
                  ? "border-border/60 bg-card"
                  : "border-border/30 bg-muted/20 opacity-75"
              }`}
            >
              {/* Day Name */}
              <span className="w-24 text-sm font-medium text-foreground">
                {label}
              </span>

              {/* Time Inputs */}
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="09:00 AM"
                    disabled={!isOpen}
                    className="h-8 bg-background text-xs disabled:cursor-not-allowed disabled:opacity-50"
                    {...register(`businessHours.${key}.openTime`)}
                  />
                </div>
                <span className="text-xs text-muted-foreground">-</span>
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="10:00 PM"
                    disabled={!isOpen}
                    className="h-8 bg-background text-xs disabled:cursor-not-allowed disabled:opacity-50"
                    {...register(`businessHours.${key}.closeTime`)}
                  />
                </div>
              </div>

              {/* Status Switch */}
              <div className="flex items-center justify-end gap-2 pl-2">
                <Label
                  htmlFor={`switch-${key}`}
                  className="w-12 text-right text-xs font-medium text-muted-foreground"
                >
                  {isOpen ? "Open" : "Closed"}
                </Label>
                <Controller
                  control={control}
                  name={`businessHours.${key}.isOpen`}
                  render={({ field }) => (
                    <Switch
                      id={`switch-${key}`}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default BusinessHoursSection;

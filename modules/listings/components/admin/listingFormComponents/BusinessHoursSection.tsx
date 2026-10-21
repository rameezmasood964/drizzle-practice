
"use client";

import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const BusinessHoursSection = () => {
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
        {DAYS_OF_WEEK.map((day) => {
          const isSunday = day === "Sunday";

          return (
            <div
              key={day}
              className="flex flex-col gap-2 rounded-lg border border-border/50 p-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Day Name */}
              <span className="w-24 text-sm font-medium text-foreground">
                {day}
              </span>

              {/* Time Inputs */}
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    defaultValue={isSunday ? "10:00 AM" : "09:00 AM"}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <span className="text-xs text-muted-foreground">-</span>
                <div className="relative flex-1">
                  <Input
                    type="text"
                    defaultValue={isSunday ? "08:00 PM" : "10:00 PM"}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>

              {/* Status Switch */}
              <div className="flex items-center justify-end gap-2 pl-2">
                <Label
                  htmlFor={`switch-${day}`}
                  className="text-xs text-muted-foreground w-12 text-right"
                >
                  {isSunday ? "Open" : "Closed"}
                </Label>
                <Switch
                  id={`switch-${day}`}
                  defaultChecked={isSunday}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default BusinessHoursSection

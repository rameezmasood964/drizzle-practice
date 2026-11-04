"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface StatusFilterProps {
  openNow?: boolean;
  onChange?: (openNow: boolean) => void;
}

export function StatusFilter({
  openNow = false,
  onChange,
}: StatusFilterProps) {
  const [isOpenNow, setIsOpenNow] = React.useState(openNow);

  const handleToggle = (checked: boolean) => {
    setIsOpenNow(checked);
    onChange?.(checked);
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-primary" />
        <div className="space-y-0.5">
          <Label htmlFor="open-now-switch" className="text-sm font-medium text-foreground cursor-pointer">
            Open Now
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Places currently active
          </p>
        </div>
      </div>
      <Switch
        id="open-now-switch"
        checked={isOpenNow}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}

export default StatusFilter;


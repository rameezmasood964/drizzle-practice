"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface PriceRangeOption {
  id: string;
  label: string;
}

const PRICE_RANGES: PriceRangeOption[] = [
  { id: "under-500", label: "Under Rs. 500" },
  { id: "500-1500", label: "Rs. 500 - Rs. 1,500" },
  { id: "1500-5000", label: "Rs. 1,500 - Rs. 5,000" },
  { id: "above-5000", label: "Rs. 5,000+" },
];

interface PriceFilterProps {
  selectedRanges?: string[];
  onChange?: (selected: string[]) => void;
}

export function PriceFilter({
  selectedRanges = [],
  onChange,
}: PriceFilterProps) {
  const [internalSelected, setInternalSelected] = React.useState<string[]>(selectedRanges);

  const handleToggle = (id: string) => {
    const next = internalSelected.includes(id)
      ? internalSelected.filter((item) => item !== id)
      : [...internalSelected, id];

    setInternalSelected(next);
    onChange?.(next);
  };

  return (
    <div className="space-y-2">
      {PRICE_RANGES.map((range) => {
        const isChecked = internalSelected.includes(range.id);
        return (
          <label
            key={range.id}
            className="flex items-center justify-between text-xs py-1 px-1 rounded-md cursor-pointer hover:bg-accent/50 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => handleToggle(range.id)}
              />
              <span className="text-foreground group-hover:text-primary transition-colors">
                {range.label}
              </span>
            </div>
          </label>
        );
      })}
    </div>
  );
}

export default PriceFilter;


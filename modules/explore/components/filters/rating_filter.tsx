"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingOption {
  value: number;
  label: string;
}

const RATING_OPTIONS: RatingOption[] = [
  { value: 4.5, label: "4.5 & up" },
  { value: 4.0, label: "4.0 & up" },
  { value: 3.5, label: "3.5 & up" },
  { value: 0, label: "All Ratings" },
];

interface RatingFilterProps {
  selectedRating?: number;
  onChange?: (rating: number) => void;
}

export function RatingFilter({
  selectedRating = 0,
  onChange,
}: RatingFilterProps) {
  const [currentRating, setCurrentRating] = React.useState<number>(selectedRating);

  const handleSelect = (val: number) => {
    setCurrentRating(val);
    onChange?.(val);
  };

  return (
    <div className="space-y-1">
      {RATING_OPTIONS.map((option) => {
        const isSelected = currentRating === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors",
              isSelected
                ? "bg-accent font-semibold text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-1.5">
              {option.value > 0 ? (
                <>
                  <div className="flex items-center text-primary">
                    <Star className="size-3.5 fill-primary text-primary" />
                  </div>
                  <span>{option.label}</span>
                </>
              ) : (
                <span>{option.label}</span>
              )}
            </div>
            {isSelected && (
              <span className="size-1.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default RatingFilter;


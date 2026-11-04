"use client";

import * as React from "react";
import { X, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface FilterPillItem {
  id: string;
  label: string;
}

const DEFAULT_ACTIVE_FILTERS: FilterPillItem[] = [
  { id: "area-farid-gate", label: "Farid Gate" },
  { id: "status-open-now", label: "Open Now" },
  { id: "price-under-1000", label: "Under Rs. 1,000" },
];

export interface ActiveFilterPillsProps {
  filters?: FilterPillItem[];
  onRemove?: (id: string) => void;
  onClearAll?: () => void;
}

export function ActiveFilterPills({
  filters = DEFAULT_ACTIVE_FILTERS,
  onRemove,
  onClearAll,
}: ActiveFilterPillsProps) {
  const [activeFilters, setActiveFilters] = React.useState<FilterPillItem[]>(filters);

  const handleRemove = (id: string) => {
    const next = activeFilters.filter((item) => item.id !== id);
    setActiveFilters(next);
    onRemove?.(id);
  };

  const handleClearAll = () => {
    setActiveFilters([]);
    onClearAll?.();
  };

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      <span className="text-xs font-medium text-muted-foreground mr-1">
        Active Filters:
      </span>

      {activeFilters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          className="gap-1.5 rounded-full pl-2.5 pr-1.5 py-1 text-xs font-normal text-foreground transition-colors hover:bg-secondary/80"
        >
          <span>{filter.label}</span>
          <button
            type="button"
            onClick={() => handleRemove(filter.id)}
            className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus:outline-none"
            aria-label={`Remove filter ${filter.label}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}

      {/* Clear all button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClearAll}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="size-3 mr-1" />
        <span>Clear all</span>
      </Button>
    </div>
  );
}

export default ActiveFilterPills;


"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface CategorySearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function CategorySearchBar({
  value,
  onChange,
  placeholder = "Search categories or services (e.g. Hostels, Doctors, Cafes)...",
}: CategorySearchBarProps) {
  return (
    <div className="relative w-full max-w-xl">
      <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border-border bg-card pl-10 pr-10 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search query"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}

export default CategorySearchBar;


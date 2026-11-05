"use client";

import React from "react";
import { Search, X, RotateCcw, FolderTree } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type {
  ClaimFilters,
  ClaimStatus,
  ClaimsFilterBarProps,
  ParentCategoryOption,
} from "../../types";

const STATUS_OPTIONS: { label: string; value: ClaimStatus | "all" }[] = [
  { label: "All Claims", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export const DEFAULT_CATEGORIES: ParentCategoryOption[] = [
  {
    id: 1,
    name: "Hostels",
    slug: "hostels",
    subCategories: [
      { id: 11, name: "Boys Hostels", slug: "boys-hostels" },
      { id: 12, name: "Girls Hostels", slug: "girls-hostels" },
    ],
  },
  {
    id: 2,
    name: "Doctors",
    slug: "doctors",
    subCategories: [
      { id: 21, name: "Eye Specialists", slug: "eye-specialists" },
      { id: 22, name: "General Physicians", slug: "general-physicians" },
    ],
  },
  {
    id: 3,
    name: "Resturants",
    slug: "resturants",
    subCategories: [
      { id: 31, name: "Fast Food", slug: "fast-food" },
      { id: 32, name: "Traditional BBQ", slug: "traditional-bbq" },
    ],
  },
  {
    id: 4,
    name: "Lawyers",
    slug: "lawyers",
    subCategories: [
      { id: 41, name: "Civil Lawyers", slug: "civil-lawyers" },
      { id: 42, name: "Tax Consultants", slug: "tax-consultants" },
    ],
  },
];

export const ClaimsFilterBar: React.FC<ClaimsFilterBarProps> = ({
  filters,
  onFilterChange,
  categories = DEFAULT_CATEGORIES,
  pendingCount = 0,
}) => {
  const isFiltered =
    filters.status !== "all" ||
    filters.search.trim() !== "" ||
    (filters.category && filters.category !== "all");

  const handleReset = () => {
    onFilterChange({
      status: "all",
      search: "",
      category: "all",
    });
  };

  return (
    <div className="space-y-3">
      {/* Top Filter Row: Status Pills & Action Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-muted/60 border border-border/60 w-fit">
          {STATUS_OPTIONS.map((opt) => {
            const isActive = filters.status === opt.value;
            const showPendingBadge = opt.value === "pending" && pendingCount > 0;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onFilterChange({ ...filters, status: opt.value })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-background text-foreground shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <span>{opt.label}</span>
                {showPendingBadge && (
                  <Badge
                    variant="outline"
                    className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0 h-4"
                  >
                    {pendingCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Omnisearch, Category Dropdown & Reset */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Omnisearch Input */}
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search claims, listing, phone..."
              value={filters.search}
              onChange={(e) =>
                onFilterChange({ ...filters, search: e.target.value })
              }
              className="pl-8 pr-8 h-9 text-xs bg-background"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, search: "" })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Hierarchical Grouped Category Filter */}
          <Select
            value={filters.category || "all"}
            onValueChange={(val) =>
              onFilterChange({ ...filters, category: val })
            }
          >
            <SelectTrigger className="w-[180px] h-9 text-xs bg-background">
              <div className="flex items-center gap-2 truncate">
                <FolderTree className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Categories" />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all" className="text-xs font-medium">
                All Categories
              </SelectItem>
              {categories.map((parent) => (
                <SelectGroup key={parent.id}>
                  <SelectLabel className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                    {parent.name}
                  </SelectLabel>
                  <SelectItem
                    value={`parent-${parent.id}`}
                    className="text-xs pl-4 font-medium"
                  >
                    All {parent.name}
                  </SelectItem>
                  {parent.subCategories &&
                    parent.subCategories.map((sub) => (
                      <SelectItem
                        key={sub.id}
                        value={`sub-${sub.id}`}
                        className="text-xs pl-6 text-muted-foreground focus:text-foreground"
                      >
                        {sub.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>

          {/* Instant Reset Button */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimsFilterBar;


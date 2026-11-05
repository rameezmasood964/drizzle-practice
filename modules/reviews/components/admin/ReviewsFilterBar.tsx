"use client";

import React from "react";
import { Search, Star, X, RotateCcw, FolderTree } from "lucide-react";
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
  ReviewFilters,
  ReviewStatus,
  ReviewsFilterBarProps,
  ParentCategoryOption,
} from "../../types";

const STATUS_OPTIONS: { label: string; value: ReviewStatus | "all" }[] = [
  { label: "All Reviews", value: "all" },
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
    name: "Health",
    slug: "health",
    subCategories: [
      { id: 21, name: "Doctors", slug: "doctors" },
      { id: 22, name: "Clinics", slug: "clinics" },
      { id: 23, name: "Hospitals", slug: "hospitals" },
    ],
  },
  {
    id: 3,
    name: "Hotels & Venues",
    slug: "hotels-venues",
    subCategories: [
      { id: 31, name: "Marriage Halls", slug: "marriage-halls" },
      { id: 32, name: "Guest Houses", slug: "guest-houses" },
    ],
  },
  {
    id: 4,
    name: "Professional Services",
    slug: "professional-services",
    subCategories: [
      { id: 41, name: "Lawyers", slug: "lawyers" },
      { id: 42, name: "Accountants", slug: "accountants" },
    ],
  },
  {
    id: 5,
    name: "Fitness & Sports",
    slug: "fitness-sports",
    subCategories: [
      { id: 51, name: "Gyms", slug: "gyms" },
      { id: 52, name: "Sports Clubs", slug: "sports-clubs" },
    ],
  },
];

export const ReviewsFilterBar: React.FC<ReviewsFilterBarProps> = ({
  filters,
  onFilterChange,
  categories = DEFAULT_CATEGORIES,
  pendingCount = 0,
}) => {
  const currentStatus = filters.status || "all";
  const currentRating = filters.rating !== undefined ? String(filters.rating) : "all";
  const currentSearch = filters.search || "";
  const currentCategoryId = filters.categoryId || "all";

  const handleStatusChange = (status: ReviewStatus | "all") => {
    onFilterChange({ ...filters, status });
  };

  const handleRatingChange = (val: string) => {
    const rating = val === "all" ? "all" : Number(val);
    onFilterChange({ ...filters, rating });
  };

  const handleCategoryChange = (val: string) => {
    onFilterChange({ ...filters, categoryId: val });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const clearSearch = () => {
    onFilterChange({ ...filters, search: "" });
  };

  const hasActiveFilters =
    currentStatus !== "all" ||
    currentRating !== "all" ||
    currentCategoryId !== "all" ||
    currentSearch.trim() !== "";

  const resetAllFilters = () => {
    onFilterChange({
      status: "all",
      rating: "all",
      categoryId: "all",
      search: "",
    });
  };

  return (
    <div className="space-y-3 bg-card p-4 rounded-xl border border-border shadow-xs">
      {/* Row 1: Status Pills */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-border/60 pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((opt) => {
            const isActive = currentStatus === opt.value;
            const isPendingOption = opt.value === "pending";

            return (
              <Button
                key={opt.value}
                type="button"
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusChange(opt.value)}
                className={`h-8 text-xs cursor-pointer gap-1.5 transition-all ${
                  isActive
                    ? "shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground border-border bg-background"
                }`}
              >
                <span>{opt.label}</span>
                {isPendingOption && pendingCount > 0 && (
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 h-4 min-w-4 flex items-center justify-center font-bold ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {pendingCount}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {/* Quick Reset in Row 1 when filters active */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetAllFilters}
            className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 cursor-pointer ml-auto"
            title="Reset all filters to default"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All</span>
          </Button>
        )}
      </div>

      {/* Row 2: Inline Controls (Smart Omnisearch, Hierarchical Category, Rating, Reset) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* 1. Smart Omnisearch Input (lg:col-span-6) */}
        <div className="lg:col-span-6 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search listing, user, comment, category..."
            value={currentSearch}
            onChange={handleSearchChange}
            className="pl-8 pr-7 h-9 text-xs bg-background"
          />
          {currentSearch && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>

        {/* 2. Hierarchical Grouped Category Select (lg:col-span-3) */}
        <div className="lg:col-span-3">
          <Select value={currentCategoryId} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-9 text-xs bg-background w-full">
              <div className="flex items-center gap-1.5 truncate">
                <FolderTree className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Categories" />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all" className="text-xs font-medium">
                All Categories
              </SelectItem>

              {categories.map((cat) => {
                const subCats = cat.subCategories || [];
                return (
                  <SelectGroup key={cat.id} className="pt-1">
                    <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                      {cat.name}
                    </SelectLabel>
                    <SelectItem
                      value={`parent-${cat.id}`}
                      className="text-xs font-semibold pl-4 text-primary"
                    >
                      All {cat.name}
                    </SelectItem>
                    {subCats.map((sub) => (
                      <SelectItem
                        key={sub.id}
                        value={`sub-${sub.id}`}
                        className="text-xs pl-6 text-foreground"
                      >
                        ↳ {sub.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* 3. Rating Dropdown (lg:col-span-2) */}
        <div className="lg:col-span-2">
          <Select value={currentRating} onValueChange={handleRatingChange}>
            <SelectTrigger className="h-9 text-xs bg-background w-full">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all" className="text-xs">
                All Ratings
              </SelectItem>
              <SelectItem value="5" className="text-xs">
                <span className="flex items-center gap-1">
                  5 Stars{" "}
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500 inline ml-0.5" />
                </span>
              </SelectItem>
              <SelectItem value="4" className="text-xs">
                <span className="flex items-center gap-1">
                  4 Stars{" "}
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500 inline ml-0.5" />
                </span>
              </SelectItem>
              <SelectItem value="3" className="text-xs">
                <span className="flex items-center gap-1">
                  3 Stars{" "}
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500 inline ml-0.5" />
                </span>
              </SelectItem>
              <SelectItem value="2" className="text-xs">
                <span className="flex items-center gap-1">
                  2 Stars{" "}
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500 inline ml-0.5" />
                </span>
              </SelectItem>
              <SelectItem value="1" className="text-xs">
                <span className="flex items-center gap-1">
                  1 Star{" "}
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500 inline ml-0.5" />
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 4. Instant Reset Icon Button (lg:col-span-1) */}
        <div className="lg:col-span-1 flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!hasActiveFilters}
            onClick={resetAllFilters}
            className={`h-9 w-9 shrink-0 transition-colors ${
              hasActiveFilters
                ? "border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                : "opacity-40 cursor-not-allowed"
            }`}
            title="Reset all filters"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only">Reset filters</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsFilterBar;

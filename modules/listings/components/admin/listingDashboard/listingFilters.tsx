"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AreaFilterOption {
  id: number | string;
  name: string;
}

export interface CategoryFilterOption {
  id: number | string;
  name: string;
}

interface ListingFiltersProps {
  categories?: CategoryFilterOption[];
  areas?: AreaFilterOption[];
}

const ListingFilters = ({
  categories = [],
  areas = [],
}: ListingFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("categoryId") || "all";
  const currentArea = searchParams.get("areaId") || "all";
  const currentStatus = searchParams.get("status") || "all";

  // URL search params update karne ka central function
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    params.delete("page"); // Filter change hone par wapis page 1 par jayein

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Reset sab filters
  const handleReset = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 lg:flex-row lg:items-end">
      {/* 1. Omni Search Input */}
      <div className="flex-1 space-y-1.5">
        <Label
          htmlFor="search"
          className="text-xs font-medium text-muted-foreground"
        >
          Search
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            defaultValue={currentSearch}
            onChange={(e) => updateFilter("search", e.target.value)}
            placeholder="Search by title or phone..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Dropdown Filters Container */}
      <div className="flex flex-wrap items-end gap-3">
        {/* 2. Category Dropdown */}
        <div className="w-full space-y-1.5 sm:w-[160px]">
          <Label className="text-xs font-medium text-muted-foreground">
            Category
          </Label>
          <Select
            value={currentCategory}
            onValueChange={(val) => updateFilter("categoryId", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 3. Area Dropdown */}
        <div className="w-full space-y-1.5 sm:w-[160px]">
          <Label className="text-xs font-medium text-muted-foreground">
            Area
          </Label>
          <Select
            value={currentArea}
            onValueChange={(val) => updateFilter("areaId", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Areas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              {areas.map((area) => (
                <SelectItem key={area.id} value={String(area.id)}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 4. Status Dropdown */}
        <div className="w-full space-y-1.5 sm:w-[140px]">
          <Label className="text-xs font-medium text-muted-foreground">
            Status
          </Label>
          <Select
            value={currentStatus}
            onValueChange={(val) => updateFilter("status", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 5. Reset Button */}
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListingFilters;

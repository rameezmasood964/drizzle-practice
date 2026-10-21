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
import { ListingFiltersProps } from "@/modules/listings/types";

const ListingFilters = ({ categories = [] }: ListingFiltersProps) => {
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
            placeholder="Search by title, phone, or area..."
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
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 3. Status Dropdown */}
        <div className="w-full space-y-1.5 sm:w-[150px]">
          <Label className="text-xs font-medium text-muted-foreground">
            Status
          </Label>
          <Select defaultValue="all">
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

        {/* 4. Sort By Dropdown */}
        <div className="w-full space-y-1.5 sm:w-[150px]">
          <Label className="text-xs font-medium text-muted-foreground">
            Sort by
          </Label>
          <Select defaultValue="newest">
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title_asc">Title (A-Z)</SelectItem>
              <SelectItem value="title_desc">Title (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 5. Reset Button */}
        <div>
          <Button variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListingFilters;

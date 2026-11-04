"use client";

import * as React from "react";
import { SlidersHorizontal, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { AreaFilter } from "./filters/area_filter";
import { StatusFilter } from "./filters/status_filter";
import { PriceFilter } from "./filters/price_filter";
import { RatingFilter } from "./filters/rating_filter";
import { DynamicCategoryFilter } from "./filters/dynamic_category_filter";

interface SearchFiltersSidebarProps {
  categorySlug?: string;
  className?: string;
}

export function SearchFiltersSidebarWrapper({
  categorySlug = "hostels-accommodation",
  className,
}: SearchFiltersSidebarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [resetKey, setResetKey] = React.useState(0);

  // Filter presentation states
  const [openNow, setOpenNow] = React.useState(false);
  const [selectedAreas, setSelectedAreas] = React.useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = React.useState<string[]>([]);
  const [selectedRating, setSelectedRating] = React.useState<number>(0);
  const [selectedFacilities, setSelectedFacilities] = React.useState<string[]>([]);

  const activeFiltersCount =
    (openNow ? 1 : 0) +
    selectedAreas.length +
    selectedPrices.length +
    (selectedRating > 0 ? 1 : 0) +
    selectedFacilities.length;

  const handleResetAll = () => {
    setOpenNow(false);
    setSelectedAreas([]);
    setSelectedPrices([]);
    setSelectedRating(0);
    setSelectedFacilities([]);
    setResetKey((prev) => prev + 1);
  };

  // The common filter controls content
  const FilterControlsContent = (
    <div key={resetKey} className="space-y-4">
      {/* 1. Open Now Quick Switch */}
      <StatusFilter openNow={openNow} onChange={setOpenNow} />

      {/* 2. Accordion for detailed filters */}
      <Accordion
        type="multiple"
        defaultValue={["areas", "facilities", "price", "ratings"]}
        className="w-full"
      >
        {/* Areas */}
        <AccordionItem value="areas">
          <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Bahawalpur Localities
          </AccordionTrigger>
          <AccordionContent>
            <AreaFilter
              selectedAreas={selectedAreas}
              onChange={setSelectedAreas}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Dynamic Category Facilities */}
        <AccordionItem value="facilities">
          <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Specific Facilities
          </AccordionTrigger>
          <AccordionContent>
            <DynamicCategoryFilter
              categorySlug={categorySlug}
              selectedFacilities={selectedFacilities}
              onChange={setSelectedFacilities}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Budget / Pricing
          </AccordionTrigger>
          <AccordionContent>
            <PriceFilter
              selectedRanges={selectedPrices}
              onChange={setSelectedPrices}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Rating */}
        <AccordionItem value="ratings">
          <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Customer Rating
          </AccordionTrigger>
          <AccordionContent>
            <RatingFilter
              selectedRating={selectedRating}
              onChange={setSelectedRating}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger Button (Visible on screens < lg) */}
      <div className="lg:hidden w-full">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between gap-2 border-border bg-card text-foreground"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-primary" />
                <span className="font-medium text-sm">Filters</span>
              </div>
              {activeFiltersCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="flex flex-col gap-0 p-0 sm:max-w-sm">
            {/* Drawer Header */}
            <SheetHeader className="flex flex-row items-center justify-between border-b border-border p-4">
              <SheetTitle className="flex items-center gap-2 text-base font-semibold">
                <SlidersHorizontal className="size-4 text-primary" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {activeFiltersCount}
                  </span>
                )}
              </SheetTitle>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetAll}
                  className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset</span>
                </Button>
              )}
            </SheetHeader>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {FilterControlsContent}
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-border p-4 bg-background">
              <Button
                className="w-full"
                onClick={() => setMobileOpen(false)}
              >
                Show Results
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sticky Sidebar (Visible on screens >= lg) */}
      <aside
        className={
          className ||
          "hidden lg:block w-72 shrink-0 self-start sticky top-20 rounded-2xl border border-border bg-card p-4 shadow-xs"
        }
      >
        {/* Desktop Header */}
        <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Filters</h3>
            {activeFiltersCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetAll}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3 mr-1" />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {/* Filters Scrollable / Stacked List */}
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          {FilterControlsContent}
        </div>
      </aside>
    </>
  );
}

export default SearchFiltersSidebarWrapper;


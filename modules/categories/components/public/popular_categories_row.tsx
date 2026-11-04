"use client";

import * as React from "react";
import { Bed, UtensilsCrossed, Stethoscope, GraduationCap, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface PopularCategoriesRowProps {
  activeSlug?: string;
  onSelectCategory?: (slug: string) => void;
}

const POPULAR_PILLS = [
  { label: "All Categories", slug: "", icon: null },
  { label: "Hostels & Living", slug: "hostels-accommodation", icon: Bed },
  { label: "Food & Dining", slug: "food-cafes", icon: UtensilsCrossed },
  { label: "Doctors & Clinics", slug: "doctors-clinics", icon: Stethoscope },
  { label: "Education & Academies", slug: "education-academies", icon: GraduationCap },
  { label: "Shopping & Retail", slug: "shopping-markets", icon: ShoppingBag },
];

export function PopularCategoriesRow({
  activeSlug = "",
  onSelectCategory,
}: PopularCategoriesRowProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {POPULAR_PILLS.map((pill) => {
        const Icon = pill.icon;
        const isActive = activeSlug === pill.slug;

        return (
          <button
            key={pill.label}
            type="button"
            onClick={() => onSelectCategory?.(pill.slug)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-foreground"
            )}
          >
            {Icon && <Icon className="size-3.5" />}
            <span>{pill.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default PopularCategoriesRow;


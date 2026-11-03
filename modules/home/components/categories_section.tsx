import * as React from "react";
import Link from "next/link";
import {
  Bed,
  UtensilsCrossed,
  Stethoscope,
  ShoppingBag,
  GraduationCap,
  Scale,
  Dumbbell,
  Building2,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CategoryItem {
  name: string;
  slug: string;
  icon: LucideIcon;
  subtext: string;
  count: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    name: "Hostels & Living",
    slug: "hostels-accommodation",
    icon: Bed,
    subtext: "Boys, Girls, Flats",
    count: "45+ places",
  },
  {
    name: "Food & Cafes",
    slug: "food-cafes",
    icon: UtensilsCrossed,
    subtext: "Restaurants, Chai, Fast Food",
    count: "80+ places",
  },
  {
    name: "Doctors & Clinics",
    slug: "doctors-clinics",
    icon: Stethoscope,
    subtext: "Specialists, Labs, Pharmacies",
    count: "35+ places",
  },
  {
    name: "Shopping & Markets",
    slug: "shopping-markets",
    icon: ShoppingBag,
    subtext: "Plazas, Clothing, Electronics",
    count: "50+ places",
  },
  {
    name: "Education & Coaching",
    slug: "education-academies",
    icon: GraduationCap,
    subtext: "Academies, Entry Test, Tuition",
    count: "25+ places",
  },
  {
    name: "Lawyers & Legal",
    slug: "lawyers-consultants",
    icon: Scale,
    subtext: "Legal, Tax, Documentation",
    count: "20+ places",
  },
  {
    name: "Gyms & Fitness",
    slug: "gyms-fitness",
    icon: Dumbbell,
    subtext: "Fitness, Workouts, Yoga",
    count: "18+ places",
  },
  {
    name: "Real Estate & Plots",
    slug: "real-estate",
    icon: Building2,
    subtext: "Plots, Commercial, Rent",
    count: "30+ places",
  },
];

export function CategoriesSection() {
  return (
    <section className="border-b border-border bg-background py-14 sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Popular Categories
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Browse businesses and services in Bahawalpur by category
            </p>
          </div>

          <Button
            variant="ghost"
            asChild
            className="group/link -ml-3 w-fit text-sm font-medium text-muted-foreground hover:text-foreground sm:ml-0"
          >
            <Link href="/categories" className="flex items-center gap-1.5">
              <span>View All Categories</span>
              <ArrowRight className="size-4 transition-transform duration-200 group-hover/link:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/explore?category=${category.slug}`}
                className={cn(
                  "group relative flex flex-col justify-between rounded-xl border border-border bg-card p-4 sm:p-5",
                  "shadow-xs transition-all duration-200",
                  "hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
                )}
              >
                <div>
                  {/* Top: Icon + Count Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground sm:size-12">
                      <Icon className="size-5 sm:size-6" />
                    </div>
                    <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground group-hover:border-primary/30 group-hover:text-foreground">
                      {category.count}
                    </span>
                  </div>

                  {/* Title & Subtext */}
                  <div className="mt-4">
                    <h3 className="font-semibold text-foreground tracking-tight transition-colors group-hover:text-primary sm:text-base">
                      {category.name}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {category.subtext}
                    </p>
                  </div>
                </div>

                {/* Bottom subtle indicator on hover */}
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span>Explore listings</span>
                  <ArrowRight className="size-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategoriesSection;


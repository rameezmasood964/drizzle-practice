"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Layers, Sparkles } from "lucide-react";
import { CategoryCard, type CategoryCardProps } from "../category_card";
import { CategorySearchBar } from "../category_search_bar";
import { PopularCategoriesRow } from "../popular_categories_row";

const MOCK_CATEGORIES_DATA: CategoryCardProps[] = [
  {
    title: "Hostels & Living",
    slug: "hostels-accommodation",
    iconName: "Bed",
    count: 48,
    subcategories: [
      "Boys Hostel",
      "Girls Hostel",
      "Single Seater",
      "Mess Included",
      "AC Rooms",
    ],
  },
  {
    title: "Food & Dining",
    slug: "food-cafes",
    iconName: "UtensilsCrossed",
    count: 85,
    subcategories: [
      "Cafes & Chai",
      "Family Restaurants",
      "Fast Food",
      "Traditional Sweets",
      "BBQ Points",
    ],
  },
  {
    title: "Doctors & Clinics",
    slug: "doctors-clinics",
    iconName: "Stethoscope",
    count: 42,
    subcategories: [
      "General Hospitals",
      "Dentists",
      "Specialist Clinics",
      "Laboratories",
      "Pharmacies",
    ],
  },
  {
    title: "Coaching & Education",
    slug: "education-academies",
    iconName: "GraduationCap",
    count: 30,
    subcategories: [
      "Entry Test Preps",
      "Computer Academies",
      "Tuition Centers",
      "Language Institutes",
    ],
  },
  {
    title: "Shopping & Retail",
    slug: "shopping-markets",
    iconName: "ShoppingBag",
    count: 62,
    subcategories: [
      "Boutiques & Fabrics",
      "Electronics",
      "Mobile Markets",
      "Perfumes & Footwear",
    ],
  },
  {
    title: "Automobile & Workshops",
    slug: "automobile-workshops",
    iconName: "Wrench",
    count: 24,
    subcategories: [
      "Car Mechanics",
      "Automated Car Wash",
      "Spare Parts",
      "Bike Tuning",
    ],
  },
  {
    title: "Gyms & Fitness",
    slug: "gyms-fitness",
    iconName: "Dumbbell",
    count: 18,
    subcategories: [
      "Weight Training",
      "Cardio & Aerobics",
      "Crossfit",
      "Ladies Fitness",
    ],
  },
  {
    title: "Real Estate & Property",
    slug: "real-estate",
    iconName: "Building2",
    count: 35,
    subcategories: [
      "Plots for Sale",
      "Houses for Rent",
      "Commercial Plazas",
      "Agricultural Land",
    ],
  },
  {
    title: "Legal & Documentation",
    slug: "lawyers-consultants",
    iconName: "Scale",
    count: 16,
    subcategories: [
      "Civil Lawyers",
      "Tax Consultants",
      "Stamp Paper",
      "Property Registration",
    ],
  },
];

export function CategoriesView() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFilterSlug, setSelectedFilterSlug] = React.useState("");

  const filteredCategories = React.useMemo(() => {
    return MOCK_CATEGORIES_DATA.filter((cat) => {
      // Filter by quick pill if selected
      if (selectedFilterSlug && cat.slug !== selectedFilterSlug) {
        return false;
      }

      // Filter by search text
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const titleMatches = cat.title.toLowerCase().includes(q);
      const subcategoryMatches = cat.subcategories.some((sub) =>
        sub.toLowerCase().includes(q)
      );

      return titleMatches || subcategoryMatches;
    });
  }, [searchQuery, selectedFilterSlug]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link
            href="/categories"
            className="transition-colors hover:text-foreground"
          >
            Categories
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-medium text-foreground">Bahawalpur</span>
        </nav>

        {/* Page Context Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground">
            <Sparkles className="size-3.5 text-primary" />
            <span>Local Directory Taxonomy</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Browse Bahawalpur Categories
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Explore verified hostels, clinics, cafes, education academies, and
            local service providers organized across our city.
          </p>
        </div>

        {/* Search & Quick Filter Controls */}
        <div className="mt-8 space-y-4">
          <CategorySearchBar
            value={searchQuery}
            onChange={setSearchQuery}
          />

          <PopularCategoriesRow
            activeSlug={selectedFilterSlug}
            onSelectCategory={(slug) => {
              setSelectedFilterSlug(slug);
            }}
          />
        </div>

        {/* Categories Count & Status */}
        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing {filteredCategories.length} of {MOCK_CATEGORIES_DATA.length}{" "}
            categories
          </span>
          {(searchQuery || selectedFilterSlug) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedFilterSlug("");
              }}
              className="text-primary hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Categories Responsive Grid */}
        {filteredCategories.length === 0 ? (
          <div className="mt-10 flex min-h-[260px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
              <Layers className="size-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              No categories match your search
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Try searching with different keywords like "Hostel", "Doctor", or "Food".
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((category) => (
              <CategoryCard key={category.slug} {...category} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoriesView;


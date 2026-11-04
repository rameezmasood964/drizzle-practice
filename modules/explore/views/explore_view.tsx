"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, ArrowUpDown } from "lucide-react";
import { SearchFiltersSidebarWrapper } from "@/modules/explore/components/search_filters_sidebar_wrapper";
import { ListingGridCardWrapper, type ListingCardProps } from "@/modules/explore/components/listing_grid_card_wrapper";
import { ActiveFilterPills } from "@/modules/explore/components/active_filter_pills";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MOCK_EXPLORE_LISTINGS: ListingCardProps[] = [
  {
    id: "1",
    slug: "al-madina-boys-hostel",
    title: "Al-Madina Boys Hostel",
    category: "Hostels & Living",
    area: "Satellite Town",
    imageUrl:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviewCount: 34,
    isOpen: true,
    priceRange: "Rs. 9,500/mo",
    tags: ["Mess Included", "Solar Backup", "High-Speed WiFi"],
    phone: "+923001234567",
    whatsapp: "923001234567",
  },
  {
    id: "2",
    slug: "dr-naveed-dental-clinic",
    title: "Dr. Naveed Dental Clinic",
    category: "Doctors & Clinics",
    area: "Model Town A",
    imageUrl:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewCount: 58,
    isOpen: true,
    priceRange: "Rs. 1,000",
    tags: ["Orthodontist", "Digital X-Ray", "Sterilized"],
    phone: "+923019876543",
    whatsapp: "923019876543",
  },
  {
    id: "3",
    slug: "royal-cafe-grill",
    title: "Royal Cafe & Grill",
    category: "Food & Dining",
    area: "Cantt Commercial",
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviewCount: 82,
    isOpen: true,
    priceRange: "Rs. 800 - 1,800",
    tags: ["Family Hall", "Dine-In", "Live BBQ"],
    phone: "+923023456789",
    whatsapp: "923023456789",
  },
  {
    id: "4",
    slug: "iron-grip-fitness-gym",
    title: "Iron Grip Fitness Gym",
    category: "Gyms & Fitness",
    area: "Dubai Mahal Road",
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    reviewCount: 29,
    isOpen: true,
    priceRange: "Rs. 3,000/mo",
    tags: ["Certified Trainers", "AC Gym", "Cardio Zone"],
    phone: "+923034567890",
    whatsapp: "923034567890",
  },
  {
    id: "5",
    slug: "mehran-girls-hostel",
    title: "Mehran Girls Hostel",
    category: "Hostels & Living",
    area: "Baghdad-ul-Jadeed (IUB)",
    imageUrl:
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviewCount: 42,
    isOpen: true,
    priceRange: "Rs. 10,500/mo",
    tags: ["24/7 Security", "Solar Backup", "Filtered Water"],
    phone: "+923045678901",
    whatsapp: "923045678901",
  },
  {
    id: "6",
    slug: "bismillah-sweets-bakers",
    title: "Bismillah Sweets & Bakers",
    category: "Food & Bakery",
    area: "Farid Gate & Circular Rd",
    imageUrl:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviewCount: 115,
    isOpen: true,
    priceRange: "Under Rs. 500",
    tags: ["Pure Desi Ghee", "Fresh Bakery", "Chai"],
    phone: "+923056789012",
    whatsapp: "923056789012",
  },
  {
    id: "7",
    slug: "al-shifa-clinical-laboratory",
    title: "Al-Shifa Clinical Laboratory",
    category: "Doctors & Clinics",
    area: "Model Town B",
    imageUrl:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    reviewCount: 38,
    isOpen: true,
    priceRange: "Routine Tests",
    tags: ["Digital Reports", "Home Sampling", "24/7"],
    phone: "+923067890123",
    whatsapp: "923067890123",
  },
  {
    id: "8",
    slug: "qasr-e-noor-fashion-fabrics",
    title: "Qasr-e-Noor Fashion Fabrics",
    category: "Shopping & Retail",
    area: "Circular Road",
    imageUrl:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
    rating: 4.5,
    reviewCount: 27,
    isOpen: false,
    priceRange: "Rs. 2,000 - 15,000",
    tags: ["Bridal Fabrics", "Unstitched Suits", "AC Showroom"],
    phone: "+923078901234",
    whatsapp: "923078901234",
  },
];

export function ExploreView() {
  const [sortBy, setSortBy] = React.useState("top-rated");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
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
            href="/explore"
            className="transition-colors hover:text-foreground"
          >
            Explore
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-medium text-foreground">Bahawalpur</span>
        </nav>

        {/* Page Context Header */}
        <div className="mb-6 space-y-1 sm:mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Explore Businesses & Services in Bahawalpur
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Find verified hostels, clinics, cafes, and local shops.
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* Desktop Left Sidebar & Mobile Drawer Trigger */}
          <SearchFiltersSidebarWrapper />

          {/* Right Main Column */}
          <main className="flex-1 min-w-0 space-y-5">
            {/* Action Bar (Results count, sort selector) */}
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              {/* Total Results Summary */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  Showing {MOCK_EXPLORE_LISTINGS.length} places
                </span>
                <span className="text-xs text-muted-foreground">
                  in Bahawalpur
                </span>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Sort by:
                </span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8 w-[160px] text-xs">
                    <ArrowUpDown className="size-3 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="top-rated">Top Rated</SelectItem>
                    <SelectItem value="most-popular">Most Popular</SelectItem>
                    <SelectItem value="newest">Newest Added</SelectItem>
                    <SelectItem value="name-asc">Name (A - Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filter Pills Bar */}
            <ActiveFilterPills />

            {/* Responsive Listings Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {MOCK_EXPLORE_LISTINGS.map((listing) => (
                <ListingGridCardWrapper key={listing.id} {...listing} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ExploreView;

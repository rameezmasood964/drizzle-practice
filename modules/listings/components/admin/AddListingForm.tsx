"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import all child form sections from listingFormComponents
import BasicInfoSection from "./listingFormComponents/BasicInfoSection";
import ContactSection from "./listingFormComponents/ContactSection";
import LocationSection from "./listingFormComponents/LocationSection";
import CustomFieldsSection from "./listingFormComponents/CustomFieldsSection";
import MediaSection from "./listingFormComponents/MediaSection";
import CategorySection from "./listingFormComponents/CategorySection";
import StatusSection from "./listingFormComponents/StatusSection";
import BusinessHoursSection from "./listingFormComponents/BusinessHoursSection";

export default function AddListingForm() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* 1. Header with Breadcrumb & Top Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Link
              href="/admin/listings"
              className="hover:text-foreground transition-colors"
            >
              Listings
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Add Listing</span>
          </nav>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Add New Listing
          </h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details to create a new business listing.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" className="px-5">
            Cancel
          </Button>
         <Button type="submit" className="px-6 bg-blue-600 hover:bg-blue-700 text-white">
            Save Listing
          </Button>
        </div>
      </div>

      {/* 2. Main Form Grid (2 Columns: Left content + Right sidebar) */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Left Column (8 cols wide on desktop) */}
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            <BasicInfoSection />
            <ContactSection />
            <LocationSection />
            <CustomFieldsSection />
            <MediaSection />
          </div>

          {/* Right Column (5 cols / 4 cols wide on desktop) */}
          <div className="space-y-6 lg:col-span-5 xl:col-span-4">
            <CategorySection />
            <StatusSection />
            <BusinessHoursSection />
          </div>

        </div>

        {/* 3. Bottom Action Footer */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" className="px-5">
            Cancel
          </Button>
          <Button type="submit" >
            Save Listing
          </Button>
        </div>
      </form>
    </div>
  );
}
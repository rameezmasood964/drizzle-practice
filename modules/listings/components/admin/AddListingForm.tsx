"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Form Sections
import BasicInfoSection from "./listingFormComponents/BasicInfoSection";
import ContactSection from "./listingFormComponents/ContactSection";
import LocationSection from "./listingFormComponents/LocationSection";
import CustomFieldsSection from "./listingFormComponents/CustomFieldsSection";
import MediaSection from "./listingFormComponents/MediaSection";
import CategorySection from "./listingFormComponents/CategorySection";
import StatusSection from "./listingFormComponents/StatusSection";
import BusinessHoursSection from "./listingFormComponents/BusinessHoursSection";

// React Hook Form & Zod
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { listingFormSchema, type ListingFormValues } from "../../schema";
import type { AddListingFormProps } from "@/modules/listings/types";

export default function AddListingForm({
  areas = [],
  categories = [],
}: AddListingFormProps) {
  // 1. Initialize React Hook Form with strict typing & updated default values
  const methods = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      phone: "",
      whatsapp: "",
      email: "",
      website: "",
      // Location fields synced
      areaId: undefined,
      address: "",
      landmark: "",
      mapsUrl: "",
      city: "Bahawalpur",
      state: "Punjab",
      postalCode: "63100",
      // Categories & status
      categoryId: "",
      subCategoryId: "",
      status: "active",
      isFeatured: false,
      // Arrays & Objects
      images: [],
      customFields: {},
      businessHours: {
        monday: { isOpen: true, openTime: "09:00 AM", closeTime: "10:00 PM" },
        tuesday: { isOpen: true, openTime: "09:00 AM", closeTime: "10:00 PM" },
        wednesday: {
          isOpen: true,
          openTime: "09:00 AM",
          closeTime: "10:00 PM",
        },
        thursday: { isOpen: true, openTime: "09:00 AM", closeTime: "10:00 PM" },
        friday: { isOpen: true, openTime: "09:00 AM", closeTime: "10:00 PM" },
        saturday: { isOpen: true, openTime: "09:00 AM", closeTime: "10:00 PM" },
        sunday: { isOpen: true, openTime: "09:00 AM", closeTime: "10:00 PM" },
      },
    },
  });

  // 2. Submit Handlers
  const onSubmit = async (data: ListingFormValues) => {
    console.log("Validated Form Data (Ready for Server Action):", data);
    // Yahan hum createListing Server Action call karenge
  };

  const onError = (errors: unknown) => {
    console.error("Form Validation Errors:", errors);
  };

  const isSubmitting = methods.formState.isSubmitting;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit, onError)}
        className="mx-auto max-w-7xl space-y-6 pb-12"
      >
        {/* 1. Header with Breadcrumb & Top Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {/* Breadcrumb */}
            <nav className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link
                href="/admin/listings"
                className="transition-colors hover:text-foreground"
              >
                Listings
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">Add Listing</span>
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
            <Button type="button" variant="outline" className="px-5" asChild>
              <Link href="/admin/listings">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? "Saving..." : "Save Listing"}
            </Button>
          </div>
        </div>

        {/* 2. Main Form Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            <BasicInfoSection />
            <ContactSection />
            <LocationSection areas={areas} />
            <CustomFieldsSection />
            <MediaSection />
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:col-span-5 xl:col-span-4">
            <CategorySection categories={categories} />
            <StatusSection />
            <BusinessHoursSection />
          </div>
        </div>

        {/* 3. Bottom Action Footer */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" className="px-5" asChild>
            <Link href="/admin/listings">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="px-6">
            {isSubmitting ? "Saving..." : "Save Listing"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

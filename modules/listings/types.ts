import { getListings } from "./queries";
import { listingFormSchema } from "./schema";
import { z } from "zod";

// getListings query ke return hone wale data se automatic type banti hai
export type ListingItem = NonNullable<
  Awaited<ReturnType<typeof getListings>>["data"]
>[number];

export interface ListingHeaderProps {
  title?: string;
  description?: string;
}

export interface ListingStatsProps {
  total?: number;
  approved?: number;
  pending?: number;
  draft?: number;
  rejected?: number;
}

export interface CategoryFilterOption {
  id: string;
  name: string;
}

export interface ListingFiltersProps {
  categories?: CategoryFilterOption[];
}

export interface ListingsTableProps {
  listings?: ListingItem[];
}

export interface ListingsDashboardWrapperProps {
  stats?: ListingStatsProps;
  listings?: ListingItem[];
  categories?: CategoryFilterOption[];
}

// lisiting form all types

// 1. Business Hours Types
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface DaySchedule {
  isOpen: boolean;
  openTime: string; // e.g., "09:00 AM"
  closeTime: string; // e.g., "10:00 PM"
}

export type BusinessHours = Record<DayOfWeek, DaySchedule>;

// 2. Listing Status & Media Types
export type ListingStatus = "active" | "pending" | "draft" | "rejected";

export interface ListingMedia {
  id: string;
  url: string;
  isCover: boolean;
  file?: File; // Agar user ne fresh upload kiya ho
}

// 3. Dynamic Custom Fields Types (EAV / JSONB payload)
export type CustomFieldValue = string | number | boolean | string[];

export interface DynamicCustomFields {
  [key: string]: CustomFieldValue;
}

// 4. Category & Subcategory Schema Types
export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  subCategories?: SubCategory[];
}
// Ab manual 20 lines likhne ke bajaye direct schema se infer ho gaya
export type ListingFormData = z.infer<typeof listingFormSchema>;
// modules/listings/types.ts
import { getAdminListings, getListingStats } from "./queries";
import { listingFormSchema } from "./schema";
import { z } from "zod";

// ==========================================
// Dashboard & Queries Types
// ==========================================

// getAdminListings query ke return hone wale data se automatic type extraction
export type ListingItem = NonNullable<
  Awaited<ReturnType<typeof getAdminListings>>["data"]
>[number];

// Stats query se return hone wala type
export type ListingStatsData = Awaited<ReturnType<typeof getListingStats>>;

export interface ListingHeaderProps {
  title?: string;
  description?: string;
}

export interface ListingStatsProps {
  total?: number;
  approved?: number;
  pending?: number;
  featured?: number;
  draft?: number;
  rejected?: number;
}

export interface CategoryFilterOption {
  id: number | string;
  name: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export interface ListingFiltersProps {
  categories?: CategoryFilterOption[];
}

export interface ListingsTableProps {
  listings?: ListingItem[];
  pagination?: PaginationProps;
  categoryFieldsMap?: Record<string, any[]>;
}

export interface ListingsDashboardWrapperProps {
  stats?: ListingStatsProps;
  listings?: ListingItem[];
  categories?: CategoryFilterOption[];
  pagination?: PaginationProps;
  categoryFieldsMap?: Record<string, any[]>;
}

// ==========================================
// Listing Form Specific Types
// ==========================================

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
  openTime: string;
  closeTime: string;
}

export type BusinessHours = Record<DayOfWeek, DaySchedule>;

// 2. Listing Status & Media Types
export type ListingStatus = "approved" | "pending" | "draft" | "rejected";

export interface ListingMedia {
  id: string;
  url: string;
  isCover: boolean;
  file?: File;
}

// 3. Dynamic Custom Fields Types
export type CustomFieldValue = string | number | boolean | string[];

export interface DynamicCustomFields {
  [key: string]: CustomFieldValue;
}

// 4. Category & Subcategory Types
export interface SubCategory {
  id: number | string;
  name: string;
  slug: string;
  categoryId: number | string;
}

export interface Category {
  id: number | string;
  name: string;
  slug: string;
  subCategories?: SubCategory[];
}

// 5. Area Option (Areas table se fetch hone wale active records)
export interface AreaOption {
  id: number;
  name: string;
  slug: string;
}

// 6. Form Values Type (Central Single Source of Truth from Zod)
export type ListingFormValues = z.infer<typeof listingFormSchema>;
export type ListingFormData = ListingFormValues;

// 7. Component Props
export interface AddListingFormProps {
  areas: AreaOption[];
  categories?: Category[];
  categoryFieldsMap?: Record<string, any[]>;
}

export interface LocationSectionProps {
  areas: AreaOption[];
}

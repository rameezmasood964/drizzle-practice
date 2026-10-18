import { getListings } from "./queries";

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

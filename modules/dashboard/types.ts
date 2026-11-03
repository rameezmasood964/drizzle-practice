export interface DashboardStats {
  activeListings: number;
  pendingListings: number;
  featuredListings: number;
  totalCategories: number;
  activeAreas: number;
}

export interface RecentListingItem {
  id: number;
  title: string;
  slug: string;
  status: "draft" | "pending" | "approved" | "rejected" | "expired";
  isFeatured: boolean;
  createdAt: Date | string;
  categoryName: string | null;
  areaName: string | null;
}

export interface CategoryBreakdownItem {
  categoryId: number;
  categoryName: string;
  listingCount: number;
  percentage: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentListings: RecentListingItem[];
  categoryBreakdown: CategoryBreakdownItem[];
}

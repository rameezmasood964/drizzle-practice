import { db } from "@/db";
import { listings, categories, areas } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import type {
  DashboardStats,
  RecentListingItem,
  CategoryBreakdownItem,
  DashboardData,
} from "./types";

/**
 * 1. Targeted SQL aggregations for high-performance dashboard KPI stats
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [listingStats] = await db
      .select({
        approved: sql<number>`count(*) filter (where ${listings.status} = 'approved')::int`,
        pending: sql<number>`count(*) filter (where ${listings.status} = 'pending')::int`,
        featured: sql<number>`count(*) filter (where ${listings.isFeatured} = true)::int`,
      })
      .from(listings);

    const [categoryStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
      })
      .from(categories);

    const [areaStats] = await db
      .select({
        active: sql<number>`count(*) filter (where ${areas.isActive} = true)::int`,
      })
      .from(areas);

    return {
      activeListings: listingStats?.approved ?? 0,
      pendingListings: listingStats?.pending ?? 0,
      featuredListings: listingStats?.featured ?? 0,
      totalCategories: categoryStats?.total ?? 0,
      activeAreas: areaStats?.active ?? 0,
    };
  } catch (error) {
    console.error("GET_DASHBOARD_STATS_ERROR:", error);
    return {
      activeListings: 0,
      pendingListings: 0,
      featuredListings: 0,
      totalCategories: 0,
      activeAreas: 0,
    };
  }
}

/**
 * 2. Fetch only the latest 5 listings with joined category and area
 */
export async function getRecentListings(
  limit = 5,
): Promise<RecentListingItem[]> {
  try {
    const rows = await db
      .select({
        id: listings.id,
        title: listings.title,
        slug: listings.slug,
        status: listings.status,
        isFeatured: listings.isFeatured,
        createdAt: listings.createdAt,
        categoryName: categories.name,
        areaName: areas.name,
      })
      .from(listings)
      .leftJoin(categories, eq(listings.categoryId, categories.id))
      .leftJoin(areas, eq(listings.areaId, areas.id))
      .orderBy(desc(listings.createdAt))
      .limit(limit);

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      status: r.status as RecentListingItem["status"],
      isFeatured: Boolean(r.isFeatured),
      createdAt: r.createdAt,
      categoryName: r.categoryName ?? null,
      areaName: r.areaName ?? null,
    }));
  } catch (error) {
    console.error("GET_RECENT_LISTINGS_ERROR:", error);
    return [];
  }
}

/**
 * 3. Group listings by category to return top categories with their percentage share
 */
export async function getCategoryBreakdown(
  limit = 5,
): Promise<CategoryBreakdownItem[]> {
  try {
    const [totalListingsResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(listings);

    const totalListings = totalListingsResult?.count ?? 0;

    const rows = await db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        listingCount: sql<number>`count(${listings.id})::int`,
      })
      .from(listings)
      .innerJoin(categories, eq(listings.categoryId, categories.id))
      .groupBy(categories.id, categories.name)
      .orderBy(sql`count(${listings.id}) DESC`)
      .limit(limit);

    return rows.map((r) => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      listingCount: r.listingCount,
      percentage:
        totalListings > 0
          ? Math.round((r.listingCount / totalListings) * 100)
          : 0,
    }));
  } catch (error) {
    console.error("GET_CATEGORY_BREAKDOWN_ERROR:", error);
    return [];
  }
}

/**
 * Parallel execution of all dashboard queries for <100ms load times
 */
export async function getDashboardData(): Promise<DashboardData> {
  const [stats, recentListings, categoryBreakdown] = await Promise.all([
    getDashboardStats(),
    getRecentListings(5),
    getCategoryBreakdown(5),
  ]);

  return {
    stats,
    recentListings,
    categoryBreakdown,
  };
}

import { db } from "@/db";
import { reviews, listings } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Server-side rating recalculator:
 * Computes count and average rating for approved reviews, and updates cached columns in listings table.
 */
export async function recalculateListingRating(listingId: number) {
  // 1. Compute aggregate count and average rating for approved reviews only
  const [stats] = await db
    .select({
      totalCount: sql<number>`count(${reviews.id})::int`,
      avgRating: sql<string>`coalesce(round(avg(${reviews.rating})::numeric, 2), 0.00)::text`,
    })
    .from(reviews)
    .where(and(eq(reviews.listingId, listingId), eq(reviews.status, "approved")));

  const reviewCount = stats?.totalCount ?? 0;
  const averageRating = stats?.avgRating ?? "0.00";

  // 2. Update the cached columns in listings table
  await db
    .update(listings)
    .set({
      averageRating: averageRating,
      reviewCount: reviewCount,
    })
    .where(eq(listings.id, listingId));

  return { reviewCount, averageRating };
}

/**
 * Format rating to one decimal place string (e.g., 4.5)
 */
export function formatRating(rating: number): string {
  if (isNaN(rating) || rating === 0) return "0.0";
  return Number(rating).toFixed(1);
}

/**
 * Calculate average rating from an array of ratings
 */
export function calculateAverageRating(ratings: number[]): number {
  if (!ratings.length) return 0;
  const sum = ratings.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / ratings.length).toFixed(2));
}

import { db } from "@/db";
import { reviews, listings, profiles, categories } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { ReviewFilters, ReviewItem, ReviewStats, ReviewStatus } from "./types";

const parentCategories = alias(categories, "parent_categories");

/**
 * Fetch reviews list with listing and reviewer relations for admin moderation
 */
export async function getAdminReviews(
  params: ReviewFilters = {},
): Promise<ReviewItem[]> {
  try {
    const conditions = [];

    if (params.status && params.status !== "all") {
      conditions.push(eq(reviews.status, params.status));
    }
    if (params.rating && params.rating !== "all") {
      conditions.push(eq(reviews.rating, Number(params.rating)));
    }

    const data = await db
      .select({
        id: reviews.id,
        listingId: reviews.listingId,
        listingTitle: listings.title,
        listingSlug: listings.slug,
        categoryId: listings.categoryId,
        categoryName: categories.name,
        parentCategoryId: categories.parentId,
        parentCategoryName: parentCategories.name,
        userId: reviews.userId,
        userName: profiles.fullName,
        userEmail: profiles.phone,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        status: reviews.status,
        rejectionReason: reviews.rejectionReason,
        ownerReply: reviews.ownerReply,
        ownerRepliedAt: reviews.ownerRepliedAt,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .innerJoin(listings, eq(reviews.listingId, listings.id))
      .leftJoin(categories, eq(listings.categoryId, categories.id))
      .leftJoin(parentCategories, eq(categories.parentId, parentCategories.id))
      .leftJoin(profiles, eq(reviews.userId, profiles.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(reviews.createdAt));

    return data.map((r) => {
      const parentName = r.parentCategoryName;
      const catName = r.categoryName;
      const listingCategory = parentName
        ? `${parentName} > ${catName}`
        : catName || "Uncategorized";

      return {
        id: r.id,
        listingId: r.listingId,
        listingTitle: r.listingTitle,
        listingCategory,
        categoryId: r.categoryId,
        subCategoryId: r.parentCategoryId ? r.categoryId : null,
        parentCategoryId: r.parentCategoryId || r.categoryId,
        userId: r.userId,
        userName: r.userName || "Verified User",
        userEmail: r.userEmail || undefined,
        userAvatar: null,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        status: r.status as ReviewStatus,
        rejectionReason: r.rejectionReason,
        ownerReply: r.ownerReply,
        ownerRepliedAt: r.ownerRepliedAt,
        createdAt: r.createdAt,
      };
    });
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    return [];
  }
}

/**
 * Fetch aggregated statistics across reviews table
 */
export async function getAdminReviewStats(): Promise<ReviewStats> {
  try {
    const [stats] = await db
      .select({
        total: sql<number>`count(${reviews.id})::int`,
        pending: sql<number>`count(case when ${reviews.status} = 'pending' then 1 end)::int`,
        approved: sql<number>`count(case when ${reviews.status} = 'approved' then 1 end)::int`,
        rejected: sql<number>`count(case when ${reviews.status} = 'rejected' then 1 end)::int`,
        avgRating: sql<number>`coalesce(round(avg(case when ${reviews.status} = 'approved' then ${reviews.rating} end)::numeric, 1), 0.0)::float`,
      })
      .from(reviews);

    return {
      totalReviews: stats?.total ?? 0,
      pendingCount: stats?.pending ?? 0,
      approvedCount: stats?.approved ?? 0,
      rejectedCount: stats?.rejected ?? 0,
      averageRating: stats?.avgRating ?? 0,
    };
  } catch (error) {
    console.error("Error fetching review stats:", error);
    return {
      totalReviews: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      averageRating: 0,
    };
  }
}

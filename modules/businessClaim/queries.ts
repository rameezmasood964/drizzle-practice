import { db } from "@/db";
import { claims, listings, profiles, categories } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { ClaimFilters, ClaimItem, ClaimStats, ClaimStatus } from "./types";

const parentCategories = alias(categories, "parent_categories");
const reviewers = alias(profiles, "claim_reviewers");

/**
 * Fetch business claims with relational metadata for administrative moderation
 */
export async function getAdminClaims(
  filters: ClaimFilters = { status: "all", search: "" },
): Promise<ClaimItem[]> {
  try {
    const conditions = [];

    if (filters.status && filters.status !== "all") {
      conditions.push(eq(claims.status, filters.status));
    }

    const data = await db
      .select({
        id: claims.id,
        listingId: claims.listingId,
        listingTitle: listings.title,
        listingSlug: listings.slug,
        categoryId: listings.categoryId,
        categoryName: categories.name,
        parentCategoryId: categories.parentId,
        parentCategoryName: parentCategories.name,
        userId: claims.userId,
        claimantName: claims.claimantName,
        claimantEmail: claims.claimantEmail,
        claimantPhone: claims.claimantPhone,
        claimantRole: claims.claimantRole,
        proofDocumentUrl: claims.proofDocumentUrl,
        notes: claims.notes,
        status: claims.status,
        rejectionReason: claims.rejectionReason,
        reviewedBy: claims.reviewedBy,
        reviewerName: reviewers.fullName,
        reviewedAt: claims.reviewedAt,
        createdAt: claims.createdAt,
      })
      .from(claims)
      .innerJoin(listings, eq(claims.listingId, listings.id))
      .leftJoin(categories, eq(listings.categoryId, categories.id))
      .leftJoin(parentCategories, eq(categories.parentId, parentCategories.id))
      .leftJoin(profiles, eq(claims.userId, profiles.id))
      .leftJoin(reviewers, eq(claims.reviewedBy, reviewers.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(claims.createdAt));

    return data.map((r) => {
      const parentName = r.parentCategoryName;
      const catName = r.categoryName;
      const categoryBreadcrumb = parentName
        ? `${parentName} > ${catName}`
        : catName || undefined;

      return {
        id: r.id,
        listingId: r.listingId,
        listingTitle: r.listingTitle,
        listingSlug: r.listingSlug,
        categoryName: categoryBreadcrumb,
        userId: r.userId,
        claimantName: r.claimantName,
        claimantEmail: r.claimantEmail,
        claimantPhone: r.claimantPhone,
        claimantRole: r.claimantRole,
        proofDocumentUrl: r.proofDocumentUrl,
        notes: r.notes,
        status: r.status as ClaimStatus,
        rejectionReason: r.rejectionReason,
        reviewedByName: r.reviewerName || (r.reviewedBy ? "Admin" : null),
        reviewedAt: r.reviewedAt,
        createdAt: r.createdAt,
      };
    });
  } catch (error) {
    console.error("Error fetching admin claims:", error);
    return [];
  }
}

/**
 * Fetch aggregated metrics across the claims table
 */
export async function getClaimStats(): Promise<ClaimStats> {
  try {
    const [stats] = await db
      .select({
        total: sql<number>`count(${claims.id})::int`,
        pending: sql<number>`count(case when ${claims.status} = 'pending' then 1 end)::int`,
        approved: sql<number>`count(case when ${claims.status} = 'approved' then 1 end)::int`,
        rejected: sql<number>`count(case when ${claims.status} = 'rejected' then 1 end)::int`,
      })
      .from(claims);

    return {
      totalClaims: stats?.total ?? 0,
      pendingCount: stats?.pending ?? 0,
      approvedCount: stats?.approved ?? 0,
      rejectedCount: stats?.rejected ?? 0,
    };
  } catch (error) {
    console.error("Error fetching claim stats:", error);
    return {
      totalClaims: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
    };
  }
}


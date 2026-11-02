// modules/listings/queries.ts
import { db } from "@/app/db";
import { listings, areas, categories } from "@/app/db/schema";

import { eq, desc, ilike, and, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

// Parent Category ke liye alias taake self-referential categories join ho sakein
const parentCategories = alias(categories, "parent_categories");

export interface GetListingsParams {
  search?: string;
  status?: "draft" | "pending" | "approved" | "rejected";
  categoryId?: number;
  areaId?: number;
  limit?: number;
  offset?: number;
}

// 1. Admin Table ke liye (With Search, Filter, Pagination & Joins)
export async function getAdminListings({
  search,
  status,
  categoryId,
  areaId,
  limit = 10,
  offset = 0,
}: GetListingsParams = {}) {
  try {
    const conditions = [];

    // Search filter (Title ya Phone par)
    if (search && search.trim() !== "") {
      conditions.push(
        or(
          ilike(listings.title, `%${search}%`),
          ilike(listings.phone, `%${search}%`),
        ),
      );
    }

    // Status filter
    if (status) {
      conditions.push(eq(listings.status, status));
    }

    // Area filter
    if (areaId) {
      conditions.push(eq(listings.areaId, areaId));
    }

    // Category filter
    if (categoryId) {
      conditions.push(eq(listings.categoryId, categoryId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Data query with Joins
    const data = await db
      .select({
        id: listings.id,
        title: listings.title,
        slug: listings.slug,
        phone: listings.phone,
        status: listings.status,
        isFeatured: listings.isFeatured,
        createdAt: listings.createdAt,
        // Joined Area
        area: {
          id: areas.id,
          name: areas.name,
        },
        // Joined Category (Sub-category ya Direct Category)
        category: {
          id: categories.id,
          name: categories.name,
          parentId: categories.parentId,
        },
        // Joined Parent Category (agar category khud ek sub-category thi)
        parentCategory: {
          id: parentCategories.id,
          name: parentCategories.name,
        },
      })
      .from(listings)
      .leftJoin(areas, eq(listings.areaId, areas.id))
      .leftJoin(categories, eq(listings.categoryId, categories.id))
      .leftJoin(parentCategories, eq(categories.parentId, parentCategories.id))
      .where(whereClause)
      .orderBy(desc(listings.createdAt))
      .limit(limit)
      .offset(offset);

    // Total Count query (Pagination ke liye)
    const [{ totalCount }] = await db
      .select({ totalCount: sql<number>`count(*)::int` })
      .from(listings)
      .where(whereClause);

    return {
      success: true,
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error("GET_ADMIN_LISTINGS_ERROR:", error);
    return {
      success: false,
      data: [],
      totalCount: 0,
      totalPages: 0,
    };
  }
}

// 2. Single Listing Fetch (Slug ke zariye - Public View ke liye)
export async function getListingBySlug(slug: string) {
  try {
    const [listing] = await db
      .select({
        id: listings.id,
        title: listings.title,
        slug: listings.slug,
        description: listings.description,
        phone: listings.phone,
        whatsapp: listings.whatsapp,
        email: listings.email,
        website: listings.website,
        address: listings.address,
        landmark: listings.landmark,
        mapsUrl: listings.mapsUrl,
        details: listings.details,
        businessHours: listings.businessHours,
        status: listings.status,
        isFeatured: listings.isFeatured,
        createdAt: listings.createdAt,
        area: {
          id: areas.id,
          name: areas.name,
        },
        category: {
          id: categories.id,
          name: categories.name,
        },
        parentCategory: {
          id: parentCategories.id,
          name: parentCategories.name,
        },
      })
      .from(listings)
      .leftJoin(areas, eq(listings.areaId, areas.id))
      .leftJoin(categories, eq(listings.categoryId, categories.id))
      .leftJoin(parentCategories, eq(categories.parentId, parentCategories.id))
      .where(eq(listings.slug, slug))
      .limit(1);

    return listing || null;
  } catch (error) {
    console.error("GET_LISTING_BY_SLUG_ERROR:", error);
    return null;
  }
}

// 3. Single Listing Fetch (ID ke zariye - Admin Edit form ke liye)
export async function getListingById(id: number) {
  try {
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, id))
      .limit(1);

    return listing || null;
  } catch (error) {
    console.error("GET_LISTING_BY_ID_ERROR:", error);
    return null;
  }
}



export async function getListingStats() {
  try {
    const [counts] = await db
      .select({
        total: sql<number>`count(*)::int`,
        approved: sql<number>`count(case when ${listings.status} = 'approved' then 1 end)::int`,
        pending: sql<number>`count(case when ${listings.status} = 'pending' then 1 end)::int`,
        featured: sql<number>`count(case when ${listings.isFeatured} = true then 1 end)::int`,
      })
      .from(listings);

    return counts || { total: 0, approved: 0, pending: 0, featured: 0 };
  } catch (error) {
    console.error("GET_LISTING_STATS_ERROR:", error);
    return { total: 0, approved: 0, pending: 0, featured: 0 };
  }
}
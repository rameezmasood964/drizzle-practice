
import { db } from "@/db";
import { areas } from "@/db/schema";
import { desc, eq, asc, ilike, sql } from "drizzle-orm";

export interface GetAdminAreasParams {
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * 1. Admin Table ke liye:
 * Sare areas fetch karta hai (Active aur Inactive dono).
 * Search by name (case-insensitive) aur pagination support karta hai.
 */
export async function getAdminAreas(params?: GetAdminAreasParams) {
  try {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.max(1, Number(params?.limit) || 10);
    const offset = (page - 1) * limit;
    const search = params?.search?.trim();

    const whereClause = search ? ilike(areas.name, `%${search}%`) : undefined;

    // Total Count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(areas)
      .where(whereClause);

    const totalCount = countResult?.count ?? 0;
    const totalPages = Math.ceil(totalCount / limit) || 1;

    // Paginated list
    const data = await db
      .select()
      .from(areas)
      .where(whereClause)
      .orderBy(desc(areas.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      data,
      totalCount,
      totalPages,
      currentPage: page,
      limit,
    };
  } catch (error) {
    console.error("GET_ADMIN_AREAS_ERROR:", error);
    return {
      success: false,
      data: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      limit: 10,
    };
  }
}

/**
 * 2. Public / Listings Form ke liye:
 * Sirf Active areas laata hai taake dropdown clean rahe aur alphabetical order mein ho.
 */

export async function getActiveAreas() {
  try {
    const data = await db.query.areas.findMany({
      where: (a, { eq }) => eq(a.isActive, true),
      orderBy: (a, { asc, sql }) => [
        // Agar slug 'other' ya 'other-nearby' ho toh 1 (last), warna 0 (first)
        asc(sql`CASE WHEN ${a.slug} IN ('other', 'other-nearby') THEN 1 ELSE 0 END`),
        // Normal areas A to Z sort honge
        asc(a.name),
      ],
    });

    return { success: true, data };
  } catch (error) {
    console.error("GET_ACTIVE_AREAS_ERROR:", error);
    return { success: false, data: [] };
  }
}

/**
 * 3. Dropdown list for filters
 */
export async function getAreasDropdown() {
  try {
    return await db
      .select({ id: areas.id, name: areas.name })
      .from(areas)
      .orderBy(asc(areas.name));
  } catch (error) {
    console.error("GET_AREAS_DROPDOWN_ERROR:", error);
    return [];
  }
}

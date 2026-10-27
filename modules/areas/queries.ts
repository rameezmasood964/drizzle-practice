
import { db } from "@/app/db";
import { areas } from "@/app/db/schema";
import { desc, eq, asc } from "drizzle-orm";

/**
 * 1. Admin Table ke liye:
 * Sare areas fetch karta hai (Active aur Inactive dono).
 * Latest areas sabse upar aayenge.
 */
export async function getAdminAreas() {
  try {
    const data = await db.query.areas.findMany({
      orderBy: [desc(areas.createdAt)],
    });
    return { success: true, data };
  } catch (error) {
    console.error("GET_ADMIN_AREAS_ERROR:", error);
    return { success: false, data: [] };
  }
}

/**
 * 2. Public / Listings Form ke liye:
 * Sirf Active areas laata hai taake dropdown clean rahe aur alphabetical order mein ho.
 */
export async function getActiveAreas() {
  try {
    const data = await db.query.areas.findMany({
      where: eq(areas.isActive, true),
      orderBy: [asc(areas.name)],
    });
    return { success: true, data };
  } catch (error) {
    console.error("GET_ACTIVE_AREAS_ERROR:", error);
    return { success: false, data: [] };
  }
}
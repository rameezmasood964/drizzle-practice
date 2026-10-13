
import { db } from "@/app/db";
import { categories } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function getCategories() {
  try {
    const data = await db.query.categories.findMany({
      // 🌟 Sirf wohi categories fetch karo jo active hain
      where: (categories, { eq }) => eq(categories.isActive, true),
      orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
    });

    return data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}
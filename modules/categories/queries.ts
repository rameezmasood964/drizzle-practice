import { db } from "@/app/db";
import { categories } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { inArray } from "drizzle-orm";

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

export async function getCategoryById(categoryId: number) {
  try {
    const data = await db.query.categories.findFirst({
      where: (categories, { eq }) => eq(categories.id, categoryId),
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch category by ID:", error);
    return null;
  }
}

export async function getCategoryFields(categoryId: number) {
  try {
    const data = await db.query.categoryFields.findMany({
      where: (fields, { eq, and }) =>
        and(eq(fields.categoryId, categoryId), eq(fields.isActive, true)),
      orderBy: (fields, { asc }) => [asc(fields.sortOrder)],
    });
    return data;
  } catch {
    return [];
  }
}

export async function getCategoryFieldsWithInheritance(categoryId: number) {
  try {
    const data = await db.query.categories.findFirst({
      where: (categories, { eq }) => eq(categories.id, categoryId),
    });

    if (!data) {
      return [];
    }
    // check kiya: "Kya is category ka parentId mojood hai?"
    // Haan, mojood hai (1).
    // Toh categoryIds.push(1) chala.
    // Result: Hamari list ab ban chuki hai: [3, 1] (Child ID + Parent ID).
    const categoryIds = [categoryId];
    if (data.parentId) {
      categoryIds.push(data.parentId);
    }

    // / 3. Dono categories ki active fields ek sath fetch karein
    const fields = await db.query.categoryFields.findMany({
      where: (fields, { and, eq, inArray }) =>
        and(inArray(fields.categoryId, categoryIds), eq(fields.isActive, true)),
      orderBy: (fields, { asc }) => [asc(fields.sortOrder)],
    });

    // 4. Duplicate keys ko filter karein (Child ko hamesha Parent par tarjeeh milegi)
    const uniqueFieldsMap = new Map();

    for (const field of fields) {
      const existing = uniqueFieldsMap.get(field.key);

      // Agar pehle se koi field nahi hai TOH add karo
      if (!existing) {
        uniqueFieldsMap.set(field.key, field);
      }
      // Lekin agar pehle Parent ki field save hui thi aur ab Child ki apni field aayi hai, TOH Child se replace kar do!
      else if (field.categoryId === categoryId) {
        uniqueFieldsMap.set(field.key, field);
      }
    }

    return Array.from(uniqueFieldsMap.values());
  } catch (error) {
    console.error("Failed to fetch inherited fields:", error);
    return [];
  }
}

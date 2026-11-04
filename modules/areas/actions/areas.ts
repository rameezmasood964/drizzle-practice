"use server";

import { db } from "@/db";
import { areas } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { eq, sql } from "drizzle-orm";
import { areaSchema, updateAreaSchema } from "../schema";
import { createSlug } from "@/lib/utils";

function handleAreaDbError(error: any, inputs?: { name?: string }) {
  const pgError = error.cause || error;
  const errorCode = pgError.code || error.code;
  const constraintName = pgError.constraint_name || error.constraint_name || "";

  // Duplicate Name ya Slug
  if (errorCode === "23505") {
    if (constraintName.includes("slug")) {
      return {
        success: false,
        errors: { name: ["An area with a similar name/slug already exists."] },
        message: "An area with a similar name or slug already exists. Please choose a different name.",
        inputs,
      };
    }
    if (constraintName.includes("name")) {
      return {
        success: false,
        errors: { name: ["Area Name already exists."] },
        inputs,
      };
    }
  }

  // 🌟 Foreign Key Restriction (Listings exist karti hain)
  if (errorCode === "23503") {
    return {
      success: false,
      message: "Cannot delete this area because active listings are linked to it. Remove listings first.",
      inputs,
    };
  }

  console.error("AREA ACTION CRITICAL ERROR:", error);
  return {
    success: false,
    message: "Internal server error. Please try again later.",
    inputs,
  };
}

/* ------------------------------ ADD AREA ------------------------------ */
export async function addArea(prevState: any, formdata: FormData) {
  const rawdata = Object.fromEntries(formdata);
  const result = areaSchema.safeParse(rawdata);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
      inputs: {
        name: (rawdata.name as string) || "",
      },
    };
  }

  const { name } = result.data;
  const slug = createSlug(name);

  if (!slug) {
    return {
      success: false,
      errors: { name: ["Please enter a valid area name that can produce a URL slug."] },
      message: "Area name must produce a valid URL slug.",
      inputs: { name },
    };
  }

  const inputs = { name };

  try {
    const existingArea = await db.query.areas.findFirst({
      where: (a, { sql }) => sql`lower(${a.name}) = lower(${name})`,
    });

    if (existingArea) {
      if (existingArea.isActive) {
        return {
          success: false,
          errors: { name: ["Area Name already exists and is active."] },
          inputs,
        };
      }

      // Auto-restore agar purana inactive tha
      await db
        .update(areas)
        .set({
          isActive: true,
          slug: slug,
        })
        .where(eq(areas.id, existingArea.id));

      revalidatePath("/admin/areas");
      return { success: true, message: "Area restored successfully!" };
    }

    // Naya area add karna (hamesha active start hoga)
    await db.insert(areas).values({
      name,
      slug,
      isActive: true,
    });

    revalidatePath("/admin/areas");
    return { success: true, message: "Area added successfully!" };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return handleAreaDbError(error, inputs);
  }
}

/* ----------------------------- UPDATE AREA ----------------------------- */
export async function updateArea(prevState: any, formdata: FormData) {
  const rawdata = Object.fromEntries(formdata);
  const result = updateAreaSchema.safeParse(rawdata);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
      inputs: {
        name: (rawdata.name as string) || "",
      },
    };
  }

  const { id, name } = result.data;
  const areaId = parseInt(id, 10);

  try {
    // Slugs are strictly immutable during edits to protect SEO and existing URLs
    const updated = await db
      .update(areas)
      .set({
        name,
      })
      .where(eq(areas.id, areaId))
      .returning({ id: areas.id });

    if (updated.length === 0) {
      return { success: false, message: "Area not found." };
    }

    revalidatePath("/admin/areas");
    return { success: true, message: "Area updated successfully!" };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return handleAreaDbError(error, { name });
  }
}
/* ----------------------- TOGGLE AREA STATUS (SWITCH) ----------------------- */
export async function toggleAreaStatus(id: number, currentStatus: boolean) {
  try {
    const updated = await db
      .update(areas)
      .set({ isActive: !currentStatus })
      .where(eq(areas.id, id))
      .returning({ id: areas.id });

    if (updated.length === 0) {
      return { success: false, message: "Area not found." };
    }

    revalidatePath("/admin/areas");
    return {
      success: true,
      message: `Area ${!currentStatus ? "activated" : "deactivated"} successfully!`,
    };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return handleAreaDbError(error);
  }
}

/* ------------------------ HARD DELETE (PERMANENT) ------------------------ */
export async function deleteArea(id: number) {
  try {
    const deleted = await db
      .delete(areas)
      .where(eq(areas.id, id))
      .returning({ id: areas.id });

    if (deleted.length === 0) {
      return { success: false, message: "Area not found." };
    }

    revalidatePath("/admin/areas");
    return { success: true, message: "Area permanently deleted!" };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return handleAreaDbError(error);
  }
}
"use server";

import { db } from "@/app/db";
import { revalidatePath } from "next/cache";

import { z } from "zod";
import { categoryFields } from "@/app/db/schema";
import { and, eq } from "drizzle-orm";

// now we making zod schema for our categories field

const createCategoryFieldSchema = z.object({
  categoryId: z.number().int().positive("Invalid category ID"),
  label: z.string().min(1, "Field Label zaroori hai").max(100),
  key: z
    .string()
    .min(1, "Field Key zaroori hai")
    .max(50)
    .regex(
      /^[a-z0-9_]+$/,
      "Key sirf lowercase letters, numbers aur underscores par mushtamil ho",
    ),
  type: z.enum([
    "text",
    "number",
    "textarea",
    "select",
    "multiselect",
    "boolean",
  ]),
  options: z.array(z.string()).nullable().optional(),
  placeholder: z.string().nullable().optional(),
  helpText: z.string().nullable().optional(),
  isRequired: z.boolean().default(false),
  isFilterable: z.boolean().default(false),
});

// z.infer ka matlab hai: "Zod, jo schema maine upar banaya hai, usko dekh
//  kar mere liye ek TypeScript Type (Interface) khud bana do."
// Is line ke baad aapko alag se lambi TypeScript interface likhne ki zaroorat nahi padti
export type myCustom = z.infer<typeof createCategoryFieldSchema>;

export async function createCategoriesField(input: myCustom) {
  try {
    const result = createCategoryFieldSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message || "Validation failed",
      };
    }

    // Zod se 100% check aur verify hua saaf-suthra data nikal kar variable mein rakhna.

    const data = result.data;

    //  "Database! Apne table ke categoryFields.categoryId column mein dekho,
    //  aur sirf wahi rows dhoond kar nikalo jinki ID hamare user ke page wali
    //  ID data.categoryId (e.g. 4) ke barabar ho."
    const existingField = await db.query.categoryFields.findFirst({
      where: and(
        eq(categoryFields.categoryId, data.categoryId),
        eq(categoryFields.key, data.key),
      ),
    });

    // Case A: Field pehle se moojood hai aur abhi active bhi hai -> Real Duplicate Error
    if (existingField && existingField.isActive) {
      return {
        success: false,
        error: "Yeh Field Key pehle se is category mein moojood hai.",
      };
    }

    // Case B: Field pehle bani thi lekin delete (isActive = false) ho chuki thi -> Wapis Restore Karein
    if (existingField && !existingField.isActive) {
      await db
        .update(categoryFields)
        .set({
          label: data.label.trim(),
          type: data.type,
          isRequired: data.isRequired,
          isFilterable: data.isFilterable,
          options:
            data.options && data.options.length > 0 ? data.options : null,
          placeholder: data.placeholder?.trim() || null,
          helpText: data.helpText?.trim() || null,
          isActive: true, // 👈 Zinda kar diya
        })
        .where(eq(categoryFields.id, existingField.id));

      revalidatePath(`/admin/categories/${data.categoryId}/fields`);
      return { success: true, message: "Field kamyabi se add ho gayi!" };
    }

    // Case C: Bilkul fresh field hai -> Normal Insert karein
    await db.insert(categoryFields).values({
      categoryId: data.categoryId,
      key: data.key,
      label: data.label.trim(),
      type: data.type,
      isRequired: data.isRequired,
      isFilterable: data.isFilterable,
      options: data.options && data.options.length > 0 ? data.options : null,
      placeholder: data.placeholder?.trim() || null,
      helpText: data.helpText?.trim() || null,
      sortOrder: 0,
      isActive: true,
    });

    revalidatePath(`/admin/categories/${data.categoryId}/fields`);

    return { success: true, message: "Field Add Successfully" };
  } catch (error: any) {
    console.error("Failed to create category field:", error);

    // 👈 Yahan hum error ya uske 'cause' (PostgresError) dono ko check kar rahe hain
    const pgError = error.cause || error;
    const errorCode = pgError.code || error.code;
    const errorDetail = (
      pgError.detail ||
      pgError.message ||
      error.message ||
      ""
    ).toLowerCase();

    console.log("Extracted Error Code in field:", errorCode);
    console.log("Extracted Error Detail in field:", errorDetail);
    if (errorCode === "23505") {
      return {
        success: false,
        error: "Yeh Field Key pehle se is category mein moojood hai.",
      };
    }

    return {
      success: false,
      error: "Field save nahi ho saki. Dobara koshish karein.",
    };
  }
}

// delete function

export async function deleteField(fieldId: number, categoryId: number) {
  try {
    // categoryfield databse mein table ha usmein id or jis field pr click kai wo id brabar ho
    // 2nd categoryfield table mein category id or user jis category pr click kr y aya ha field page wo brabar ho
    const existingField = await db.query.categoryFields.findFirst({
      where: and(
        eq(categoryFields.id, fieldId),
        eq(categoryFields.categoryId, categoryId),
      ),
    });

    if (!existingField) {
      return {
        success: false,
        error:
          "Field nahi mili ya aapke paas isay delete karne ki ijazat nahi hai.",
      };
    }

    await db
      .update(categoryFields)
      .set({
        isActive: false,
      })
      .where(eq(categoryFields.id, fieldId));
    revalidatePath(`/admin/categories/${categoryId}/fields`);

    return {
      success: true,
      message: "Field kamyabi se delete ho gayi.",
    };
  } catch (error) {
    console.error("Delete field error:", error);
    return {
      success: false,
      error: "Field delete nahi ho saki. Dobara koshish karein.",
    };
  }
}

const updateCategoryFieldSchema = z.object({
  label: z.string().min(1, "Field Label zaroori hai").max(100),
  options: z.array(z.string()).nullable().optional(),
  placeholder: z.string().nullable().optional(),
  helpText: z.string().nullable().optional(),
  isRequired: z.boolean().default(false),
  isFilterable: z.boolean().default(false),
});

export type UpdateCategoryFieldInput = z.infer<
  typeof updateCategoryFieldSchema
>;

export async function updateCategoryFields(
  fieldId: number,
  categoryId: number,
  input: UpdateCategoryFieldInput,
) {
  try {
    const result = updateCategoryFieldSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message || "Validation failed",
      };
    }

    // Agar validation pass ho jaye, toh clean data nikaal lein:

    const data = result.data;
    const exisitingField = await db.query.categoryFields.findFirst({
      where: and(
        eq(categoryFields.id, fieldId),
        eq(categoryFields.categoryId, categoryId),
      ),
    });

    if(!exisitingField){
      return{
        success : false,
        error : "ap is field ko edit ni krskty"

      }
    }

    // Jab tasdeeq ho jaye ke field moojood hai aur isi category ki apni hai:

    await db
  .update(categoryFields)
  .set({
    label: data.label.trim(),
    placeholder: data.placeholder?.trim() || null,
    helpText: data.helpText?.trim() || null,
    options: data.options && data.options.length > 0 ? data.options : null,
    isRequired: data.isRequired,
    isFilterable: data.isFilterable,
  })
  .where(eq(categoryFields.id, fieldId));

// Cache refresh karein taake table par taza data dikhe
revalidatePath(`/admin/categories/${categoryId}/fields`);

return {
  success: true,
  message: "Field kamyabi se update ho gayi.",
};




  }
  catch (error) {
    console.error("Update field error:", error);
    return {
      success: false,
      error: "Field update nahi ho saki. Dobara koshish karein.",
    };
  }
}

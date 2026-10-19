"use server";

import { db } from "@/app/db";
import { revalidatePath } from "next/cache";

import { z } from "zod";
import { categoryFields } from "@/app/db/schema";

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

    // / Cache refresh taake UI update ho
    revalidatePath(`/admin/categories/${data.categoryId}/fields`);

    return { success: true, message: "Field Add SucsessFully" };
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

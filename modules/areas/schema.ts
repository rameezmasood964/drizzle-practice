
import { z } from "zod";

// Base schema for adding an Area
export const areaSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/,
      "Slug mein sirf chhote huroof, numbers aur - ya _ ho sakta hai"
    ),
 
});

// Update schema requires numeric/string ID
export const updateAreaSchema = areaSchema.extend({
  id: z.string().min(1, "Area ID is required"),
});

export type AreaInput = z.infer<typeof areaSchema>;
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>;
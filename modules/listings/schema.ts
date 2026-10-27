import { z } from "zod";
import {
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  MIN_LISTING_IMAGES,
  MAX_LISTING_IMAGES,
} from "@/utils/constants"; // Apni constants file ka correct path

// 1. Business Hours Schema
export const dayScheduleSchema = z.object({
  isOpen: z.boolean().default(true),
  openTime: z.string().default("09:00 AM"),
  closeTime: z.string().default("10:00 PM"),
});

export const businessHoursSchema = z.object({
  monday: dayScheduleSchema,
  tuesday: dayScheduleSchema,
  wednesday: dayScheduleSchema,
  thursday: dayScheduleSchema,
  friday: dayScheduleSchema,
  saturday: dayScheduleSchema,
  sunday: dayScheduleSchema,
});

// 2. Single Media Item Schema with superRefine
export const listingMediaItemSchema = z
  .object({
    id: z.string(),
    url: z.string().min(1, "Preview URL is required"),
    isCover: z.boolean().default(false),
    file: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.file && data.file instanceof File) {
      // Empty check
      if (data.file.size === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selected file is empty.",
          path: ["file"],
        });
        return;
      }

      // Max size check (Fixed typo here)
      if (data.file.size > MAX_FILE_SIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Image size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
          path: ["file"],
        });
      }

      // Allowed MIME types check
      if (!ALLOWED_IMAGE_TYPES.includes(data.file.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Only JPG, PNG, and WebP image formats are allowed.",
          path: ["file"],
        });
      }
    }
  });

// 3. Images Array Schema
export const listingImagesSchema = z
  .array(listingMediaItemSchema)
  .min(
    MIN_LISTING_IMAGES,
    `Please upload at least ${MIN_LISTING_IMAGES} image for the listing.`
  )
  .max(
    MAX_LISTING_IMAGES,
    `You can upload a maximum of ${MAX_LISTING_IMAGES} images.`
  );

// 4. Main Listing Form Schema
export const listingFormSchema = z.object({
  // Basic Info Section
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(120, "Title cannot exceed 120 characters"),
  tagline: z.string().max(160, "Tagline cannot exceed 160 characters").optional(),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters long"),

  // Contact Section
  phone: z
    .string()
    .min(7, "Valid phone number is required")
    .regex(/^[+0-9\s\-()]+$/, "Invalid phone number format"),
  whatsapp: z
    .string()
    .regex(/^[+0-9\s\-()]*$/, "Invalid WhatsApp number format")
    .optional(),
  email: z.string().email("Invalid email address"),
  website: z
    .string()
    .url("Invalid website URL")
    .optional()
    .or(z.literal("")),

  // Location Section
  address: z.string().min(5, "Full address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // Category Section
  categoryId: z.string().min(1, "Please select a category"),
  subCategoryId: z.string().min(1, "Please select a specific sub-category"),

  // Status & Visibility Section
  status: z.enum(["active", "pending", "draft", "rejected"]).default("active"),
  isFeatured: z.boolean().default(false),

  // Dynamic Custom Fields
  customFields: z.record(z.string(), z.any()).default({}),

  // Media Section
  images: listingImagesSchema,

  // Business Hours Section
  businessHours: businessHoursSchema,
});

// Type infer kar liya form values ke liye
export type ListingFormValues = z.infer<typeof listingFormSchema>;
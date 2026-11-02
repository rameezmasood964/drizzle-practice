import { z } from "zod";
import {
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  MIN_LISTING_IMAGES,
  MAX_LISTING_IMAGES,
} from "@/utils/constants";

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
      if (data.file.size === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selected file is empty.",
          path: ["file"],
        });
        return;
      }

      if (data.file.size > MAX_FILE_SIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Image size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
          path: ["file"],
        });
      }

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
    `Kam az kam ${MIN_LISTING_IMAGES} image upload karna zaroori hai.`,
  )
  .max(
    MAX_LISTING_IMAGES,
    `Aap maximum ${MAX_LISTING_IMAGES} images upload kar sakte hain.`,
  );

// 4. Main Listing Form Schema
export const listingFormSchema = z.object({
  // Basic Info Section
  title: z
    .string()
    .min(3, "Title kam az kam 3 characters ka hona chahiye")
    .max(120, "Title 120 characters se zyada nahi ho sakta"),
  slug: z.string().optional().default(""),
  description: z
    .string()
    .min(20, "Description kam az kam 20 characters ki honi chahiye"),

  // Contact Section
  phone: z
    .string()
    .min(10, "Valid phone number zaroori hai")
    .regex(/^[+0-9\s\-()]+$/, "Invalid phone number format"),
  whatsapp: z
    .string()
    .min(10, "WhatsApp number likhna zaroori hai")
    .regex(/^[+0-9\s\-()]+$/, "Invalid WhatsApp number format"),
  email: z
    .string()
    .email("Valid email address likhein")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("Valid website URL likhein")
    .optional()
    .or(z.literal("")),

  // Location Section
  areaId: z
    .number({
      message: "Area select karna zaroori hai",
    })
    .positive("Area select karna zaroori hai"),
  address: z.string().min(5, "Pura address likhna zaroori hai"),
  landmark: z.string().optional().or(z.literal("")),
  mapsUrl: z
    .string({ message: "Google Maps link likhna zaroori hai" })
    .min(1, "Google Maps link likhna zaroori hai")
    .url("Valid Google Maps link (URL) enter karein"),
  state: z.string().default("Punjab"),
  postalCode: z.string().default("63100"),

  // Category Section
  categoryId: z.string().min(1, "Category select karein"),
  // subCategoryId ko optional ya empty string allow karein:
  subCategoryId: z.string().optional().nullable(),

  // Status & Visibility Section
  status: z
    .enum(["approved", "pending", "draft", "rejected"])
    .default("approved"),
  isFeatured: z.boolean().default(false),

  // Dynamic Custom Fields
  customFields: z.record(z.string(), z.any()).default({}),

  // Media Section
  images: listingImagesSchema,

  // Business Hours Section
  businessHours: businessHoursSchema,
});

// Inferred TypeScript Type
export type ListingFormValues = z.infer<typeof listingFormSchema>;

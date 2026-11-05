import { z } from "zod";

/**
 * 1. Public Review Submission Schema
 * Used by customer review submission forms and createReviewAction.
 */
export const createReviewSchema = z.object({
  listingId: z.coerce
    .number()
    .positive("Invalid listing ID"),
  rating: z.coerce
    .number()
    .int("Rating must be a whole number")
    .min(1, "Please select at least 1 star")
    .max(5, "Maximum rating is 5 stars"),
  title: z
    .string()
    .trim()
    .max(100, "Title cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  comment: z
    .string()
    .trim()
    .min(10, "Comment must be at least 10 characters long")
    .max(1000, "Comment cannot exceed 1000 characters"),
});

/**
 * 2. Admin Moderation Reject Reason Schema
 * Used by RejectReasonModal and rejectReviewAction.
 */
export const rejectReviewSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Please provide a reason of at least 5 characters")
    .max(255, "Reason cannot exceed 255 characters"),
});

/**
 * 3. Business Owner Reply Schema
 * Used by OwnerReplyModal and updateOwnerReplyAction.
 */
export const ownerReplySchema = z.object({
  replyText: z
    .string()
    .trim()
    .min(3, "Reply must be at least 3 characters")
    .max(1000, "Reply cannot exceed 1000 characters"),
});

/**
 * 4. Admin Reviews Query Filters Schema
 * Used for URL searchParams validation or API querying.
 */
export const reviewFiltersSchema = z.object({
  status: z.enum(["all", "pending", "approved", "rejected"]).default("all"),
  rating: z.union([z.coerce.number().min(1).max(5), z.literal("all")]).default("all"),
  search: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().default(20),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type RejectReviewInput = z.infer<typeof rejectReviewSchema>;
export type OwnerReplyInput = z.infer<typeof ownerReplySchema>;
export type ReviewFiltersInput = z.infer<typeof reviewFiltersSchema>;

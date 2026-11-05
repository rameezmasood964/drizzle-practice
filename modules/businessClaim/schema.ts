import { z } from "zod";

/**
 * 1. Business Claim Submission Schema
 * Used by public listing claim submission form and createClaimAction.
 */
export const claimSubmissionSchema = z.object({
  listingId: z.coerce
    .number()
    .int()
    .positive("Valid listing ID is required"),
  claimantName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters"),
  claimantEmail: z
    .string()
    .trim()
    .email("Invalid email address"),
  claimantPhone: z
    .string()
    .trim()
    .min(10, "Valid phone number required"),
  claimantRole: z
    .string()
    .trim()
    .min(2, "Role is required"),
  proofDocumentUrl: z
    .string()
    .url("Invalid proof document URL")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

/**
 * 2. Admin Claim Rejection Schema
 * Used by RejectClaimModal and rejectClaimAction.
 */
export const rejectClaimSchema = z.object({
  claimId: z.coerce.number().int().positive().optional(),
  rejectionReason: z
    .string()
    .trim()
    .min(3, "Rejection reason must be provided"),
});

/**
 * 3. Claim Query Filters Schema
 */
export const claimFiltersSchema = z.object({
  status: z.enum(["all", "pending", "approved", "rejected"]).default("all"),
  search: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
});

export type ClaimSubmissionInput = z.infer<typeof claimSubmissionSchema>;
export type RejectClaimInput = z.infer<typeof rejectClaimSchema>;
export type ClaimFiltersInput = z.infer<typeof claimFiltersSchema>;


import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { listings } from "./listings.schema";
import { profiles } from "./user.schema";

export type ClaimStatus = "pending" | "approved" | "rejected";

export const claims = pgTable(
  "claims",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .references(() => listings.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    claimantName: text("claimant_name").notNull(),
    claimantEmail: text("claimant_email").notNull(),
    claimantPhone: text("claimant_phone").notNull(),
    claimantRole: text("claimant_role").default("Owner").notNull(),
    proofDocumentUrl: text("proof_document_url"),
    notes: text("notes"),
    status: text("status")
      .$type<ClaimStatus>()
      .default("pending")
      .notNull(),
    rejectionReason: text("rejection_reason"),
    reviewedBy: uuid("reviewed_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("claims_listing_status_idx").on(t.listingId, t.status),
    uniqueIndex("claims_listing_user_unique").on(t.listingId, t.userId),
  ],
);

export const claimsRelations = relations(claims, ({ one }) => ({
  listing: one(listings, {
    fields: [claims.listingId],
    references: [listings.id],
  }),
  claimant: one(profiles, {
    fields: [claims.userId],
    references: [profiles.id],
    relationName: "claimantUser",
  }),
  reviewer: one(profiles, {
    fields: [claims.reviewedBy],
    references: [profiles.id],
    relationName: "claimReviewerAdmin",
  }),
}));

export type Claim = typeof claims.$inferSelect;
export type NewClaim = typeof claims.$inferInsert;


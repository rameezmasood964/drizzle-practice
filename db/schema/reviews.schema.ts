import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  uuid,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

import { listings } from "./listings.schema";
import { profiles } from "./user.schema";

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .references(() => listings.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    rating: integer("rating").notNull(),
    title: varchar("title", { length: 255 }),
    comment: text("comment").notNull(),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    rejectionReason: text("rejection_reason"),
    ownerReply: text("owner_reply"),
    ownerRepliedAt: timestamp("owner_replied_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("reviews_listing_user_unique").on(t.listingId, t.userId),
    index("reviews_listing_status_idx").on(t.listingId, t.status),
  ],
);

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;


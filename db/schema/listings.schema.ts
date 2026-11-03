import {
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uuid,
  doublePrecision,
  index,
} from "drizzle-orm/pg-core";

import { profiles } from "./user.schema";
import { categories } from "./categories.schema";
import { areas } from "./areas.schema";

export const listingStatus = pgEnum("listing_status", [
  "draft",
  "pending",
  "approved",
  "rejected",
  "expired",
]);

export const paymentMethod = pgEnum("payment_method", [
  "jazzcash",
  "easypaisa",
  "bank",
  "cash",
]);

export const listings = pgTable(
  "listings",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    phone: text("phone").notNull(),
    whatsapp: text("whatsapp").notNull(),
    email: text("email"),
    website: text("website"),
    businessHours:
      jsonb("business_hours").$type<
        Record<string, { isOpen: boolean; open: string; close: string }>
      >(),
    address: text("address").notNull(),
    mapsUrl: text("maps_url").notNull(),
    landmark: text("landmark"),
    areaId: integer("area_id")
      .references(() => areas.id, { onDelete: "restrict" })
      .notNull(),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),

    categoryId: integer("category_id")
      .references(() => categories.id, { onDelete: "restrict" })
      .notNull(),

    details: jsonb("details")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),

    ownerId: uuid("owner_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdByAdminId: uuid("created_by_admin_id").references(
      () => profiles.id,
      { onDelete: "set null" },
    ),

    status: listingStatus("status").default("draft").notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    adminNotes: text("admin_notes"),

    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("listings_category_idx").on(t.categoryId),
    index("listings_status_idx").on(t.status),
    index("listings_owner_idx").on(t.ownerId),
    index("listings_details_gin").using("gin", t.details),
    index("listings_area_idx").on(t.areaId),
  ],
);

export const listingImages = pgTable(
  "listing_images",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .references(() => listings.id, { onDelete: "cascade" })
      .notNull(),
    imageUrl: text("image_url").notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (t) => [index("listing_images_listing_idx").on(t.listingId)],
);

export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
// import {pgTable,serial,text,integer,timestamp,boolean, jsonb} from 'drizzle-orm/pg-core'

// // categories table
// export const categoriesTable = pgTable('categories',{

//     category_id: serial('id').primaryKey(),
//     categoryname: text('categoryname').notNull(),
//     category_slug: text('slug').notNull().unique(),
//     createdat: timestamp('ccreatedat').defaultNow().notNull(),
//     parentid : integer('parent_id').references (() : any => categoriesTable.category_id,{onDelete:'cascade'})
// })

// export const categoryFieldsTable = pgTable('category_fields', {
//     field_id: serial('field_id').primaryKey(),

//     // Link with Categories Table
//     category_id: integer('category_id')
//         .references(() => categoriesTable.category_id, { onDelete: 'cascade' })
//         .notNull(),

//     field_key: text('field_key').notNull(),     // e.g., 'metal_type', 'monthly_rent'
//     field_label: text('field_label').notNull(), // e.g., 'Metal Type', 'Monthly Rent'
//     field_type: text('field_type').notNull(),   // e.g., 'text', 'number', 'boolean'
//     is_required: boolean('is_required').default(true).notNull(),
// });

// // listes table

// export const itemslists = pgTable('itemslists', {

//     list_id: serial('list_id').primaryKey(),

//    title : text('title').notNull(),
//    phone_no : text('phone_no').notNull(),
//    address: text('address').notNull(),

//    category_id : integer('category_id').references(() : any => categoriesTable.category_id,{onDelete :'cascade'}).notNull(),
//    details: jsonb("details").notNull()

// })

// // images table

// export const listingImages = pgTable('listing_images', {
//     image_id: serial('image_id').primaryKey(),

//     // Kis listing ki tasveer hai? (Master list se link)
//     list_id: integer('list_id')
//         .references((): any => itemslists.list_id, { onDelete: 'cascade' })
//         .notNull(),

//     image_url: text('image_url').notNull(), // Cloudinary ya AWS S3 ka image link

//     // Yeh optional hai, agar aap batana chahein ke yeh main/cover photo hai ya nahi
//     is_primary: boolean('is_primary').default(false).notNull(),
//     display_order: integer('display_order').default(0).notNull(),
// });

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
  unique,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

import { profiles } from "./user.schema";

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export const fieldType = pgEnum("field_type", [
  "text",
  "textarea",
  "number",
  "select",
  "multiselect",
  "boolean",
]);

export const listingStatus = pgEnum("listing_status", [
  "draft", // user ne form shuru kiya, submit nahi kiya
  "pending", // submit ho gaya, admin ke verify karne ka intezar
  "approved", // live
  "rejected",
  "expired",
]);

export const paymentMethod = pgEnum("payment_method", [
  "jazzcash",
  "easypaisa",
  "bank",
  "cash",
]);

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    icon: text("icon").notNull(), // lucide icon ka naam ya image url
    parentId: integer("parent_id").references(
      (): AnyPgColumn => categories.id,
      {
        onDelete: "set null",
      },
    ),
    sortOrder: integer("sort_order").default(0).notNull(),
    // delete mat karo, is ko false kar do (listings bach jati hain)
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("categories_name_lower_unique").on(sql`lower(${t.name})`),
  ],
);

/* ------------------------------------------------------------------ */
/* Category fields (form ki definition)                                */
/* ------------------------------------------------------------------ */

export const categoryFields = pgTable(
  "category_fields",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .references(() => categories.id, { onDelete: "cascade" })
      .notNull(),
    // JSONB mein is naam se save hoga, jaise "consultation_fee". Baad mein badalna mat.
    key: text("key").notNull(),
    // User ko jo naam dikhega, jaise "Consultation Fee (Rs.)"
    label: text("label").notNull(),
    type: fieldType("type").notNull(),
    isRequired: boolean("is_required").default(false).notNull(),
    // select / multiselect ke liye: ["Skin Specialist", "Child Specialist"]
    options: jsonb("options").$type<string[]>(),
    placeholder: text("placeholder"),
    helpText: text("help_text"),
    sortOrder: integer("sort_order").default(0).notNull(),
    // true ho to category page par is field ka filter banega
    isFilterable: boolean("is_filterable").default(false).notNull(),
    // delete mat karo, hide karo
    isActive: boolean("is_active").default(true).notNull(),
  },
  (t) => [
    unique("category_fields_category_key_unique").on(t.categoryId, t.key),
    index("category_fields_category_idx").on(t.categoryId),
  ],
);




/* ------------------------------------------------------------------ */
/* Areas (Bahawalpur ke mohalle / towns)                               */
/* ------------------------------------------------------------------ */

export const areas = pgTable(
  "areas",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(), // jaise "Model Town"
    slug: text("slug").notNull().unique(), // jaise "model-town"
    sortOrder: integer("sort_order").default(0).notNull(),
    // delete mat karo, is ko false kar do (listings bach jati hain)
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("areas_name_lower_unique").on(sql`lower(${t.name})`)],
);


/* ------------------------------------------------------------------ */
/* Listing images                                                      */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Listings                                                            */
/* ------------------------------------------------------------------ */

export const listings = pgTable(
  "listings",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),

    // Common fields (har category mein)
    title: text("title").notNull(),
    description: text("description"),
    phone: text("phone").notNull(),
    whatsapp: text("whatsapp"),
    address: text("address").notNull(),
  areaId: integer("area_id")
  .references(() => areas.id, { onDelete: "restrict" })
  .notNull(),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),

    categoryId: integer("category_id")
      // category delete hone se listings na urein
      .references(() => categories.id, { onDelete: "restrict" })
      .notNull(),

    // Category ki alag fields yahan jati hain, jaise {"consultation_fee": 1500}
    details: jsonb("details")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),

    // Kis ki listing hai
    ownerId: uuid("owner_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    // Agar admin ne kisi aur ki taraf se banayi (walk-in)
    createdByAdminId: uuid("created_by_admin_id").references(
      () => profiles.id,
      {
        onDelete: "set null",
      },
    ),

    // Status: abhi sirf admin add karta hai, isliye default draft
    status: listingStatus("status").default("draft").notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    adminNotes: text("admin_notes"), // sirf admin ko dikhe

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
    // JSONB ke andar filter tez karne ke liye
    index("listings_details_gin").using("gin", t.details),
     index("listings_area_idx").on(t.areaId),
  ],
);


export type Category = typeof categories.$inferSelect;
export type CategoryField = typeof categoryFields.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type Area = typeof areas.$inferSelect;

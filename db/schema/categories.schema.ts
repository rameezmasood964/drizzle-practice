import {
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  unique,
  uniqueIndex,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const fieldType = pgEnum("field_type", [
  "text",
  "textarea",
  "number",
  "select",
  "multiselect",
  "boolean",
]);

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    icon: text("icon").notNull(),
    parentId: integer("parent_id").references(
      (): AnyPgColumn => categories.id,
      { onDelete: "set null" },
    ),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("categories_name_lower_unique").on(sql`lower(${t.name})`),
  ],
);

export const categoryFields = pgTable(
  "category_fields",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .references(() => categories.id, { onDelete: "cascade" })
      .notNull(),
    key: text("key").notNull(),
    label: text("label").notNull(),
    type: fieldType("type").notNull(),
    isRequired: boolean("is_required").default(false).notNull(),
    options: jsonb("options").$type<string[]>(),
    placeholder: text("placeholder"),
    helpText: text("help_text"),
    sortOrder: integer("sort_order").default(0).notNull(),
    isFilterable: boolean("is_filterable").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    // Conditional Visibility & Requirements
    dependsOnFieldKey: text("depends_on_field_key"),
    conditionOperator: text("condition_operator").default("equals"),
    conditionValue: text("condition_value"),
    requiredIfVisible: boolean("required_if_visible").default(false).notNull(),
  },
  (t) => [
    unique("category_fields_category_key_unique").on(t.categoryId, t.key),
    index("category_fields_category_idx").on(t.categoryId),
  ],
);

export type Category = typeof categories.$inferSelect;
export type CategoryField = typeof categoryFields.$inferSelect;
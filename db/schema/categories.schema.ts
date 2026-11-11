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
import { sql, relations } from "drizzle-orm";

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
    /**
     * @deprecated Decoupled in favor of categoryFieldAssignments junction table.
     * Retained as nullable during transitional migration for backwards compatibility.
     */
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "cascade",
    }),
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
    index("category_fields_key_idx").on(t.key),
  ],
);

export const categoryFieldAssignments = pgTable(
  "category_field_assignments",
  {
    id: serial("id").primaryKey(),
    fieldId: integer("field_id")
      .references(() => categoryFields.id, { onDelete: "cascade" })
      .notNull(),
    categoryId: integer("category_id")
      .references(() => categories.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    unique("category_field_assignments_field_category_unique").on(
      t.fieldId,
      t.categoryId,
    ),
    index("category_field_assignments_category_idx").on(t.categoryId),
    index("category_field_assignments_field_idx").on(t.fieldId),
  ],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type CategoryField = typeof categoryFields.$inferSelect;
export type NewCategoryField = typeof categoryFields.$inferInsert;
export type CategoryFieldAssignment = typeof categoryFieldAssignments.$inferSelect;
export type NewCategoryFieldAssignment = typeof categoryFieldAssignments.$inferInsert;

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "category_parent_children",
  }),
  children: many(categories, {
    relationName: "category_parent_children",
  }),
  assignments: many(categoryFieldAssignments),
}));

export const categoryFieldsRelations = relations(categoryFields, ({ many }) => ({
  assignments: many(categoryFieldAssignments),
}));

export const categoryFieldAssignmentsRelations = relations(
  categoryFieldAssignments,
  ({ one }) => ({
    field: one(categoryFields, {
      fields: [categoryFieldAssignments.fieldId],
      references: [categoryFields.id],
    }),
    category: one(categories, {
      fields: [categoryFieldAssignments.categoryId],
      references: [categories.id],
    }),
  }),
);

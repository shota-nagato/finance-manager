import { sql, relations } from "drizzle-orm";
import { int, sqliteTable, text, check, uniqueIndex } from "drizzle-orm/sqlite-core";

export const timestamps = {
  createdAt: int("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
};

export const branches = sqliteTable("branches", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  aggregationType: text("aggregation_type").notNull(),
  aggregationInterval: text("aggregation_interval").notNull(),
  ...timestamps,
},(table) => [
  check("aggregation_type", sql`${table.aggregationType} IN ("cumulative", "periodic")`),
  check("aggregation_interval", sql`${table.aggregationInterval} IN ("quarterly", "half-yearly")`),
]);

export const categories = sqliteTable("categories", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  categoryType: text("category_type").notNull(),
  ...timestamps,
}, (table) => [
  check("category_type", sql`${table.categoryType} IN ("sales", "expenses")`),
])

export const branchCategories = sqliteTable("branch_categories", {
  id: int("id").primaryKey({ autoIncrement: true }),
  branchId: int("branch_id").references(() => branches.id, { onDelete: "cascade" }).notNull(),
  categoryId: int("category_id").references(() => categories.id, { onDelete: "cascade" }).notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex("branch_category_unique").on(table.branchId, table.categoryId),
])

export const aggregations = sqliteTable("aggregations", {
  id: int("id").primaryKey({ autoIncrement: true }),
  branchCategoryId: int("branch_category_id").references(() => branchCategories.id, { onDelete: "cascade" }).notNull(),
  year: int("year").notNull(),
  month: int("month").notNull(),
  amount: int("amount").notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex("aggregation_unique").on(table.branchCategoryId, table.year, table.month),
  check("amount", sql`${table.amount} >= 0`),
  check("year", sql`${table.year} >= 2025`),
  // アプリケーション側で、半期の支店の場合は6, 12のみ選択可能に制御する必要がある
  check("month", sql`${table.month} IN (3, 6, 9, 12)`),
])

// Relations
export const branchesRelations = relations(branches, ({ many }) => ({
  branchCategories: many(branchCategories),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  branchCategories: many(branchCategories),
}));

export const branchCategoriesRelations = relations(branchCategories, ({ one, many }) => ({
  branch: one(branches, {
    fields: [branchCategories.branchId],
    references: [branches.id],
  }),
  category: one(categories, {
    fields: [branchCategories.categoryId],
    references: [categories.id],
  }),
  aggregations: many(aggregations),
}));

export const aggregationsRelations = relations(aggregations, ({ one }) => ({
  branchCategory: one(branchCategories, {
    fields: [aggregations.branchCategoryId],
    references: [branchCategories.id],
  }),
}))

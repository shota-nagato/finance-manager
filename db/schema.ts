import { sql } from "drizzle-orm";
import { int, sqliteTable, text, check } from "drizzle-orm/sqlite-core";

export const branches = sqliteTable("branches", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  aggregationType: text("aggregation_type").notNull(),
  aggregationInterval: int("aggregation_interval").notNull(),
},(table) => [
  check("aggregation_type", sql`${table.aggregationType} IN ("cumulative", "periodic")`),
  check("aggregation_interval", sql`${table.aggregationInterval} IN (1, 2, 3, 4, 6)`),
]);

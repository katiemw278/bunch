import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
export const judgments = sqliteTable("judgments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  answer: text("answer").notNull(), categoryId: text("category_id").notNull(),
  version: text("version").notNull().default("1"),
  matches: integer("matches").notNull(), explanation: text("explanation").notNull(),
}, t => [uniqueIndex("judgment_pair").on(t.answer, t.categoryId, t.version)]);
export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  puzzleId: text("puzzle_id").notNull(), answer: text("answer").notNull(),
  categoryId: text("category_id").notNull(), note: text("note"),
  createdAt: text("created_at").notNull(),
});

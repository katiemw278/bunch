import { sqliteTable, text, integer, uniqueIndex, primaryKey, index } from "drizzle-orm/sqlite-core";
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

// Daily/session tables are managed by migrations/0002_daily_players.sql.
// Use SQL migrations for changes to their checks, indexes and concurrency fields.
export const puzzles = sqliteTable("puzzles", {id:text("id").primaryKey(),number:integer("number").unique(),releaseDate:text("release_date").unique(),targetDate:text("target_date").unique(),status:text("status").notNull(),content:text("content").notNull(),source:text("source").notNull(),createdAt:text("created_at").notNull()});
export const players = sqliteTable("players", {id:text("id").primaryKey(),createdAt:text("created_at").notNull()});

export const gameSessions = sqliteTable("game_sessions", {playerId:text("player_id").notNull().references(()=>players.id),puzzleId:text("puzzle_id").notNull(),state:text("state").notNull(),version:integer("version").notNull().default(0),lastRequest:text("last_request"),lastResponse:text("last_response")},t=>[primaryKey({columns:[t.playerId,t.puzzleId]})]);
export const completions = sqliteTable("completions", {playerId:text("player_id").notNull().references(()=>players.id),puzzleId:text("puzzle_id").notNull(),releaseDate:text("release_date").notNull(),completedAt:text("completed_at").notNull(),dailyEligible:integer("daily_eligible").notNull(),score:integer("score").notNull()},t=>[primaryKey({columns:[t.playerId,t.puzzleId]}),index("completion_streak").on(t.playerId,t.dailyEligible,t.releaseDate)]);
export const requestLimits = sqliteTable("request_limits", {key:text("key").primaryKey(),count:integer("count").notNull(),expiresAt:integer("expires_at").notNull()});

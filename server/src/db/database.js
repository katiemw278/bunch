const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "../../bunch.sqlite");

let db;

function getDb() {
  if (db) return db;

  db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Judgments cache: stores AI rulings per answer+category
  // The unique constraint on (answer_normalized, category_id, definition_version)
  // prevents conflicting concurrent rulings.
  db.exec(`
    CREATE TABLE IF NOT EXISTS judgments (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      answer_normalized  TEXT    NOT NULL,
      category_id        TEXT    NOT NULL,
      definition_version TEXT    NOT NULL DEFAULT '1',
      matches            INTEGER NOT NULL CHECK(matches IN (0,1)),
      explanation        TEXT    NOT NULL,
      created_at         TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(answer_normalized, category_id, definition_version)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      puzzle_id         TEXT NOT NULL,
      answer_normalized TEXT NOT NULL,
      category_id       TEXT NOT NULL,
      reported_at       TEXT NOT NULL DEFAULT (datetime('now')),
      note              TEXT
    );
  `);

  return db;
}

/**
 * Look up a stored judgment. Returns { matches, explanation } or null.
 */
function lookupJudgment(answerNormalized, categoryId, definitionVersion = "1") {
  const row = getDb()
    .prepare(
      `SELECT matches, explanation FROM judgments
       WHERE answer_normalized = ? AND category_id = ? AND definition_version = ?`
    )
    .get(answerNormalized, categoryId, definitionVersion);
  return row ? { matches: row.matches === 1, explanation: row.explanation } : null;
}

/**
 * Store a judgment. Uses INSERT OR IGNORE so simultaneous requests can't conflict.
 */
function storeJudgment(answerNormalized, categoryId, definitionVersion, matches, explanation) {
  try {
    getDb()
      .prepare(
        `INSERT OR IGNORE INTO judgments
         (answer_normalized, category_id, definition_version, matches, explanation)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(answerNormalized, categoryId, definitionVersion, matches ? 1 : 0, explanation);
  } catch (e) {
    // Unique constraint: another request stored it first — that's fine
    console.warn("storeJudgment conflict (safe to ignore):", e.message);
  }
}

/**
 * Record a player report about an incorrect ruling.
 */
function storeReport(puzzleId, answerNormalized, categoryId, note) {
  getDb()
    .prepare(
      `INSERT INTO reports (puzzle_id, answer_normalized, category_id, note)
       VALUES (?, ?, ?, ?)`
    )
    .run(puzzleId, answerNormalized, categoryId, note || null);
}

module.exports = { getDb, lookupJudgment, storeJudgment, storeReport };

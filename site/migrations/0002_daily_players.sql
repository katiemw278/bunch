CREATE TABLE puzzles (id TEXT PRIMARY KEY, number INTEGER UNIQUE, release_date TEXT UNIQUE, target_date TEXT UNIQUE, status TEXT NOT NULL CHECK(status IN ('draft','ready','reserve')), content TEXT NOT NULL, source TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX puzzle_release ON puzzles(status,release_date);
CREATE TABLE players (id TEXT PRIMARY KEY, created_at TEXT NOT NULL);
CREATE TABLE game_sessions (player_id TEXT NOT NULL REFERENCES players(id), puzzle_id TEXT NOT NULL, state TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 0, last_request TEXT, last_response TEXT, PRIMARY KEY(player_id,puzzle_id));
CREATE TABLE completions (player_id TEXT NOT NULL REFERENCES players(id), puzzle_id TEXT NOT NULL, release_date TEXT NOT NULL, completed_at TEXT NOT NULL, daily_eligible INTEGER NOT NULL, score INTEGER NOT NULL, PRIMARY KEY(player_id,puzzle_id));
CREATE INDEX completion_streak ON completions(player_id,daily_eligible,release_date);
CREATE TABLE request_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);

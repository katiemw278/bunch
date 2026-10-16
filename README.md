# Bunch

## Current game source

The current public 4×4 game is in [site/](site/). This snapshot matches Sites commit `2d0bb73ef6fba752d0e16a62360e0ad3b92c88aa` from October 16, 2026.

The original 3×3 Next.js / Express implementation in `client/` and `server/` is preserved below. Its instructions describe the older version, not the current game.

The current version uses React / TypeScript, Vinext, Cloudflare Workers, D1, and Groq. All 152 tracked source and asset files are included. Runtime secrets, player data, judgment database contents, node_modules, and build output are not included. The Sites configuration remains in the snapshot as deployment context; standalone Cloudflare deployment still needs to be configured. No paid services or new deployments were activated by this import.

See [MIGRATION.md](MIGRATION.md) for next steps.

---

## Original implementation documentation

# Bunch

A daily browser category puzzle. Nine categories. How few answers can you use to clear them all?

---

## How it works

The board shows 9 category tiles. Submit words or phrases that fit one or more categories to clear them. Clear all 9 in at most 8 moves to win. Clearing multiple tiles with one answer scores disproportionately more points (triangular scoring: 1→1, 2→3, 3→6, 4→10…).

---

## Project structure

```
bunch/
├── client/          Next.js 14 frontend (TypeScript + Tailwind)
├── server/          Express API (Node.js, SQLite judgment cache)
└── package.json     Root — runs both with concurrently
```

---

## Prerequisites

- **Node.js 20+** — download from [nodejs.org](https://nodejs.org) or use nvm
- **npm 10+** (bundled with Node 20)
- An **OpenAI API key** for live AI judging (optional — dev mode works without one)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/katiemw278/bunch.git
cd bunch
npm run install:all
```

### 2. Configure the server

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in:

```env
# Required for live AI judging. Leave blank to use dev mode.
OPENAI_API_KEY=sk-...

# Optional overrides
PORT=3001
CLIENT_ORIGIN=http://localhost:3000
DEV_MODE=false
```

### 3. Configure the client

```bash
cd client
cp .env.local.example .env.local
```

`client/.env.local` defaults are fine for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Running locally

From the repo root:

```bash
npm run dev
```

This starts both servers concurrently:
- **API server** → `http://localhost:3001`
- **Next.js client** → `http://localhost:3000`

Open `http://localhost:3000` in your browser.

Or start them separately:

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

---

## Dev mode (no API key required)

If `OPENAI_API_KEY` is not set, the server automatically runs in **dev mode**:

- Answer judgments come from a hardcoded seed table in `server/src/ai/judge.js`
- The UI shows a banner in the server logs: `⚠ DEV MODE`
- All three seed puzzles (Oct 15–17) are fully playable with seeded answers
- Unknown answers return `false` for all categories with a clear dev-mode note

To force dev mode even with an API key set:

```env
DEV_MODE=true
```

To enable live AI judging, set a valid `OPENAI_API_KEY`. The model used is `gpt-4o-mini`. Judgments are cached in SQLite so each (answer, category) pair is only judged once.

---

## Running tests

```bash
# Server tests (79 tests — game logic, AI judge, route integration)
cd server && npm test

# Client tests (storage + sharing)
cd client && npm test
```

Server tests cover:
- `normalizeAnswer` — lowercasing, trimming, whitespace collapsing
- `isDuplicate` — exact matches, plural/singular variations
- `calcMoveScore` — triangular scoring formula
- `bunchLabel` / `feedbackMessage` — all bunch sizes
- `getGameStatus` — win/loss/playing transitions at boundary conditions
- `applySubmission` — tile clearing, move counting, score accumulation
- Route integration — happy path, duplicates, misses, win condition, move limit, validation

Client tests cover:
- `saveGameState` / `loadGameState` — round-trip, puzzle isolation, overwrite
- `clearGameState` — isolation between puzzles
- `buildShareText` — spoiler-free (no answers/labels), emoji grid, win/lost text

---

## Environment variables

### Server (`server/.env`)

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | _(none)_ | OpenAI key. If unset, dev mode activates automatically. |
| `DEV_MODE` | `false` | Force dev mode even if API key is set. |
| `PORT` | `3001` | Port for the Express API server. |
| `CLIENT_ORIGIN` | `http://localhost:3000` | Allowed CORS origin. |

### Client (`client/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Base URL of the API server. |

---

## Adding a new puzzle

Puzzles live in `server/src/puzzles/puzzles.js`. Add an entry to the `PUZZLES` array:

```js
{
  id: "puzzle-004",
  date: "2026-10-18",   // YYYY-MM-DD — one puzzle per date
  number: 4,
  categories: [
    // 9 categories, row-major order (top-left → bottom-right)
    { id: "p4-c1", label: "Short player label", definition: "Precise internal definition for the AI judge.", examples: ["answer1", "answer2"] },
    // …8 more
  ],
  sampleSolutions: [
    // Verify at least one path clears all 9 in ≤8 moves
    { answer: "example", clears: ["p4-c1", "p4-c2"] },
  ],
}
```

Guidelines per the design doc:
- Every category should have several familiar answers
- Strong answers should typically clear 2–3 tiles, occasionally 4+
- No single answer should trivially clear all 9
- Include at least one verified win path in `sampleSolutions`

To add seeded dev-mode judgments for the new puzzle, add entries to `DEV_SEED_JUDGMENTS` in `server/src/ai/judge.js`.

---

## Known limitations

1. **No authentication or cross-device sync** — progress is stored in `localStorage` only. Clearing browser data loses progress.

2. **Puzzle date uses the server clock** — if your server and user are in very different timezones, "today's" puzzle may differ. A timezone-aware daily reset is not yet implemented.

3. **Dev mode seeded answers are sparse** — only canonical answers for the three seed puzzles are pre-seeded. Any other answer returns `false` with a dev-mode note. Set an `OPENAI_API_KEY` for realistic judging of unexpected answers.

4. **No autocorrect suggestion** — the design doc mentions suggesting corrections for near-matches. This is not implemented in v1; misspelled answers are treated as misses.

5. **No puzzle archive or practice mode** — only today's puzzle is served. Puzzles for past dates require manually changing the `date` fields in `puzzles.js`.

6. **SQLite is single-file** — suitable for low traffic. For concurrent production load, replace `better-sqlite3` with a Postgres-backed store.

7. **OpenAI `gpt-4o-mini` only** — the model is hardcoded. Swap the model name in `server/src/ai/judge.js` to use a different one.

8. **No rate limiting on the API** — the submit endpoint has no per-IP throttle. Add `express-rate-limit` before public deployment.

9. **Client tests require `next/babel` transform** — running `npm test` in the client requires the Next.js Babel preset. If this fails, run server tests (`cd server && npm test`) which have no extra dependencies.

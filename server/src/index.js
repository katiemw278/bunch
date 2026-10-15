require("dotenv").config();

const express = require("express");
const cors = require("cors");

const puzzleRouter = require("./routes/puzzle");
const submitRouter = require("./routes/submit");
const reportRouter = require("./routes/report");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

// Log mode on startup
const isDev = process.env.DEV_MODE === "true" || !process.env.OPENAI_API_KEY;
console.log(`
╔══════════════════════════════════╗
║   Bunch API Server               ║
║   Mode: ${isDev ? "DEV (mock judgments)  " : "LIVE (OpenAI)         "}║
║   Port: ${String(PORT).padEnd(26)}║
╚══════════════════════════════════╝
`);

if (isDev) {
  console.warn("⚠  DEV MODE: AI judging is disabled. Answers are matched against seeded judgments only.");
  console.warn("   Set OPENAI_API_KEY in server/.env to enable live AI validation.\n");
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.json({ ok: true, mode: isDev ? "dev" : "live", timestamp: new Date().toISOString() });
});

app.use("/api/puzzle", puzzleRouter);
app.use("/api/submit", submitRouter);
app.use("/api/report", reportRouter);

// ── Error handler ─────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Only bind to a port when running directly (not imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Bunch API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;

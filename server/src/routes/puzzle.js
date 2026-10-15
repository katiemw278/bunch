const express = require("express");
const router = express.Router();
const { getPuzzleForDate, getPuzzleById } = require("../puzzles/puzzles");

/**
 * GET /api/puzzle/today
 * Returns today's puzzle (categories without examples).
 */
router.get("/today", (req, res) => {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const puzzle = getPuzzleForDate(today);

  res.json({
    id: puzzle.id,
    number: puzzle.number,
    date: puzzle.date,
    categories: puzzle.categories.map((c) => ({
      id: c.id,
      label: c.label,
      // definition NOT sent to client — server-only for judging
    })),
  });
});

/**
 * GET /api/puzzle/:id
 * Returns a puzzle by ID (for restoring from local storage).
 */
router.get("/:id", (req, res) => {
  const puzzle = getPuzzleById(req.params.id);
  if (!puzzle) return res.status(404).json({ error: "Puzzle not found" });

  res.json({
    id: puzzle.id,
    number: puzzle.number,
    date: puzzle.date,
    categories: puzzle.categories.map((c) => ({
      id: c.id,
      label: c.label,
    })),
  });
});

module.exports = router;

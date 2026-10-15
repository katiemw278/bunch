const express = require("express");
const router = express.Router();
const { storeReport } = require("../db/database");
const { normalizeAnswer } = require("../game/logic");

/**
 * POST /api/report
 * Body: { puzzleId, answer, categoryId, note? }
 * Saves a player report about an incorrect ruling.
 */
router.post("/", (req, res) => {
  const { puzzleId, answer, categoryId, note } = req.body;

  if (!puzzleId || !answer || !categoryId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const normalized = normalizeAnswer(answer);
  storeReport(puzzleId, normalized, categoryId, note);

  res.json({ success: true, message: "Thanks for the report. We'll review this ruling." });
});

module.exports = router;

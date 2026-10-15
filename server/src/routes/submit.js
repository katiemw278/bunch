const express = require("express");
const router = express.Router();
const { getPuzzleById } = require("../puzzles/puzzles");
const { judgeAnswer } = require("../ai/judge");
const {
  normalizeAnswer,
  isDuplicate,
  feedbackMessage,
  getGameStatus,
  MOVE_LIMIT,
  BOARD_SIZE,
} = require("../game/logic");

/**
 * POST /api/submit
 * Body: { puzzleId, answer, clearedTiles, previousAnswers, moveCount }
 *
 * The client sends its local state so the server can validate and apply the move.
 * Server is authoritative on scoring and match logic.
 * Local storage is for resuming the UI only.
 *
 * Returns:
 *  { type: "duplicate", message }
 *  { type: "retry", message }           ← AI failed, do NOT count as a move
 *  { type: "result", ... }              ← normal result
 */
router.post("/", async (req, res) => {
  const { puzzleId, answer, clearedTiles = [], previousAnswers = [], moveCount = 0 } = req.body;

  // Basic input validation
  if (!puzzleId || typeof answer !== "string") {
    return res.status(400).json({ error: "Missing puzzleId or answer" });
  }

  const puzzle = getPuzzleById(puzzleId);
  if (!puzzle) {
    return res.status(404).json({ error: "Puzzle not found" });
  }

  // Check game isn't already over
  const currentStatus = getGameStatus(clearedTiles.length, moveCount);
  if (currentStatus !== "playing") {
    return res.status(400).json({ error: "Game is already complete" });
  }

  // Normalize answer
  const normalized = normalizeAnswer(answer);

  // Reject empty
  if (!normalized) {
    return res.status(400).json({ error: "Answer cannot be empty" });
  }

  // Duplicate check
  if (isDuplicate(normalized, previousAnswers)) {
    return res.json({
      type: "duplicate",
      message: `You already tried "${normalized}". Try a different answer.`,
    });
  }

  // Determine which categories still need judging (only uncleared)
  const pendingCategories = puzzle.categories.filter(
    (c) => !clearedTiles.includes(c.id)
  );

  // Judge the answer
  const judgments = await judgeAnswer(normalized, pendingCategories);

  // AI failure → retry, do NOT consume a move
  if (judgments === null) {
    return res.json({
      type: "retry",
      message: "Something went wrong checking your answer. Please try again — this won't count as a move.",
    });
  }

  // Determine matched categories
  const matched = judgments.filter((j) => j.matches).map((j) => j.categoryId);

  // New tiles cleared this move
  const newlyCleared = matched.filter((id) => !clearedTiles.includes(id));

  // Update state
  const newClearedTiles = [...clearedTiles, ...newlyCleared];
  const newMoveCount = moveCount + 1;
  const newPreviousAnswers = [...previousAnswers, normalized];

  // Calculate score
  const n = newlyCleared.length;
  const moveScore = n > 0 ? (n * (n + 1)) / 2 : 0;

  const newStatus = getGameStatus(newClearedTiles.length, newMoveCount);
  const message = feedbackMessage(newlyCleared.length, normalized);

  // Build judgment map for client (categoryId → { matches, explanation })
  const judgmentMap = {};
  for (const j of judgments) {
    judgmentMap[j.categoryId] = { matches: j.matches, explanation: j.explanation };
  }

  return res.json({
    type: "result",
    normalized,
    newlyCleared,
    moveScore,
    message,
    newMoveCount,
    newClearedTiles,
    newPreviousAnswers,
    newStatus,
    judgmentMap,
    movesRemaining: MOVE_LIMIT - newMoveCount,
  });
});

module.exports = router;

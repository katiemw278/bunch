import { getBunchScore } from "../scoring.js";

/**
 * Core game logic for Bunch.
 *
 * Rules (from design doc):
 * - Win: clear all 9 tiles; there is no move limit
 * - Bigger bunches earn more points; misses earn zero
 * - Score: number of tiles cleared per move, tracked cumulatively
 * - Moves consumed: any valid submission (hit or miss) counts
 * - Duplicates: exact normalized form already submitted → not a new move, show message
 * - Multiple meanings: an answer may match different categories via different meanings (allowed)
 */

const BOARD_SIZE = 9;

/**
 * Normalize an answer: lowercase, trim whitespace, collapse internal spaces.
 * Conservative — does not strip punctuation (e.g. "olive oil" stays as-is).
 */
function normalizeAnswer(raw) {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Check if a normalized answer is a duplicate of any previously submitted answer.
 * Handles exact matches and simple plural/singular variation.
 */
function isDuplicate(normalized, previousAnswers) {
  if (previousAnswers.includes(normalized)) return true;

  // Simple plural check: "apples" vs "apple", "leaves" vs "leaf" etc.
  const withoutS = normalized.endsWith("s") ? normalized.slice(0, -1) : null;
  const withS = normalized + "s";

  return previousAnswers.some(
    (prev) => prev === withoutS || prev === withS
  );
}

/**
 * Calculate per-move score based on tiles newly cleared.
 * 1 tile  → 10 points
 * 2 tiles → 30 points
 * 3 tiles → 60 points
 * 4 tiles → 100 points
 * ... triangular number: 10*n*(n+1)/2
 */
function calcMoveScore(tilesCleared) {
  return getBunchScore(tilesCleared);
}

/**
 * Bunch size label for feedback messages.
 */
function bunchLabel(count) {
  if (count === 0) return "miss";
  if (count === 1) return "single";
  if (count === 2) return "pair";
  if (count === 3) return "triple";
  if (count === 4) return "quad";
  if (count >= 5 && count <= 8) return "super";
  if (count >= 9) return "perfect";
  return "bunch";
}

/**
 * Feedback message based on bunch size.
 */
function feedbackMessage(count, answer) {
  switch (bunchLabel(count)) {
    case "miss":
      return `"${answer}" didn't match any categories.`;
    case "single":
      return `"${answer}" matched 1 category.`;
    case "pair":
      return `"${answer}" — a pair! 2 categories cleared.`;
    case "triple":
      return `Nice! "${answer}" cleared 3 categories.`;
    case "quad":
      return `Great bunch! "${answer}" cleared 4 categories.`;
    case "super":
      return `Incredible! "${answer}" cleared ${count} categories!`;
    case "perfect":
      return `PERFECT! "${answer}" cleared ${count} categories!`;
    default:
      return `"${answer}" cleared ${count} categories.`;
  }
}

/**
 * Determine progress from the board, with unlimited guesses.
 * Returns "playing" | "won"
 */
function getGameStatus(clearedCount, moveCount, boardSize = BOARD_SIZE) {
  if (clearedCount >= boardSize) return "won";
  return "playing";
}

/**
 * Apply a submission result to game state.
 * Returns the new state object (immutable-style, input not mutated).
 *
 * @param {Object} state - current game state
 * @param {string} normalized - normalized answer
 * @param {string[]} matchedCategoryIds - category IDs that matched
 * @param {Object[]} judgments - [{categoryId, matches, explanation}]
 */
function applySubmission(state, normalized, matchedCategoryIds, judgments, moveNumber) {
  const newlyCleared = matchedCategoryIds.filter(
    (id) => !state.clearedTiles.includes(id)
  );

  const moveScore = calcMoveScore(newlyCleared.length);
  const newClearedTiles = [...state.clearedTiles, ...newlyCleared];
  const newMoveCount = state.moveCount + 1;
  const newScore = state.score + moveScore;

  const historyEntry = {
    moveNumber,
    answer: normalized,
    tilesCleared: newlyCleared,
    score: moveScore,
    label: bunchLabel(newlyCleared.length),
    judgments,
  };

  return {
    ...state,
    clearedTiles: newClearedTiles,
    moveCount: newMoveCount,
    score: newScore,
    previousAnswers: [...state.previousAnswers, normalized],
    history: [...state.history, historyEntry],
    status: getGameStatus(newClearedTiles.length, newMoveCount),
  };
}

/**
 * Initial game state for a given puzzle.
 */
function initialState(puzzleId) {
  return {
    puzzleId,
    clearedTiles: [],
    moveCount: 0,
    score: 0,
    previousAnswers: [],
    history: [],
    status: "playing",
  };
}

export {
  normalizeAnswer,
  isDuplicate,
  calcMoveScore,
  bunchLabel,
  feedbackMessage,
  getGameStatus,
  applySubmission,
  initialState,
  BOARD_SIZE,
};

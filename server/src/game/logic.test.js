const {
  normalizeAnswer,
  isDuplicate,
  calcMoveScore,
  bunchLabel,
  feedbackMessage,
  getGameStatus,
  applySubmission,
  initialState,
  MOVE_LIMIT,
  BOARD_SIZE,
} = require("./logic");

// ── normalizeAnswer ───────────────────────────────────────────────────────────

describe("normalizeAnswer", () => {
  test("lowercases input", () => {
    expect(normalizeAnswer("LEMON")).toBe("lemon");
  });

  test("trims leading/trailing whitespace", () => {
    expect(normalizeAnswer("  banana  ")).toBe("banana");
  });

  test("collapses internal spaces", () => {
    expect(normalizeAnswer("maple  syrup")).toBe("maple syrup");
  });

  test("preserves multi-word phrases", () => {
    expect(normalizeAnswer("Peanut Butter")).toBe("peanut butter");
  });

  test("handles empty string", () => {
    expect(normalizeAnswer("   ")).toBe("");
  });
});

// ── isDuplicate ───────────────────────────────────────────────────────────────

describe("isDuplicate", () => {
  const previous = ["lemon", "honey", "maple syrup"];

  test("detects exact duplicate", () => {
    expect(isDuplicate("lemon", previous)).toBe(true);
  });

  test("returns false for new answer", () => {
    expect(isDuplicate("banana", previous)).toBe(false);
  });

  test("detects plural of already-submitted singular", () => {
    expect(isDuplicate("lemons", previous)).toBe(true);
  });

  test("detects singular of already-submitted plural", () => {
    const prev = ["lemons"];
    expect(isDuplicate("lemon", prev)).toBe(true);
  });

  test("returns false for empty previous list", () => {
    expect(isDuplicate("honey", [])).toBe(false);
  });

  test("multi-word phrase exact duplicate", () => {
    expect(isDuplicate("maple syrup", previous)).toBe(true);
  });

  test("multi-word phrase not duplicate", () => {
    expect(isDuplicate("olive oil", previous)).toBe(false);
  });
});

// ── calcMoveScore ─────────────────────────────────────────────────────────────

describe("calcMoveScore", () => {
  test("0 tiles = 0 points", () => {
    expect(calcMoveScore(0)).toBe(0);
  });

  test("1 tile = 1 point", () => {
    expect(calcMoveScore(1)).toBe(1);
  });

  test("2 tiles = 3 points (triangular)", () => {
    expect(calcMoveScore(2)).toBe(3);
  });

  test("3 tiles = 6 points", () => {
    expect(calcMoveScore(3)).toBe(6);
  });

  test("4 tiles = 10 points", () => {
    expect(calcMoveScore(4)).toBe(10);
  });

  test("9 tiles = 45 points (perfect board)", () => {
    expect(calcMoveScore(9)).toBe(45);
  });
});

// ── bunchLabel ────────────────────────────────────────────────────────────────

describe("bunchLabel", () => {
  test("0 → miss", () => expect(bunchLabel(0)).toBe("miss"));
  test("1 → single", () => expect(bunchLabel(1)).toBe("single"));
  test("2 → pair", () => expect(bunchLabel(2)).toBe("pair"));
  test("3 → triple", () => expect(bunchLabel(3)).toBe("triple"));
  test("4 → quad", () => expect(bunchLabel(4)).toBe("quad"));
  test("5 → super", () => expect(bunchLabel(5)).toBe("super"));
  test("8 → super", () => expect(bunchLabel(8)).toBe("super"));
  test("9 → perfect", () => expect(bunchLabel(9)).toBe("perfect"));
});

// ── feedbackMessage ───────────────────────────────────────────────────────────

describe("feedbackMessage", () => {
  test("miss message contains answer", () => {
    expect(feedbackMessage(0, "blorp")).toContain("blorp");
  });

  test("single match message", () => {
    expect(feedbackMessage(1, "lemon")).toContain("1 category");
  });

  test("pair message", () => {
    expect(feedbackMessage(2, "lemon")).toContain("2 categories");
  });

  test("perfect message is celebratory", () => {
    expect(feedbackMessage(9, "lemon")).toContain("PERFECT");
  });
});

// ── getGameStatus ─────────────────────────────────────────────────────────────

describe("getGameStatus", () => {
  test("playing when tiles remain and moves remain", () => {
    expect(getGameStatus(5, 3)).toBe("playing");
  });

  test("won when all 9 tiles cleared", () => {
    expect(getGameStatus(9, 4)).toBe("won");
  });

  test("won even at move limit if board cleared", () => {
    expect(getGameStatus(9, 8)).toBe("won");
  });

  test("lost when move limit hit without clearing all", () => {
    expect(getGameStatus(8, 8)).toBe("lost");
  });

  test("lost at exactly MOVE_LIMIT moves", () => {
    expect(getGameStatus(0, MOVE_LIMIT)).toBe("lost");
  });

  test("playing at MOVE_LIMIT - 1", () => {
    expect(getGameStatus(5, MOVE_LIMIT - 1)).toBe("playing");
  });
});

// ── applySubmission ───────────────────────────────────────────────────────────

describe("applySubmission", () => {
  const puzzleId = "puzzle-001";

  test("correctly clears newly matched tiles", () => {
    const state = initialState(puzzleId);
    const matched = ["p1-c1", "p1-c2"];
    const newState = applySubmission(state, "lemon", matched, [], 1);
    expect(newState.clearedTiles).toEqual(expect.arrayContaining(matched));
  });

  test("does not re-clear already cleared tiles", () => {
    const state = { ...initialState(puzzleId), clearedTiles: ["p1-c1"] };
    const matched = ["p1-c1", "p1-c2"]; // p1-c1 already cleared
    const newState = applySubmission(state, "lemon", matched, [], 1);
    // p1-c1 should not appear twice
    const count = newState.clearedTiles.filter((id) => id === "p1-c1").length;
    expect(count).toBe(1);
    expect(newState.clearedTiles).toContain("p1-c2");
  });

  test("increments moveCount by 1", () => {
    const state = initialState(puzzleId);
    const newState = applySubmission(state, "lemon", ["p1-c1"], [], 1);
    expect(newState.moveCount).toBe(1);
  });

  test("adds score for newly cleared tiles only", () => {
    const state = initialState(puzzleId);
    const newState = applySubmission(state, "lemon", ["p1-c1", "p1-c2", "p1-c3"], [], 1);
    expect(newState.score).toBe(6); // 3 tiles = triangular(3) = 6
  });

  test("miss scores 0 but still counts as a move", () => {
    const state = initialState(puzzleId);
    const newState = applySubmission(state, "blorp", [], [], 1);
    expect(newState.score).toBe(0);
    expect(newState.moveCount).toBe(1);
  });

  test("adds answer to previousAnswers", () => {
    const state = initialState(puzzleId);
    const newState = applySubmission(state, "lemon", [], [], 1);
    expect(newState.previousAnswers).toContain("lemon");
  });

  test("adds history entry", () => {
    const state = initialState(puzzleId);
    const newState = applySubmission(state, "honey", ["p1-c2", "p1-c5"], [], 1);
    expect(newState.history).toHaveLength(1);
    expect(newState.history[0].answer).toBe("honey");
    expect(newState.history[0].tilesCleared).toEqual(
      expect.arrayContaining(["p1-c2", "p1-c5"])
    );
  });

  test("status becomes won when all 9 cleared", () => {
    const allCats = ["c1","c2","c3","c4","c5","c6","c7","c8","c9"];
    const state = { ...initialState(puzzleId), clearedTiles: allCats.slice(0, 8) };
    const newState = applySubmission(state, "perfect", ["c9"], [], 1);
    expect(newState.status).toBe("won");
  });

  test("status becomes lost at move limit without clearing all", () => {
    const state = { ...initialState(puzzleId), moveCount: MOVE_LIMIT - 1, clearedTiles: [] };
    const newState = applySubmission(state, "miss", [], [], MOVE_LIMIT);
    expect(newState.status).toBe("lost");
  });

  test("cumulative score across multiple moves", () => {
    let state = initialState(puzzleId);
    state = applySubmission(state, "honey", ["c1", "c2"], [], 1);   // 3 pts
    state = applySubmission(state, "lemon", ["c3"], [], 2);          // 1 pt
    expect(state.score).toBe(4);
  });
});

// ── initialState ──────────────────────────────────────────────────────────────

describe("initialState", () => {
  test("starts with zero score", () => {
    expect(initialState("puzzle-001").score).toBe(0);
  });

  test("starts with empty cleared tiles", () => {
    expect(initialState("puzzle-001").clearedTiles).toEqual([]);
  });

  test("starts with playing status", () => {
    expect(initialState("puzzle-001").status).toBe("playing");
  });

  test("stores the puzzle id", () => {
    expect(initialState("puzzle-002").puzzleId).toBe("puzzle-002");
  });
});

// ── Move limit edge cases ─────────────────────────────────────────────────────

describe("move limit enforcement", () => {
  test("MOVE_LIMIT is 8", () => {
    expect(MOVE_LIMIT).toBe(8);
  });

  test("BOARD_SIZE is 9", () => {
    expect(BOARD_SIZE).toBe(9);
  });

  test("requires at least one bunch to win (9 tiles in max 8 moves)", () => {
    // You cannot clear 9 tiles in 8 moves using only single-tile answers,
    // because 8 × 1 = 8 < 9. Verify the math: you need at least one 2+ tile answer.
    const singleMoveClears = 1; // worst case per move
    const maxTilesByAllSingles = MOVE_LIMIT * singleMoveClears;
    expect(maxTilesByAllSingles).toBeLessThan(BOARD_SIZE);
  });
});

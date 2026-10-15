/**
 * Tests for local storage persistence.
 * Uses jsdom environment (configured in jest.config.js).
 */

import { saveGameState, loadGameState, clearGameState } from "./storage";
import type { GameState } from "@/types/game";

const makeState = (puzzleId: string, overrides?: Partial<GameState>): GameState => ({
  puzzleId,
  status: "playing",
  moveCount: 2,
  score: 4,
  clearedTiles: ["p1-c1", "p1-c2"],
  previousAnswers: ["lemon"],
  history: [
    {
      moveNumber: 1,
      answer: "lemon",
      tilesCleared: ["p1-c1", "p1-c2"],
      score: 3,
      label: "pair",
    },
  ],
  tiles: {},
  ...overrides,
});

describe("saveGameState / loadGameState", () => {
  beforeEach(() => localStorage.clear());

  test("save then load returns same state", () => {
    const state = makeState("puzzle-001");
    saveGameState(state);
    const loaded = loadGameState("puzzle-001");
    expect(loaded).not.toBeNull();
    expect(loaded!.puzzleId).toBe("puzzle-001");
    expect(loaded!.score).toBe(4);
    expect(loaded!.clearedTiles).toEqual(["p1-c1", "p1-c2"]);
  });

  test("returns null for unknown puzzleId", () => {
    expect(loadGameState("puzzle-999")).toBeNull();
  });

  test("different puzzleIds don't share state", () => {
    const s1 = makeState("puzzle-001", { score: 10 });
    const s2 = makeState("puzzle-002", { score: 20 });
    saveGameState(s1);
    saveGameState(s2);
    expect(loadGameState("puzzle-001")!.score).toBe(10);
    expect(loadGameState("puzzle-002")!.score).toBe(20);
  });

  test("overwrites previous state for same puzzle", () => {
    const initial = makeState("puzzle-001", { score: 3 });
    saveGameState(initial);
    const updated = makeState("puzzle-001", { score: 10 });
    saveGameState(updated);
    expect(loadGameState("puzzle-001")!.score).toBe(10);
  });

  test("preserves history array", () => {
    const state = makeState("puzzle-001");
    saveGameState(state);
    const loaded = loadGameState("puzzle-001")!;
    expect(loaded.history).toHaveLength(1);
    expect(loaded.history[0].answer).toBe("lemon");
  });

  test("preserves won status", () => {
    const state = makeState("puzzle-001", { status: "won" });
    saveGameState(state);
    expect(loadGameState("puzzle-001")!.status).toBe("won");
  });
});

describe("clearGameState", () => {
  beforeEach(() => localStorage.clear());

  test("cleared state returns null on load", () => {
    const state = makeState("puzzle-001");
    saveGameState(state);
    clearGameState("puzzle-001");
    expect(loadGameState("puzzle-001")).toBeNull();
  });

  test("clearing one puzzle does not affect another", () => {
    saveGameState(makeState("puzzle-001"));
    saveGameState(makeState("puzzle-002"));
    clearGameState("puzzle-001");
    expect(loadGameState("puzzle-001")).toBeNull();
    expect(loadGameState("puzzle-002")).not.toBeNull();
  });
});

import { buildShareText } from "./sharing";
import type { GameState } from "@/types/game";

const categoryIds = [
  "p1-c1","p1-c2","p1-c3",
  "p1-c4","p1-c5","p1-c6",
  "p1-c7","p1-c8","p1-c9",
];

const makeWonState = (): GameState => ({
  puzzleId: "puzzle-001",
  status: "won",
  moveCount: 4,
  score: 16,
  clearedTiles: categoryIds,
  previousAnswers: ["honey", "lemon", "banana", "flour"],
  history: [
    { moveNumber: 1, answer: "honey", tilesCleared: ["p1-c2","p1-c5","p1-c9"], score: 6, label: "triple" },
    { moveNumber: 2, answer: "lemon", tilesCleared: ["p1-c1","p1-c8"], score: 3, label: "pair" },
    { moveNumber: 3, answer: "banana", tilesCleared: ["p1-c4","p1-c7"], score: 3, label: "pair" },
    { moveNumber: 4, answer: "flour", tilesCleared: ["p1-c3","p1-c6"], score: 3, label: "pair" },
  ],
  tiles: {},
});

describe("buildShareText", () => {
  test("includes puzzle number", () => {
    const text = buildShareText(makeWonState(), categoryIds);
    expect(text).toContain("001");
  });

  test("includes move count", () => {
    const text = buildShareText(makeWonState(), categoryIds);
    expect(text).toContain("4");
  });

  test("includes score", () => {
    const text = buildShareText(makeWonState(), categoryIds);
    expect(text).toContain("16");
  });

  test("contains a 3-line emoji grid", () => {
    const text = buildShareText(makeWonState(), categoryIds);
    const lines = text.split("\n");
    // Find lines that contain only emojis (3 chars each with no spaces)
    const gridLines = lines.filter((l) => /^[\u{1F7E9}\u{1F7E6}\u{1F7E7}\u{1F7EA}\u{1F7E8}\u{1F7EB}\u{1F7E5}\u2B1C\u2B1B]{3}$/u.test(l));
    expect(gridLines).toHaveLength(3);
  });

  test("does not contain any category labels (spoiler-free)", () => {
    const text = buildShareText(makeWonState(), categoryIds);
    const labels = ["Something yellow", "Something sweet", "Found in a kitchen"];
    labels.forEach((label) => expect(text).not.toContain(label));
  });

  test("does not contain the answers (spoiler-free)", () => {
    const text = buildShareText(makeWonState(), categoryIds);
    // answers should NOT appear
    ["honey","lemon","banana","flour"].forEach((a) => expect(text).not.toContain(a));
  });

  test("won result text says Won", () => {
    const text = buildShareText(makeWonState(), categoryIds);
    expect(text).toMatch(/won/i);
  });

  test("lost result text says Lost", () => {
    const lostState: GameState = {
      ...makeWonState(),
      status: "lost",
      clearedTiles: ["p1-c1"],
    };
    const text = buildShareText(lostState, categoryIds);
    expect(text).toMatch(/lost/i);
  });

  test("uncleared tiles show black square in grid", () => {
    const lostState: GameState = {
      ...makeWonState(),
      status: "lost",
      clearedTiles: ["p1-c1"],
      history: [
        { moveNumber: 1, answer: "honey", tilesCleared: ["p1-c1"], score: 1, label: "single" },
      ],
    };
    const text = buildShareText(lostState, categoryIds);
    // Black square ⬛ should appear for uncleared tiles
    expect(text).toContain("⬛");
  });
});

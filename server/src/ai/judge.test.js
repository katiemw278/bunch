/**
 * Tests for the AI judge layer.
 * We test the dev-mode path (no API key required) and the error-handling contract.
 */

// Force dev mode so no API calls are made
process.env.DEV_MODE = "true";

const { judgeAnswer } = require("./judge");

const PUZZLE_1_CATS = [
  {
    id: "p1-c1",
    label: "Something yellow",
    definition: "The answer must refer to something characteristically yellow.",
  },
  {
    id: "p1-c2",
    label: "Something sweet",
    definition: "The answer must refer to something characteristically sweet.",
  },
  {
    id: "p1-c8",
    label: "Has a peel or skin",
    definition: "The answer must refer to something with a removable outer layer.",
  },
];

describe("judgeAnswer — dev mode", () => {
  test("returns array with one entry per category", async () => {
    const results = await judgeAnswer("lemon", PUZZLE_1_CATS);
    expect(results).toHaveLength(PUZZLE_1_CATS.length);
  });

  test("lemon matches yellow", async () => {
    const results = await judgeAnswer("lemon", PUZZLE_1_CATS);
    const yellow = results.find((r) => r.categoryId === "p1-c1");
    expect(yellow?.matches).toBe(true);
  });

  test("lemon matches sweet", async () => {
    const results = await judgeAnswer("lemon", PUZZLE_1_CATS);
    const sweet = results.find((r) => r.categoryId === "p1-c2");
    expect(sweet?.matches).toBe(true);
  });

  test("lemon matches has a peel", async () => {
    const results = await judgeAnswer("lemon", PUZZLE_1_CATS);
    const peel = results.find((r) => r.categoryId === "p1-c8");
    expect(peel?.matches).toBe(true);
  });

  test("unknown answer returns false matches (not null)", async () => {
    const results = await judgeAnswer("zzzzunknown", PUZZLE_1_CATS);
    expect(results).not.toBeNull();
    expect(Array.isArray(results)).toBe(true);
    results.forEach((r) => {
      expect(r.matches).toBe(false);
    });
  });

  test("each result has required fields", async () => {
    const results = await judgeAnswer("honey", [
      {
        id: "p1-c2",
        label: "Something sweet",
        definition: "Characteristically sweet.",
      },
    ]);
    expect(results).not.toBeNull();
    const r = results[0];
    expect(r).toHaveProperty("categoryId");
    expect(r).toHaveProperty("matches");
    expect(r).toHaveProperty("explanation");
    expect(typeof r.matches).toBe("boolean");
    expect(typeof r.explanation).toBe("string");
  });

  test("handles empty categories array", async () => {
    const results = await judgeAnswer("lemon", []);
    expect(results).toEqual([]);
  });
});

describe("judgeAnswer — multiple meanings", () => {
  test("honey matches both sweet and sticky and jar", async () => {
    const cats = [
      { id: "p1-c2", label: "Something sweet", definition: "Characteristically sweet." },
      { id: "p1-c5", label: "Something sticky", definition: "Characteristically sticky." },
      { id: "p1-c9", label: "Comes in a jar", definition: "Commonly sold in a jar." },
    ];
    const results = await judgeAnswer("honey", cats);
    expect(results).not.toBeNull();
    const matching = results.filter((r) => r.matches);
    expect(matching.length).toBe(3);
  });
});

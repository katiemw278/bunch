/**
 * Integration tests for the /api/submit route.
 * Uses dev mode so no OpenAI calls are made.
 */

process.env.DEV_MODE = "true";
process.env.PORT = "3099"; // avoid port conflict

const request = require("supertest");

let app;

beforeAll(() => {
  // Require after setting env vars
  app = require("../index");
});

const PUZZLE_ID = "puzzle-001"; // seeded puzzle with known dev judgments

const baseBody = {
  puzzleId: PUZZLE_ID,
  answer: "honey",
  clearedTiles: [],
  previousAnswers: [],
  moveCount: 0,
};

describe("POST /api/submit — happy path", () => {
  test("returns 200 with result type", async () => {
    const res = await request(app).post("/api/submit").send(baseBody);
    expect(res.status).toBe(200);
    expect(res.body.type).toBe("result");
  });

  test("honey clears sweet, sticky, and jar tiles", async () => {
    const res = await request(app).post("/api/submit").send(baseBody);
    expect(res.body.newlyCleared).toEqual(
      expect.arrayContaining(["p1-c2", "p1-c5", "p1-c9"])
    );
  });

  test("increments move count", async () => {
    const res = await request(app).post("/api/submit").send(baseBody);
    expect(res.body.newMoveCount).toBe(1);
  });

  test("returns non-zero move score for multi-tile match", async () => {
    const res = await request(app).post("/api/submit").send(baseBody);
    expect(res.body.moveScore).toBeGreaterThan(1); // 3 tiles = 6 pts
  });

  test("returns message string", async () => {
    const res = await request(app).post("/api/submit").send(baseBody);
    expect(typeof res.body.message).toBe("string");
    expect(res.body.message.length).toBeGreaterThan(0);
  });

  test("returns normalized answer", async () => {
    const res = await request(app)
      .post("/api/submit")
      .send({ ...baseBody, answer: "  HONEY  " });
    expect(res.body.normalized).toBe("honey");
  });
});

describe("POST /api/submit — duplicate detection", () => {
  test("duplicate exact answer returns duplicate type", async () => {
    const res = await request(app)
      .post("/api/submit")
      .send({ ...baseBody, previousAnswers: ["honey"] });
    expect(res.body.type).toBe("duplicate");
    expect(res.body.message).toMatch(/already tried/i);
  });

  test("plural of previous answer is a duplicate", async () => {
    const res = await request(app)
      .post("/api/submit")
      .send({ ...baseBody, answer: "lemons", previousAnswers: ["lemon"] });
    expect(res.body.type).toBe("duplicate");
  });

  test("duplicate does not increment move count (no newMoveCount field)", async () => {
    const res = await request(app)
      .post("/api/submit")
      .send({ ...baseBody, previousAnswers: ["honey"] });
    expect(res.body.newMoveCount).toBeUndefined();
  });
});

describe("POST /api/submit — misses", () => {
  test("unknown answer returns result type with empty newlyCleared", async () => {
    const res = await request(app)
      .post("/api/submit")
      .send({ ...baseBody, answer: "zzzzunknownword" });
    expect(res.body.type).toBe("result");
    expect(res.body.newlyCleared).toEqual([]);
  });

  test("miss still increments move count", async () => {
    const res = await request(app)
      .post("/api/submit")
      .send({ ...baseBody, answer: "zzzzunknownword" });
    expect(res.body.newMoveCount).toBe(1);
  });

  test("miss scores 0", async () => {
    const res = await request(app)
      .post("/api/submit")
      .send({ ...baseBody, answer: "zzzzunknownword" });
    expect(res.body.moveScore).toBe(0);
  });
});

describe("POST /api/submit — win condition", () => {
  test("clearing last tile returns won status", async () => {
    // Set up state with 8/9 tiles already cleared
    const allCats = [
      "p1-c1","p1-c2","p1-c3","p1-c4","p1-c5","p1-c6","p1-c7","p1-c8","p1-c9"
    ];
    const alreadyCleared = allCats.filter((id) => id !== "p1-c3" && id !== "p1-c6");
    // flour clears c3 (kitchen) and c6 (baking)
    const res = await request(app)
      .post("/api/submit")
      .send({
        puzzleId: PUZZLE_ID,
        answer: "flour",
        clearedTiles: alreadyCleared,
        previousAnswers: ["honey", "lemon", "banana"],
        moveCount: 3,
      });
    expect(res.body.newStatus).toBe("won");
  });
});

describe("POST /api/submit — move limit", () => {
  test("at move limit, game should already be over (400)", async () => {
    const res = await request(app)
      .post("/api/submit")
      .send({ ...baseBody, moveCount: 8, clearedTiles: [] });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/submit — validation", () => {
  test("missing puzzleId returns 400", async () => {
    const res = await request(app)
      .post("/api/submit")
      .send({ answer: "honey" });
    expect(res.status).toBe(400);
  });

  test("missing answer returns 400", async () => {
    const res = await request(app)
      .post("/api/submit")
      .send({ puzzleId: PUZZLE_ID });
    expect(res.status).toBe(400);
  });

  test("unknown puzzle id returns 404", async () => {
    const res = await request(app)
      .post("/api/submit")
      .send({ ...baseBody, puzzleId: "puzzle-999" });
    expect(res.status).toBe(404);
  });

  test("empty answer returns 400", async () => {
    const res = await request(app)
      .post("/api/submit")
      .send({ ...baseBody, answer: "   " });
    expect(res.status).toBe(400);
  });
});

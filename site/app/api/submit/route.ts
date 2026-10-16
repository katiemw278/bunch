import { getPuzzleById } from "@/lib/server/puzzles";
import { normalizeAnswer, isDuplicate, feedbackMessage, getGameStatus, calcMoveScore } from "@/lib/server/logic";
import { judgeAnswer } from "@/lib/server/judge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ error: "Invalid request" }, { status: 400 });
    const { puzzleId, answer, selectedCategoryIds, clearedTiles = [], previousAnswers = [], moveCount = 0 } = body as Record<string, unknown>;
    if (typeof puzzleId !== "string" || typeof answer !== "string" || answer.length > 80 || !answer.trim() || typeof moveCount !== "number" || !Number.isSafeInteger(moveCount) || moveCount < 0 || !Array.isArray(clearedTiles) || !Array.isArray(previousAnswers) || !previousAnswers.every(a => typeof a === "string" && a.length <= 80)) return Response.json({ error: "Invalid submission" }, { status: 400 });
    const puzzle = getPuzzleById(puzzleId);
    if (!puzzle) return Response.json({ error: "Puzzle not found" }, { status: 404 });
    const categoryIds = new Set(puzzle.categories.map(c => c.id));
    if (clearedTiles.length > puzzle.categories.length || clearedTiles.some(id => !categoryIds.has(id)) || new Set(clearedTiles).size !== clearedTiles.length || getGameStatus(clearedTiles.length, moveCount, puzzle.categories.length) !== "playing") return Response.json({ error: "Invalid game state" }, { status: 400 });
    if (!Array.isArray(selectedCategoryIds) || !selectedCategoryIds.length || selectedCategoryIds.length > puzzle.categories.length || selectedCategoryIds.some(id => typeof id !== "string" || !categoryIds.has(id) || clearedTiles.includes(id)) || new Set(selectedCategoryIds).size !== selectedCategoryIds.length) return Response.json({ type: "invalid", message: "Select the cards you think your answer matches." });
    const normalized = normalizeAnswer(answer);
    if (isDuplicate(normalized, previousAnswers)) return Response.json({ type: "duplicate", message: `You already tried "${normalized}". Try a different answer.` });
    const pending = puzzle.categories.filter(c => selectedCategoryIds.includes(c.id));
    const checked = await judgeAnswer(normalized, pending);
    const judgments = checked?.filter(row => selectedCategoryIds.includes(row.categoryId));
    if (!judgments || judgments.length !== pending.length) return Response.json({ type: "retry", message: "Couldn't check that answer. Please try again — this won't count as a move." });
    if (judgments.some(row => row.invalidAnswer)) return Response.json({ type: "invalid", message: "Too descriptive. Try one word or a familiar phrase." });
    const newlyCleared = judgments.filter(j => j.matches).map(j => j.categoryId);
    const newClearedTiles = [...clearedTiles, ...newlyCleared];
    const newMoveCount = moveCount + 1;
    const count = newlyCleared.length;
    return Response.json({ type: "result", normalized, newlyCleared, moveScore: calcMoveScore(count),
      message: feedbackMessage(count, normalized), newMoveCount, newClearedTiles,
      newPreviousAnswers: [...previousAnswers, normalized], newStatus: getGameStatus(newClearedTiles.length, newMoveCount, puzzle.categories.length),
      judgmentMap: Object.fromEntries(judgments.map(j => [j.categoryId, { matches: j.matches, explanation: j.explanation }])),
    });
  } catch { return Response.json({ type: "retry", message: "Couldn't check that answer. Please try again — this won't count as a move." }); }
}

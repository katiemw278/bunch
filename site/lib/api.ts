import type { Puzzle } from "@/types/game";
const API_BASE = "";

export interface SubmitRequest {
  requestId?: string;
  puzzleId: string;
  selectedCategoryIds: string[];
  answer: string;
  clearedTiles: string[];
  previousAnswers: string[];
  moveCount: number;
}

export interface SubmitResultResponse {
  type: "result";
  normalized: string;
  newlyCleared: string[];
  moveScore: number;
  message: string;
  newMoveCount: number;
  newClearedTiles: string[];
  newPreviousAnswers: string[];
  newStatus: "playing" | "won";
  judgmentMap: Record<string, { matches: boolean; explanation: string }>;
}

export interface SubmitDuplicateResponse {
  type: "duplicate";
  message: string;
}

export interface SubmitRetryResponse {
  type: "retry";
  message: string;
}

export type SubmitResponse =
  | SubmitResultResponse
  | SubmitDuplicateResponse
  | SubmitRetryResponse
  | { type: "invalid"; message: string };

export async function fetchTodaysPuzzle(mode: "easy" | "hard" = "hard") {
  const res = await fetch(`${API_BASE}/api/puzzle/today?mode=${mode}`);
  if (!res.ok) throw new Error(`Failed to fetch puzzle: ${res.status}`);
  return res.json() as Promise<Puzzle>;
}

export async function fetchPuzzleById(id: string) {
  const res = await fetch(`${API_BASE}/api/puzzle/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch puzzle: ${res.status}`);
  return res.json() as Promise<Puzzle>;
}

export async function submitAnswer(data: SubmitRequest): Promise<SubmitResponse> {
  const res = await fetch(`${API_BASE}/api/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
  return res.json();
}

export async function reportRuling(data: {
  puzzleId: string;
  answer: string;
  categoryId: string;
  note?: string;
}) {
  const res = await fetch(`${API_BASE}/api/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Report failed: ${res.status}`);
  return res.json();
}

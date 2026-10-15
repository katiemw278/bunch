const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface SubmitRequest {
  puzzleId: string;
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
  newStatus: "playing" | "won" | "lost";
  judgmentMap: Record<string, { matches: boolean; explanation: string }>;
  movesRemaining: number;
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
  | SubmitRetryResponse;

export async function fetchTodaysPuzzle() {
  const res = await fetch(`${API_BASE}/api/puzzle/today`);
  if (!res.ok) throw new Error(`Failed to fetch puzzle: ${res.status}`);
  return res.json();
}

export async function fetchPuzzleById(id: string) {
  const res = await fetch(`${API_BASE}/api/puzzle/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch puzzle: ${res.status}`);
  return res.json();
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

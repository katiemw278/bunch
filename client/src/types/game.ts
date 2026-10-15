export interface Category {
  id: string;
  label: string;
}

export interface Puzzle {
  id: string;
  number: number;
  date: string;
  categories: Category[];
}

export type GameStatus = "playing" | "won" | "lost";

export type BunchLabel =
  | "miss"
  | "single"
  | "pair"
  | "triple"
  | "quad"
  | "super"
  | "perfect";

export interface HistoryEntry {
  moveNumber: number;
  answer: string;
  tilesCleared: string[]; // category IDs
  score: number;
  label: BunchLabel;
}

export interface TileState {
  categoryId: string;
  cleared: boolean;
  clearedByMove: number | null; // 1-indexed move number
  clearedByAnswer: string | null;
  colorIndex: number | null; // 1–8 for color theming
  animating: boolean;
}

export interface GameState {
  puzzleId: string;
  status: GameStatus;
  moveCount: number;
  score: number;
  clearedTiles: string[];
  previousAnswers: string[];
  history: HistoryEntry[];
  tiles: Record<string, TileState>; // keyed by categoryId
}

export type FeedbackState =
  | { type: "idle" }
  | { type: "loading"; answer: string }
  | { type: "duplicate"; message: string }
  | { type: "retry"; message: string }
  | { type: "result"; message: string; newlyCleared: string[]; moveScore: number; label: BunchLabel }
  | { type: "error"; message: string };

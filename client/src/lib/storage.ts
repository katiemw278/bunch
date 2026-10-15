import type { GameState } from "@/types/game";

const STORAGE_KEY_PREFIX = "bunch_game_";

/**
 * Save game state to localStorage, keyed by puzzleId.
 * This prevents different days from sharing state.
 */
export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    const key = STORAGE_KEY_PREFIX + state.puzzleId;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save game state:", e);
  }
}

/**
 * Load game state for a specific puzzle ID.
 * Returns null if no saved state exists.
 */
export function loadGameState(puzzleId: string): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const key = STORAGE_KEY_PREFIX + puzzleId;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    // Verify it's for the right puzzle
    if (parsed.puzzleId !== puzzleId) return null;
    return parsed;
  } catch (e) {
    console.warn("Failed to load game state:", e);
    return null;
  }
}

/**
 * Clear state for a specific puzzle (e.g. for testing).
 */
export function clearGameState(puzzleId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + puzzleId);
  } catch {}
}

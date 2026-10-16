import type { GameState } from "@/types/game";

/** Spoiler-free result: one row per move, in submission order. */
export function buildShareText(state: GameState, _categoryIds: string[], number?: number): string {
  const breakdown = state.history.map(entry => entry.tilesCleared.length ? "🟣".repeat(entry.tilesCleared.length) : "❌");
  const puzzleNumber = number === undefined ? state.puzzleId.replace("puzzle-", "").replace(/-hard4?$/, "") : String(number).padStart(3, "0");
  return [`Bunch #${puzzleNumber}`, `Moves: ${state.moveCount}`, `Score: ${state.score}`, "", ...breakdown].join("\n").trim();
}

/**
 * Copy text to clipboard with fallback for environments without clipboard API.
 * Returns { success, usedFallback }.
 */
export async function copyToClipboard(text: string): Promise<{ success: boolean; usedFallback: boolean }> {
  if (typeof navigator === "undefined") return { success: false, usedFallback: false };

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, usedFallback: false };
    } catch {}
  }

  // Fallback: execCommand (deprecated but widely supported)
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return { success: ok, usedFallback: true };
  } catch {
    return { success: false, usedFallback: true };
  }
}

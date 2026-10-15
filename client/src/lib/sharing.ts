import type { GameState, HistoryEntry } from "@/types/game";

// Color squares for the 3x3 grid — by move color index
// No color alone: each square also encodes bunch size via text in the verbose version
const MOVE_EMOJIS = ["🟩", "🟦", "🟧", "🟪", "🟨", "🟫", "🟥", "⬜"];
const MISS_EMOJI = "⬛";
const CLEARED_EMOJI = "✅";

/**
 * Build a spoiler-free share text for a completed game.
 *
 * Format:
 * Bunch #1 — Won in 4 moves
 * Score: 10
 *
 * 🟩🟦🟩
 * 🟧🟩🟦
 * 🟧🟩🟧
 *
 * Bunches: 1×3, 2×2, 1×1
 * bunch.game
 */
export function buildShareText(
  state: GameState,
  categoryIds: string[] // ordered list matching board positions
): string {
  const { status, moveCount, score, history } = state;

  const resultLine =
    status === "won"
      ? `Won in ${moveCount} move${moveCount === 1 ? "" : "s"}`
      : `Lost — board not cleared`;

  // Build grid: each cell = which move cleared it (or null)
  const grid = categoryIds.map((catId) => {
    const move = history.find((h) => h.tilesCleared.includes(catId));
    return move ? move.moveNumber : null;
  });

  // Map move number → emoji (cycle through palette)
  const moveToEmoji = (moveNum: number | null): string => {
    if (moveNum === null) return MISS_EMOJI;
    return MOVE_EMOJIS[(moveNum - 1) % MOVE_EMOJIS.length];
  };

  const gridLines = [
    grid.slice(0, 3).map(moveToEmoji).join(""),
    grid.slice(3, 6).map(moveToEmoji).join(""),
    grid.slice(6, 9).map(moveToEmoji).join(""),
  ].join("\n");

  // Bunch summary: count non-zero entries per move
  const bunchSummary = history
    .filter((h) => h.tilesCleared.length > 0)
    .map((h) => `${h.tilesCleared.length}✕`)
    .join(", ");

  const lines = [
    `Bunch #${state.puzzleId.replace("puzzle-", "")} — ${resultLine}`,
    `Score: ${score} · Moves: ${moveCount}/8`,
    "",
    gridLines,
    "",
    bunchSummary ? `Bunches: ${bunchSummary}` : "",
    "bunch.game",
  ].filter((l) => l !== undefined);

  return lines.join("\n").trim();
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

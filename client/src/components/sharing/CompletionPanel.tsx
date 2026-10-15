"use client";

import { useState } from "react";
import type { GameState } from "@/types/game";
import { buildShareText, copyToClipboard } from "@/lib/sharing";

interface CompletionPanelProps {
  gameState: GameState;
  categoryIds: string[];
  puzzleNumber: number;
}

const MOVE_EMOJIS = ["🟩", "🟦", "🟧", "🟪", "🟨", "🟫", "🟥", "⬜"];
const MISS_EMOJI = "⬛";

export function CompletionPanel({ gameState, categoryIds, puzzleNumber }: CompletionPanelProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const { status, moveCount, score, history } = gameState;
  const won = status === "won";

  // Build 3×3 grid for display
  const grid = categoryIds.map((catId) => {
    const move = history.find((h) => h.tilesCleared.includes(catId));
    return move ? move.moveNumber : null;
  });

  function emojiForMove(moveNum: number | null): string {
    if (moveNum === null) return MISS_EMOJI;
    return MOVE_EMOJIS[(moveNum - 1) % MOVE_EMOJIS.length];
  }

  // Bunch summary
  const bunches = history.filter((h) => h.tilesCleared.length > 0);
  const bunchSummary = bunches.map((h) => `${h.tilesCleared.length}`).join(", ");

  async function handleCopy() {
    const text = buildShareText(gameState, categoryIds);
    const result = await copyToClipboard(text);
    if (result.success) {
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2500);
    } else {
      setCopyState("failed");
    }
  }

  return (
    <div
      className="rounded-xl border border-[#d8d2c8] bg-white p-5 space-y-4 animate-slide-up"
      role="region"
      aria-label="Game complete"
    >
      {/* Result heading */}
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold">
          {won ? "Nice work!" : "Better luck next time"}
        </h2>
        <p className="text-sm text-[#888] mt-1">
          {won
            ? `Cleared in ${moveCount} move${moveCount !== 1 ? "s" : ""}`
            : `Ran out of moves — ${gameState.clearedTiles.length}/9 cleared`}
        </p>
      </div>

      {/* Score */}
      <div className="flex justify-center gap-6 text-center">
        <div>
          <div className="text-2xl font-bold">{score}</div>
          <div className="text-xs text-[#888] uppercase tracking-wide">Score</div>
        </div>
        <div className="w-px bg-[#ede8e1]" />
        <div>
          <div className="text-2xl font-bold">{moveCount}</div>
          <div className="text-xs text-[#888] uppercase tracking-wide">Moves</div>
        </div>
        {bunches.length > 0 && (
          <>
            <div className="w-px bg-[#ede8e1]" />
            <div>
              <div className="text-2xl font-bold">{bunches.length}</div>
              <div className="text-xs text-[#888] uppercase tracking-wide">Bunches</div>
            </div>
          </>
        )}
      </div>

      {/* 3×3 spoiler-free grid */}
      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-1" aria-label="Result grid" role="img">
          {grid.map((moveNum, i) => (
            <span
              key={i}
              className="text-2xl leading-none"
              title={moveNum !== null ? `Move ${moveNum}` : "Not cleared"}
            >
              {emojiForMove(moveNum)}
            </span>
          ))}
        </div>
      </div>

      {/* Bunch breakdown */}
      {bunchSummary && (
        <p className="text-center text-xs text-[#888]">
          Tiles cleared per move: {bunchSummary}
        </p>
      )}

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={[
          "w-full py-2.5 rounded-lg font-semibold text-[15px] transition-all",
          "focus:outline-none focus:ring-2 focus:ring-[#2c2c2c] focus:ring-offset-2",
          copyState === "copied"
            ? "bg-[#d4e8d0] text-[#2c6e44] border border-[#b8d4b2]"
            : copyState === "failed"
            ? "bg-[#f0d4d4] text-[#b83c2c] border border-[#e0b8b8]"
            : "bg-[#2c2c2c] text-[#faf9f7] hover:bg-[#1a1a1a]",
        ].join(" ")}
        aria-live="polite"
      >
        {copyState === "copied"
          ? "Copied to clipboard ✓"
          : copyState === "failed"
          ? "Copy failed — select and copy manually"
          : "Copy result"}
      </button>

      {/* Fallback text for manual copy */}
      {copyState === "failed" && (
        <pre className="text-xs text-[#888] bg-[#f5f2ee] rounded p-3 overflow-auto whitespace-pre-wrap">
          {buildShareText(gameState, categoryIds)}
        </pre>
      )}
    </div>
  );
}

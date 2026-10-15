"use client";

import { useState } from "react";
import { useGame } from "@/hooks/useGame";
import { Board } from "@/components/board/Board";
import { AnswerInput } from "@/components/input/AnswerInput";
import { FeedbackBar } from "@/components/feedback/FeedbackBar";
import { AnswerHistory } from "@/components/history/AnswerHistory";
import { CompletionPanel } from "@/components/sharing/CompletionPanel";
import { HelpModal } from "@/components/help/HelpModal";
import { ReportModal } from "@/components/help/ReportModal";

const MOVE_LIMIT = 8;
const BOARD_SIZE = 9;

export default function Home() {
  const { puzzle, gameState, feedback, loadError, isSubmitting, submit, dismissFeedback } =
    useGame();

  const [showHelp, setShowHelp] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    categoryId: string;
    categoryLabel: string;
  } | null>(null);

  // ── Loading state ────────────────────────────────────────────────────
  if (loadError) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm space-y-3">
          <p className="text-[#c05c3c] font-medium">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-[#2c2c2c] text-[#faf9f7] text-sm font-semibold hover:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#2c2c2c] focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!puzzle || !gameState) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3" aria-label="Loading puzzle" role="status">
          <div className="w-8 h-8 border-2 border-[#2c2c2c] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#888]">Loading today's puzzle…</span>
        </div>
      </main>
    );
  }

  const isGameOver = gameState.status !== "playing";
  const movesRemaining = MOVE_LIMIT - gameState.moveCount;
  const clearedCount = gameState.clearedTiles.length;

  function handleReport(categoryId: string) {
    const cat = puzzle!.categories.find((c) => c.id === categoryId);
    if (!cat) return;
    // Find the answer that cleared this tile
    const entry = gameState!.history.find((h) => h.tilesCleared.includes(categoryId));
    if (!entry) return;
    setReportTarget({ categoryId, categoryLabel: cat.label });
  }

  // The answer for the report comes from history
  const reportAnswer =
    reportTarget
      ? gameState.history.find((h) => h.tilesCleared.includes(reportTarget.categoryId))?.answer ?? ""
      : "";

  return (
    <>
      <div className="min-h-screen flex flex-col items-center px-4 py-6 sm:py-10">
        {/* ── Game column ─────────────────────────────────────────────── */}
        <div className="w-full max-w-[480px] flex flex-col gap-5">

          {/* ── Header ────────────────────────────────────────────────── */}
          <header className="flex items-center justify-between">
            <h1
              className="font-display text-3xl font-bold tracking-tight text-[#2c2c2c]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Bunch
            </h1>
            <button
              onClick={() => setShowHelp(true)}
              className="text-sm font-medium text-[#666] hover:text-[#2c2c2c] border border-[#d8d2c8] rounded-lg px-3 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2c2c2c]"
              aria-label="How to play"
            >
              How to play
            </button>
          </header>

          {/* ── Puzzle meta ───────────────────────────────────────────── */}
          <div className="flex items-baseline justify-between border-b border-[#ede8e1] pb-3">
            <p className="text-sm text-[#888]">
              Puzzle #{puzzle.number} &middot;{" "}
              {new Date(puzzle.date + "T12:00:00").toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-[#aaa]">
              Nine categories. How few answers?
            </p>
          </div>

          {/* ── Stats bar ─────────────────────────────────────────────── */}
          <div
            className="flex items-center gap-4 text-sm"
            aria-label="Game progress"
            role="status"
            aria-live="polite"
          >
            {/* Cleared progress */}
            <div className="flex items-center gap-1.5">
              <ProgressDots total={BOARD_SIZE} cleared={clearedCount} />
              <span className="text-[#888] text-xs">
                {clearedCount}/{BOARD_SIZE}
              </span>
            </div>

            <div className="flex-1" />

            {/* Score */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#888] uppercase tracking-wide">Score</span>
              <span className="font-semibold text-[#2c2c2c] tabular-nums">
                {gameState.score}
              </span>
            </div>

            {/* Moves */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#888] uppercase tracking-wide">Moves</span>
              <span
                className={[
                  "font-semibold tabular-nums",
                  movesRemaining <= 2 && !isGameOver
                    ? "text-[#c05c3c]"
                    : "text-[#2c2c2c]",
                ].join(" ")}
                aria-label={`${movesRemaining} move${movesRemaining !== 1 ? "s" : ""} remaining`}
              >
                {gameState.moveCount}/{MOVE_LIMIT}
              </span>
            </div>
          </div>

          {/* ── Board ─────────────────────────────────────────────────── */}
          <Board
            categories={puzzle.categories}
            gameState={gameState}
            onReport={handleReport}
          />

          {/* ── Input (hidden once game is over) ──────────────────────── */}
          {!isGameOver && (
            <div className="space-y-2">
              <AnswerInput
                onSubmit={submit}
                isSubmitting={isSubmitting}
                isDisabled={false}
                feedback={feedback}
              />
              {movesRemaining <= 3 && movesRemaining > 0 && (
                <p className="text-xs text-center text-[#c05c3c]" role="alert">
                  {movesRemaining} move{movesRemaining !== 1 ? "s" : ""} left
                </p>
              )}
            </div>
          )}

          {/* ── Feedback ──────────────────────────────────────────────── */}
          <FeedbackBar feedback={feedback} onDismiss={dismissFeedback} />

          {/* ── Completion panel ──────────────────────────────────────── */}
          {isGameOver && (
            <CompletionPanel
              gameState={gameState}
              categoryIds={puzzle.categories.map((c) => c.id)}
              puzzleNumber={puzzle.number}
            />
          )}

          {/* ── Answer history ────────────────────────────────────────── */}
          {gameState.history.length > 0 && (
            <div className="border-t border-[#ede8e1] pt-4">
              <AnswerHistory
                history={gameState.history}
                totalCategories={BOARD_SIZE}
              />
            </div>
          )}

          {/* ── Footer ────────────────────────────────────────────────── */}
          <footer className="text-center text-xs text-[#bbb] pt-2 pb-6 border-t border-[#ede8e1]">
            A new puzzle every day
          </footer>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {reportTarget && (
        <ReportModal
          puzzleId={puzzle.id}
          answer={reportAnswer}
          categoryId={reportTarget.categoryId}
          categoryLabel={reportTarget.categoryLabel}
          onClose={() => setReportTarget(null)}
        />
      )}
    </>
  );
}

// ── Progress dots component ────────────────────────────────────────────────

function ProgressDots({ total, cleared }: { total: number; cleared: number }) {
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={[
            "w-2 h-2 rounded-full transition-colors duration-300",
            i < cleared ? "bg-[#2c2c2c]" : "bg-[#d8d2c8]",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BunchWordmark } from "@/components/brand/BunchWordmark";
import { boardSettleDelay } from "@/lib/animation-timing";
import { useGame } from "@/hooks/useGame";
import { VineLoader } from "@/components/loading/VineLoader";
import { Board } from "@/components/board/Board";
import { AnswerInput } from "@/components/input/AnswerInput";
import { FeedbackBar } from "@/components/feedback/FeedbackBar";
import { AnswerHistory } from "@/components/history/AnswerHistory";
import { CompletionPanel } from "@/components/sharing/CompletionPanel";
import { HelpModal } from "@/components/help/HelpModal";
import { ReportModal } from "@/components/help/ReportModal";

export default function Home() {
  const [playing, setPlaying] = useState(false);
  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const top = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    top();
    const frame = requestAnimationFrame(top);
    window.addEventListener("pageshow", top);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pageshow", top);
      window.history.scrollRestoration = previous;
    };
  }, [playing]);
  const [showHelp, setShowHelp] = useState(false);
  if (!playing) return <>
    <main className="mode-screen">
      <div className="mode-card welcome-card">
        <h1 aria-label="bunch"><BunchWordmark /></h1>
        <p className="welcome-intro">How many categories can you bunch with one word?</p>
        <button type="button" className="welcome-play" onClick={() => setPlaying(true)}>Let's crush it!</button>
        <button type="button" className="chooser-help" onClick={() => setShowHelp(true)}>How to Play</button>
      </div>
    </main>
    {showHelp && <HelpModal totalCategories={16} onClose={() => setShowHelp(false)} />}
  </>;
  return <Game onHome={() => setPlaying(false)} />;
}

function Game({ onHome }: { onHome: () => void }) {
  const { puzzle, gameState, feedback, loadError, isSubmitting, isAnimating, restoredCompleted, submit } = useGame("hard");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionNotice, setSelectionNotice] = useState(0);
  useLayoutEffect(() => { if (feedback.type === "result") setSelectedIds([]); }, [feedback]);
  const [showHelp, setShowHelp] = useState(true);
  const autoResultsShown = useRef(false);
  const [showResults, setShowResults] = useState(false);
  const [revealBoard, setRevealBoard] = useState(false);
  const gameStatus = gameState?.status;
  const lastBunchSize = gameState?.history.at(-1)?.tilesCleared.length ?? 0;
  useLayoutEffect(() => {
    if (!gameStatus || gameStatus === "playing") { autoResultsShown.current = false; setShowResults(false); setRevealBoard(false); return; }
    if (restoredCompleted) {
      setShowHelp(false);
      if (!autoResultsShown.current) {
        autoResultsShown.current = true;
        setRevealBoard(true);
        setShowResults(true);
      }
      return;
    }
    if (showHelp || autoResultsShown.current) return;
    const timer = setTimeout(() => { autoResultsShown.current = true; setRevealBoard(true); setShowResults(true); }, boardSettleDelay(lastBunchSize));
    return () => clearTimeout(timer);
  }, [gameStatus, lastBunchSize, showHelp, restoredCompleted]);
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
        <VineLoader />
      </main>
    );
  }

  const isGameOver = gameState.status !== "playing";

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
      <div className="game-shell min-h-screen flex flex-col items-center px-4 py-6 sm:py-10">
        {/* ── Game column ─────────────────────────────────────────────── */}
        <div className="game-column w-full flex flex-col gap-5 hard-game">

          <header className="game-header">
            <div className="brand">
              
              <h1><button type="button" className="brand-home" aria-label="Bunch — home" onClick={onHome}><BunchWordmark /></button></h1>
            </div>
            <button onClick={() => setShowHelp(true)} className="help-button" aria-label="How to play">
              <span aria-hidden="true">?</span>
            </button>
          </header>

          <div className="game-stats" aria-label="Game progress">
            <time className="puzzle-date" dateTime={puzzle.date} aria-label={new Date(puzzle.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}>
              <span className="date-weekday">{new Date(puzzle.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" })}, </span>
              {new Date(puzzle.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </time>
            <div className="stat-pills">
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
              <span className="font-semibold text-[#302441] tabular-nums" aria-label={`${gameState.moveCount} moves taken`}>
                {gameState.moveCount}
              </span>
            </div>
            </div>
          </div>

          {/* ── Board ─────────────────────────────────────────────────── */}
          <Board
            showAll={revealBoard || restoredCompleted}
            selectedIds={selectedIds}
            selectionNotice={selectionNotice}
            onSelect={id => { setSelectionNotice(0); setSelectedIds(ids => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]); }}
            disabled={isSubmitting || isAnimating || isGameOver}
            categories={puzzle.categories}
            gameState={gameState}
            onReport={handleReport}
            feedback={feedback}
          />

          {/* ── Input (hidden once game is over) ──────────────────────── */}
          {!isGameOver && (
            <div className="space-y-2">
              <AnswerInput
                canSubmit={selectedIds.length > 0}
                onSelectionRequired={() => setSelectionNotice(value => value + 1)}
                onSubmit={answer => submit(answer, selectedIds)}
                isSubmitting={isSubmitting}
                isDisabled={isAnimating}
                feedback={feedback}
              />
            </div>
          )}

          {/* ── Feedback ──────────────────────────────────────────────── */}
          {!isGameOver && <FeedbackBar feedback={feedback} />}

          {/* ── Completion panel ──────────────────────────────────────── */}
          {isGameOver && (
            <button type="button" className="view-results-button" onClick={() => { setRevealBoard(true); setShowResults(true); }}>See my results ↗</button>
          )}
          {isGameOver && (
            <CompletionPanel
              gameState={gameState}
              categoryIds={puzzle.categories.map((c) => c.id)}
              puzzleNumber={puzzle.number}
              open={showResults}
              onClose={() => setShowResults(false)}
            />
          )}

          {/* ── Answer history ────────────────────────────────────────── */}
          {gameState.history.length > 0 && (
            <div className="border-t border-[#ede8e1] pt-4">
              <AnswerHistory
                history={gameState.history}
                categories={puzzle.categories}
                tiles={gameState.tiles}
                onReport={handleReport}
              />
            </div>
          )}

        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {showHelp && !restoredCompleted && <HelpModal totalCategories={puzzle.categories.length} onClose={() => setShowHelp(false)} />}
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


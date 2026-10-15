"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { GameState, FeedbackState, TileState, BunchLabel, HistoryEntry } from "@/types/game";
import type { Puzzle } from "@/types/game";
import { fetchTodaysPuzzle, fetchPuzzleById, submitAnswer } from "@/lib/api";
import { saveGameState, loadGameState } from "@/lib/storage";

const MOVE_LIMIT = 8;
const BOARD_SIZE = 9;

// Colors cycle per submission (not per tile — same submission = same color)
const MOVE_COLORS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

function bunchLabelFromCount(count: number): BunchLabel {
  if (count === 0) return "miss";
  if (count === 1) return "single";
  if (count === 2) return "pair";
  if (count === 3) return "triple";
  if (count === 4) return "quad";
  if (count >= 5 && count <= 8) return "super";
  if (count === 9) return "perfect";
  return "single";
}

function buildInitialTiles(categories: { id: string }[]): Record<string, TileState> {
  const tiles: Record<string, TileState> = {};
  for (const cat of categories) {
    tiles[cat.id] = {
      categoryId: cat.id,
      cleared: false,
      clearedByMove: null,
      clearedByAnswer: null,
      colorIndex: null,
      animating: false,
    };
  }
  return tiles;
}

function rebuildTiles(
  categories: { id: string }[],
  history: HistoryEntry[]
): Record<string, TileState> {
  const tiles = buildInitialTiles(categories);
  for (const entry of history) {
    for (const catId of entry.tilesCleared) {
      if (tiles[catId]) {
        tiles[catId] = {
          ...tiles[catId],
          cleared: true,
          clearedByMove: entry.moveNumber,
          clearedByAnswer: entry.answer,
          colorIndex: MOVE_COLORS[(entry.moveNumber - 1) % MOVE_COLORS.length],
          animating: false,
        };
      }
    }
  }
  return tiles;
}

export function useGame() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>({ type: "idle" });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent duplicate submissions while one is in flight
  const submittingRef = useRef(false);

  // ── Load puzzle on mount ─────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const p = await fetchTodaysPuzzle();
        setPuzzle(p);

        // Attempt to restore saved state
        const saved = loadGameState(p.id);
        if (saved && saved.status !== undefined) {
          // Rebuild tile state from history
          const tiles = rebuildTiles(p.categories, saved.history);
          setGameState({ ...saved, tiles });
        } else {
          // Fresh game
          setGameState({
            puzzleId: p.id,
            status: "playing",
            moveCount: 0,
            score: 0,
            clearedTiles: [],
            previousAnswers: [],
            history: [],
            tiles: buildInitialTiles(p.categories),
          });
        }
      } catch (e) {
        setLoadError("Couldn't load today's puzzle. Check your connection and refresh.");
      }
    }
    load();
  }, []);

  // ── Persist state on change ──────────────────────────────────────────────

  useEffect(() => {
    if (gameState) {
      saveGameState(gameState);
    }
  }, [gameState]);

  // ── Submit an answer ─────────────────────────────────────────────────────

  const submit = useCallback(
    async (rawAnswer: string) => {
      if (!puzzle || !gameState) return;
      if (submittingRef.current) return;
      if (gameState.status !== "playing") return;

      const trimmed = rawAnswer.trim();
      if (!trimmed) return;

      submittingRef.current = true;
      setIsSubmitting(true);
      setFeedback({ type: "loading", answer: trimmed });

      try {
        const result = await submitAnswer({
          puzzleId: puzzle.id,
          answer: trimmed,
          clearedTiles: gameState.clearedTiles,
          previousAnswers: gameState.previousAnswers,
          moveCount: gameState.moveCount,
        });

        if (result.type === "duplicate") {
          setFeedback({ type: "duplicate", message: result.message });
          return;
        }

        if (result.type === "retry") {
          setFeedback({ type: "retry", message: result.message });
          return;
        }

        // type === "result"
        const { newlyCleared, moveScore, message, newMoveCount, newClearedTiles,
                newPreviousAnswers, newStatus } = result;

        const moveNumber = newMoveCount;
        const colorIndex = MOVE_COLORS[(moveNumber - 1) % MOVE_COLORS.length];
        const label = bunchLabelFromCount(newlyCleared.length);

        const newEntry: HistoryEntry = {
          moveNumber,
          answer: result.normalized,
          tilesCleared: newlyCleared,
          score: moveScore,
          label,
        };

        setGameState((prev) => {
          if (!prev) return prev;

          // Animate newly cleared tiles
          const updatedTiles = { ...prev.tiles };
          for (const catId of newlyCleared) {
            updatedTiles[catId] = {
              ...updatedTiles[catId],
              cleared: true,
              clearedByMove: moveNumber,
              clearedByAnswer: result.normalized,
              colorIndex,
              animating: true,
            };
          }

          return {
            ...prev,
            status: newStatus,
            moveCount: newMoveCount,
            score: prev.score + moveScore,
            clearedTiles: newClearedTiles,
            previousAnswers: newPreviousAnswers,
            history: [...prev.history, newEntry],
            tiles: updatedTiles,
          };
        });

        setFeedback({
          type: "result",
          message,
          newlyCleared,
          moveScore,
          label,
        });

        // Clear animation flags after animation completes
        const animDelay = newlyCleared.length * 120 + 400;
        setTimeout(() => {
          setGameState((prev) => {
            if (!prev) return prev;
            const updatedTiles = { ...prev.tiles };
            for (const catId of newlyCleared) {
              if (updatedTiles[catId]) {
                updatedTiles[catId] = { ...updatedTiles[catId], animating: false };
              }
            }
            return { ...prev, tiles: updatedTiles };
          });
        }, animDelay);
      } catch (e) {
        setFeedback({
          type: "error",
          message: "Something went wrong. Please try again.",
        });
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [puzzle, gameState]
  );

  const dismissFeedback = useCallback(() => {
    setFeedback({ type: "idle" });
  }, []);

  return {
    puzzle,
    gameState,
    feedback,
    loadError,
    isSubmitting,
    submit,
    dismissFeedback,
  };
}

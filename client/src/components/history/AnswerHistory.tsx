"use client";

import type { HistoryEntry } from "@/types/game";

interface AnswerHistoryProps {
  history: HistoryEntry[];
  totalCategories: number;
}

const BUNCH_BADGE: Record<string, string> = {
  miss: "·",
  single: "1",
  pair: "2",
  triple: "3",
  quad: "4",
  super: "5+",
  perfect: "9",
};

const COLOR_CLASSES: Record<number, string> = {
  1: "tile-color-1",
  2: "tile-color-2",
  3: "tile-color-3",
  4: "tile-color-4",
  5: "tile-color-5",
  6: "tile-color-6",
  7: "tile-color-7",
  8: "tile-color-8",
};

export function AnswerHistory({ history, totalCategories }: AnswerHistoryProps) {
  if (history.length === 0) return null;

  return (
    <section aria-label="Answer history">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[#888] mb-2">
        History
      </h2>
      <ol className="space-y-1" reversed>
        {[...history].reverse().map((entry) => {
          const colorClass = entry.tilesCleared.length > 0
            ? COLOR_CLASSES[((entry.moveNumber - 1) % 8) + 1]
            : "";

          return (
            <li
              key={entry.moveNumber}
              className="flex items-center gap-2 text-[13px]"
              aria-label={`Move ${entry.moveNumber}: "${entry.answer}", ${entry.tilesCleared.length} tile${entry.tilesCleared.length !== 1 ? "s" : ""} cleared`}
            >
              {/* Move number */}
              <span className="text-[11px] text-[#b8b2a8] w-5 text-right shrink-0">
                {entry.moveNumber}
              </span>

              {/* Color swatch */}
              <span
                className={[
                  "w-3 h-3 rounded-sm border shrink-0",
                  entry.tilesCleared.length > 0 ? colorClass : "bg-[#ede8e1] border-[#d8d2c8]",
                ].join(" ")}
                aria-hidden="true"
              />

              {/* Answer */}
              <span className="font-medium text-[#2c2c2c] truncate">
                {entry.answer}
              </span>

              {/* Tiles cleared badge */}
              <span
                className={[
                  "ml-auto shrink-0 text-[11px] font-semibold px-1.5 py-0.5 rounded",
                  entry.tilesCleared.length > 0
                    ? `${colorClass} border`
                    : "text-[#b8b2a8]",
                ].join(" ")}
                aria-hidden="true"
              >
                {BUNCH_BADGE[entry.label] || entry.tilesCleared.length}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

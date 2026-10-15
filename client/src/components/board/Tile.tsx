"use client";

import { useEffect, useRef } from "react";
import type { TileState } from "@/types/game";

interface TileProps {
  category: { id: string; label: string };
  tile: TileState;
  onReport?: (categoryId: string) => void;
}

export function Tile({ category, tile, onReport }: TileProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Re-trigger animation when animating flag flips on
  useEffect(() => {
    if (tile.animating && ref.current) {
      ref.current.classList.remove("tile-animating");
      void ref.current.offsetWidth; // reflow
      ref.current.classList.add("tile-animating");
    }
  }, [tile.animating]);

  const colorClass = tile.cleared && tile.colorIndex ? `tile-color-${tile.colorIndex}` : "";

  return (
    <div
      ref={ref}
      className={[
        "relative flex flex-col items-center justify-center",
        "rounded-lg border text-center select-none",
        "transition-colors duration-300",
        "min-h-[90px] sm:min-h-[100px] p-2",
        tile.cleared
          ? `${colorClass} border-current/30`
          : "bg-white border-[#d8d2c8] hover:border-[#b8b2a8]",
        tile.animating ? "tile-animating" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="listitem"
      aria-label={
        tile.cleared
          ? `${category.label} — cleared by "${tile.clearedByAnswer}" (move ${tile.clearedByMove})`
          : category.label
      }
    >
      {/* Move badge — non-color indicator linking tiles from same move */}
      {tile.cleared && tile.clearedByMove !== null && (
        <span
          className="absolute top-1.5 left-1.5 text-[10px] font-semibold opacity-50 leading-none"
          aria-hidden="true"
        >
          #{tile.clearedByMove}
        </span>
      )}

      {/* Category label */}
      <span
        className={[
          "text-[13px] sm:text-sm font-medium leading-snug px-1",
          tile.cleared ? "opacity-80" : "opacity-100",
        ].join(" ")}
      >
        {category.label}
      </span>

      {/* Cleared answer */}
      {tile.cleared && tile.clearedByAnswer && (
        <span className="mt-1 text-[11px] opacity-60 leading-none italic truncate max-w-full px-1">
          {tile.clearedByAnswer}
        </span>
      )}

      {/* Report button — only on cleared tiles */}
      {tile.cleared && onReport && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReport(category.id);
          }}
          className="absolute bottom-1 right-1 text-[10px] opacity-30 hover:opacity-70 transition-opacity p-0.5 rounded"
          aria-label={`Report ruling for "${category.label}"`}
          title="Report incorrect ruling"
        >
          ⚑
        </button>
      )}
    </div>
  );
}

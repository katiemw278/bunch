"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { POP_INTERVAL_MS } from "@/lib/animation-timing";
import type { TileState } from "@/types/game";

interface TileProps {
  category: { id: string; label: string };
  selected?: boolean;
  showBunchColor?: boolean;
  rejected?: boolean;
  rejectionKey?: number;
  onSelect?: () => void;
  tile: TileState;
  revealIndex?: number;
  enthusiasm?: number;
  onReport?: (categoryId: string) => void;
}

export function Tile({ category, tile, onReport, revealIndex = 0, enthusiasm = 1, selected = false, showBunchColor = false, onSelect, rejected = false, rejectionKey = 0 }: TileProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Re-trigger animation when animating flag flips on
  useEffect(() => {
    const card = ref.current?.querySelector(".category-tile");
    if (tile.animating && card) {
      card.classList.remove("tile-animating");
      void (card as HTMLElement).offsetWidth; // reflow
      card.classList.add("tile-animating");
    }
  }, [tile.animating]);

  useEffect(() => {
    const card = ref.current?.querySelector<HTMLElement>(".category-tile");
    if (!card || !rejected || selected || tile.cleared || typeof card.animate !== "function") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shake = reduced ? null : card.animate([
      { transform: "translateX(0) rotate(0)" },
      { transform: "translateX(-7px) rotate(-2deg)" },
      { transform: "translateX(7px) rotate(2deg)" },
      { transform: "translateX(-6px) rotate(-1.5deg)" },
      { transform: "translateX(5px) rotate(1deg)" },
      { transform: "translateX(-3px) rotate(-.5deg)" },
      { transform: "translateX(0) rotate(0)" },
    ], { duration: 480, delay: 180, easing: "ease-in-out" });
    const flash = card.animate([
      { backgroundColor: "#fff1ed", borderColor: "#cf625d", boxShadow: "0 0 0 3px #e9918655" },
      { backgroundColor: "#ffd7cf", borderColor: "#bd4b4b", boxShadow: "0 0 0 4px #e9918655", offset: .3 },
      { backgroundColor: "#fff1ed", borderColor: "#cf625d", offset: .75 },
      { backgroundColor: "#fffdfb", borderColor: "#694d79", boxShadow: "0 4px 0 #b8a0c55c" },
    ], { duration: 1000, easing: "ease-out" });
    return () => { shake?.cancel(); flash.cancel(); };
  }, [rejected, rejectionKey, selected, tile.cleared]);

  const colorClass = showBunchColor && tile.cleared && tile.colorIndex ? `tile-color-${tile.colorIndex}` : "";

  return (
    <div
      ref={ref}
      data-category-id={category.id}
      className="tile-slot relative"
      role="listitem"
      style={{ "--reveal-delay": `${revealIndex * POP_INTERVAL_MS}ms`, "--pop-scale": 1.025 + Math.min(enthusiasm, 9) * 0.007, "--juice-color": "#a863ed" } as CSSProperties}
    >
    <div
      role={!tile.cleared ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-pressed={!tile.cleared ? selected : undefined}
      aria-disabled={!tile.cleared && !onSelect ? true : undefined}
      onClick={onSelect}
      onKeyDown={event => { if (onSelect && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onSelect(); } }}
      className={[
        "category-tile relative flex flex-col items-center justify-center",
        "border text-center select-none",
        "transition-colors duration-300",
        "p-2",
        tile.cleared
          ? `${colorClass} is-cleared`
          : "bg-white border-[#d8d2c8] hover:border-[#b8b2a8]",
        tile.animating ? "tile-animating" : "",
        selected && !tile.cleared ? "is-selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={
        tile.cleared
          ? `${category.label} — cleared by "${tile.clearedByAnswer}" (move ${tile.clearedByMove})`
          : `${category.label}${rejected && !selected ? " — not a match" : ""}`
      }
    >
      {rejected && !selected && !tile.cleared && <i key={rejectionKey} className="wrong-mark" aria-hidden="true">×</i>}
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
        <span className="cleared-answer mt-2 text-[11px] leading-snug truncate max-w-full px-1">
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
    {tile.animating && <div className="juice-burst" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => {
        const angle = Math.PI + .3 + (i / 7) * (Math.PI - .6);
        return <i key={i} style={{ "--dx": `${Math.cos(angle) * (24 + (i % 2) * 7)}px`, "--dy": `${Math.sin(angle) * (29 + (i % 2) * 7) - 8}px`, "--drop-size": `${6 + (i % 3) * 2}px`, "--drop-angle": `${(angle * 180 / Math.PI) + 90}deg` } as CSSProperties} />;
      })}
    </div>}
    </div>
  );
}

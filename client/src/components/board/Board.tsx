"use client";

import type { Category, GameState } from "@/types/game";
import { Tile } from "./Tile";

interface BoardProps {
  categories: Category[];
  gameState: GameState;
  onReport?: (categoryId: string) => void;
}

export function Board({ categories, gameState, onReport }: BoardProps) {
  return (
    <section aria-label="Category board">
      <div
        className="grid grid-cols-3 gap-2 sm:gap-3"
        role="list"
      >
        {categories.map((cat) => {
          const tile = gameState.tiles[cat.id] ?? {
            categoryId: cat.id,
            cleared: false,
            clearedByMove: null,
            clearedByAnswer: null,
            colorIndex: null,
            animating: false,
          };
          return (
            <Tile
              key={cat.id}
              category={cat}
              tile={tile}
              onReport={onReport}
            />
          );
        })}
      </div>
    </section>
  );
}

"use client";
import type { Category, GameState, FeedbackState } from "@/types/game";
import { SelectionPrompt } from "@/components/feedback/SelectionPrompt";
import { FeedbackBar } from "@/components/feedback/FeedbackBar";
import { Tile } from "./Tile";
interface BoardProps {
  showAll?: boolean;
  selectionNotice?: number;
  categories: Category[];
  gameState: GameState;
  feedback: FeedbackState;
  selectedIds: string[];
  onSelect: (id: string) => void;
  disabled?: boolean;
  onReport?: (id: string) => void;
}
export function Board({ categories, gameState, feedback, onReport, selectedIds, onSelect, disabled, showAll = false, selectionNotice = 0 }: BoardProps) {
  const matched = !showAll && feedback.type === "result" ? feedback.newlyCleared : [];
  return <section className="board-stage" aria-label="Select categories for your answer">
    <div className="grid hard-board gap-2 sm:gap-3" role="list">
      {categories.map(cat => {
        const tile = gameState.tiles[cat.id];
        if (tile?.cleared && !tile.animating && !showAll) return <div key={cat.id} className="empty-card-slot" aria-hidden="true" />;
        return <Tile showBunchColor={showAll} key={cat.id} category={cat} tile={showAll ? { ...tile, animating: false } : tile}
          rejected={!showAll && feedback.type === "result" && !!feedback.rejectedIds?.includes(cat.id)}
          rejectionKey={gameState.moveCount}
          selected={selectedIds.includes(cat.id)} onSelect={!disabled && !tile.cleared ? () => onSelect(cat.id) : undefined}
          onReport={onReport} revealIndex={Math.max(0, matched.indexOf(cat.id))} enthusiasm={matched.length} />;
      })}
    </div>
    {selectionNotice > 0 && <SelectionPrompt key={selectionNotice} />}
    {!showAll && gameState.status === "playing" && <FeedbackBar feedback={feedback} placement="board" />}
  </section>;
}

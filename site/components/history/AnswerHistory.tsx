"use client";
import type { Category, HistoryEntry, TileState } from "@/types/game";
interface Props { history: HistoryEntry[]; categories: Category[]; tiles: Record<string, TileState>; onReport?: (id: string) => void; }
export function AnswerHistory({ history, categories, tiles, onReport }: Props) {
  return <section className="answer-history" aria-label="Answer history">
    <h2 className="mb-3">Previous Answers</h2>
    <ol className="history-matches" reversed>{[...history].reverse().map(entry => <li key={entry.moveNumber}>
      <span className="history-word"><span>{entry.answer}</span><small className="history-points" aria-label={`${entry.score} points earned`}>+{entry.score}</small></span>
      <div className="history-categories">{entry.tilesCleared.filter(id => !tiles[id]?.animating).map(id => <button type="button" key={id} className={`history-category tile-color-${((entry.moveNumber - 1) % 8) + 1}`} onClick={() => onReport?.(id)} title="Report this match">
        {categories.find(c => c.id === id)?.label ?? id}
      </button>)}
      {!entry.tilesCleared.length && <span className="history-miss">No match</span>}
      {entry.tilesCleared.some(id => tiles[id]?.animating) && <span className="history-miss">Popping…</span>}
      </div>
    </li>)}</ol>
  </section>;
}

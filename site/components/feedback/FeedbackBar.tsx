"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { SCORING_LEVELS } from "@/lib/scoring";
import type { FeedbackState } from "@/types/game";

interface FeedbackBarProps {
  feedback: FeedbackState;
  placement?: "inline" | "board";
}

export function FeedbackBar({ feedback, placement = "inline" }: FeedbackBarProps) {
  const count = feedback.type === "result" ? feedback.newlyCleared.length : 0;
  const rating = SCORING_LEVELS[count - 1];
  const duration = 1800 + Math.min(count, 12) * 180;
  const tier = count >= 9 ? "legendary" : count >= 6 ? "mega" : count >= 4 ? "great" : count === 3 ? "sweet" : count === 2 ? "pair" : "single";
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (feedback.type !== "result" || feedback.newlyCleared.length === 0) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [feedback, duration]);

  if (feedback.type === "result" && count > 0) {
    if (!visible || placement !== "board") return null;
    return <div className={`board-cheer tier-${tier}`} style={{ "--cheer-duration": `${duration}ms`, "--cheer-pop": 1.08 + Math.min(count, 12) * .035, "--letter-lift": `${3 + Math.min(count, 12)}px`, "--cheer-size": `${Math.min(60, 25 + count * 3)}px` } as CSSProperties} role="status" aria-live="polite" aria-atomic="true">

      {count >= 3 && <span className="cheer-halo" aria-hidden="true" />}
      {count >= 6 && <span className="cheer-halo halo-two" aria-hidden="true" />}
      {count >= 4 && <p className="cheer-kicker">{count >= 9 ? "What a bunch!" : count >= 6 ? "Un-bunch-lievable!" : "Big bunch!"}</p>}
      <p className="match-cheer" aria-label={rating?.name}><span className="cheer-juice" aria-hidden="true">{Array.from({ length: Math.min(12, 3 + count) }, (_, index) => {
        const angle = Math.PI + .3 + index / (Math.min(12, 3 + count) - 1) * (Math.PI - .6);
        return <i key={index} style={{ "--squirt-x": `${Math.cos(angle) * (30 + Math.min(count, 12) * 5)}px`, "--squirt-y": `${Math.sin(angle) * (40 + Math.min(count, 12) * 4)}px`, "--squirt-delay": `${60 + index % 3 * 35}ms`, "--squirt-size": `${5 + index % 3 * 2}px` } as CSSProperties} />;
      })}</span>{Array.from(rating?.name ?? "").map((letter, index) => <span key={index} aria-hidden="true" style={{ "--letter-delay": `${index * 18}ms`, "--letter-tilt": `${index % 2 ? 7 : -7}deg` } as CSSProperties}>{letter === " " ? "\u00a0" : letter}</span>)}</p>
      <span className="cheer-swish" aria-hidden="true" />
      <p className="match-detail">{count} categor{count === 1 ? "y" : "ies"} · <strong className="cheer-points">+{feedback.moveScore}</strong> points</p>
    </div>;
  }
  if (placement === "board" || feedback.type === "idle") return null;

  return (
    <div className="feedback-slot" role="status" aria-live="polite" aria-atomic="true">
      {feedback.type === "loading" && <p className="checking-feedback">Finding connections<span className="thinking-dots" aria-hidden="true">···</span></p>}
      {feedback.type === "result" && <p className="quiet-feedback">{feedback.message}</p>}
      {(feedback.type === "duplicate" || feedback.type === "retry" || feedback.type === "error") && (
        <div className="error-feedback">
          <p>{feedback.message}</p>
          {feedback.type === "retry" && <p className="match-detail">This won't count as a move.</p>}
        </div>
      )}
    </div>
  );
}

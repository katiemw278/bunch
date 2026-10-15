"use client";

import { useEffect, useRef } from "react";
import type { FeedbackState } from "@/types/game";

interface FeedbackBarProps {
  feedback: FeedbackState;
  onDismiss: () => void;
}

const BUNCH_LABELS: Record<string, string> = {
  miss: "",
  single: "",
  pair: "Pair",
  triple: "Triple",
  quad: "Quad",
  super: "Super bunch",
  perfect: "Perfect",
};

export function FeedbackBar({ feedback, onDismiss }: FeedbackBarProps) {
  const liveRef = useRef<HTMLDivElement>(null);

  // Announce to screen readers on change
  useEffect(() => {
    if (feedback.type !== "idle" && feedback.type !== "loading" && liveRef.current) {
      // Force re-announcement by briefly clearing
      liveRef.current.textContent = "";
      setTimeout(() => {
        if (liveRef.current && "message" in feedback) {
          liveRef.current.textContent = feedback.message;
        }
      }, 50);
    }
  }, [feedback]);

  // Auto-dismiss successful results after 4s
  useEffect(() => {
    if (feedback.type === "result") {
      const t = setTimeout(onDismiss, 4000);
      return () => clearTimeout(t);
    }
  }, [feedback, onDismiss]);

  const isLarge = feedback.type === "result" && 
    (feedback.label === "quad" || feedback.label === "super" || feedback.label === "perfect");

  return (
    <>
      {/* Screen reader live region */}
      <div
        ref={liveRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Visual feedback bar */}
      <div
        className="min-h-[44px] flex items-center justify-center"
        aria-hidden="true"
      >
        {feedback.type === "loading" && (
          <p className="text-sm text-[#888] italic">Checking "{feedback.answer}"…</p>
        )}

        {feedback.type === "idle" && (
          <p className="text-sm text-[#b8b2a8]">Submit an answer to match categories.</p>
        )}

        {feedback.type === "result" && (
          <div className={`text-center animate-slide-up ${isLarge ? "celebrate" : ""}`}>
            {BUNCH_LABELS[feedback.label] && (
              <span className="block text-xs font-semibold uppercase tracking-widest text-[#888] mb-0.5">
                {BUNCH_LABELS[feedback.label]}
              </span>
            )}
            <p className={[
              "font-medium",
              feedback.label === "miss" ? "text-[#888] text-sm" : "text-[#2c2c2c] text-[15px]",
            ].join(" ")}>
              {feedback.message}
            </p>
            {feedback.moveScore > 0 && (
              <span className="text-xs text-[#888] mt-0.5 block">
                +{feedback.moveScore} point{feedback.moveScore !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {(feedback.type === "duplicate" || feedback.type === "retry" || feedback.type === "error") && (
          <div className="text-center animate-slide-up">
            <p className="text-sm text-[#c05c3c] font-medium">{feedback.message}</p>
            {feedback.type === "retry" && (
              <p className="text-xs text-[#888] mt-0.5">This won't count as a move.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

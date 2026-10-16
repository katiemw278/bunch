"use client";

import { useState, useRef, useEffect } from "react";
import type { FeedbackState } from "@/types/game";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  canSubmit?: boolean;
  onSelectionRequired?: () => void;
  isSubmitting: boolean;
  isDisabled: boolean;
  feedback: FeedbackState;
}

export function AnswerInput({ onSubmit, isSubmitting, isDisabled, feedback, canSubmit = true, onSelectionRequired }: AnswerInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldShake = feedback.type === "duplicate" || feedback.type === "error";

  // Clear input after a successful result
  useEffect(() => {
    if (feedback.type === "result") {
      setValue("");
      // Return focus to input for quick next entry
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [feedback]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isSubmitting || isDisabled) return;
    if (!canSubmit) { onSelectionRequired?.(); return; }
    onSubmit(trimmed);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="answer-form flex gap-2"
      aria-label="Answer submission"
    >
      <div className="flex-1 relative">
        <label htmlFor="answer-input" className="sr-only">
          Your answer
        </label>
        <input
          ref={inputRef}
          id="answer-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isSubmitting || isDisabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Type here..."
          maxLength={80}
          className={[
            "answer-field w-full px-4 py-3 rounded-lg border text-[15px] font-medium",
            "bg-white text-[#2c2c2c] placeholder-[#b8b2a8]",
            "transition-all duration-150",
            isDisabled || isSubmitting
              ? "opacity-50 cursor-not-allowed border-[#d8d2c8]"
              : "border-[#d8d2c8] hover:border-[#b8b2a8]",
            shouldShake ? "animate-shake" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-describedby="input-status"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isDisabled || !value.trim()}
        className={[
          "answer-submit px-5 py-3 rounded-lg font-semibold text-[15px]",
          "transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-[#2c2c2c] focus:ring-offset-2",
          isSubmitting || isDisabled || !value.trim()
            ? "bg-[#d8d2c8] text-[#a8a2a0] cursor-not-allowed"
            : "bg-[#2c2c2c] text-[#faf9f7] hover:bg-[#1a1a1a] active:scale-95",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={isSubmitting ? "Checking answer…" : "Submit answer"}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Spinner />
            <span>Checking</span>
          </span>
        ) : (
          "Bunch it!"
        )}
      </button>
    </form>
  );
}

function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

"use client";

import { useEffect, useRef } from "react";

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus trap and close on Escape
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();

      // Basic focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first)?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      prev?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2c2c2c]/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative bg-white rounded-xl border border-[#d8d2c8] max-w-sm w-full p-6 space-y-4 shadow-lg animate-slide-up"
      >
        <div className="flex items-start justify-between">
          <h2 id="help-title" className="font-display text-xl font-bold">
            How to play
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            className="text-[#888] hover:text-[#2c2c2c] transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-[#2c2c2c]"
            aria-label="Close help"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-sm text-[#2c2c2c] leading-relaxed">
          <p>
            The board has <strong>9 category tiles</strong>. Submit words or phrases that fit
            one or more categories to clear them.
          </p>

          <div className="space-y-1.5">
            <p className="font-semibold">Rules</p>
            <ul className="space-y-1 pl-4 list-disc marker:text-[#888]">
              <li>You have <strong>8 moves</strong> to clear all 9 tiles.</li>
              <li>Clear all 9 to win. Unused moves after the board is clear don't matter.</li>
              <li>Any valid submission uses a move — even a miss.</li>
              <li>Duplicate answers (and simple plurals) don't use a move.</li>
              <li>An answer can match different tiles using different meanings.</li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <p className="font-semibold">Scoring</p>
            <p>
              Points are <em>triangular</em> — clearing more tiles in one move earns
              disproportionately more points. A 3-tile answer scores 6; a 4-tile answer scores 10.
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-semibold">Bunches</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5 pl-0 text-xs text-[#888]">
              <li>1 tile — Single</li>
              <li>2 tiles — Pair</li>
              <li>3 tiles — Triple</li>
              <li>4 tiles — Quad</li>
              <li>5–8 tiles — Super</li>
              <li>9 tiles — Perfect</li>
            </ul>
          </div>

          <div className="rounded-lg bg-[#f5f2ee] p-3 text-xs text-[#666]">
            <strong>Example:</strong> If the board has "Something yellow," "Something edible,"
            and "Grows on a tree" — submitting <em>lemon</em> clears all three at once.
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-[#2c2c2c] text-[#faf9f7] font-semibold text-[15px] hover:bg-[#1a1a1a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2c2c2c] focus:ring-offset-2"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

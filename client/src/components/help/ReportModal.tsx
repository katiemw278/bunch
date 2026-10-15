"use client";

import { useEffect, useRef, useState } from "react";
import { reportRuling } from "@/lib/api";

interface ReportModalProps {
  puzzleId: string;
  answer: string;
  categoryId: string;
  categoryLabel: string;
  onClose: () => void;
}

export function ReportModal({
  puzzleId,
  answer,
  categoryId,
  categoryLabel,
  onClose,
}: ReportModalProps) {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, textarea, [tabindex]:not([tabindex="-1"])'
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await reportRuling({ puzzleId, answer, categoryId, note: note.trim() || undefined });
      setStatus("sent");
      setTimeout(onClose, 1800);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
    >
      <div className="absolute inset-0 bg-[#2c2c2c]/40" onClick={onClose} aria-hidden="true" />

      <div
        ref={dialogRef}
        className="relative bg-white rounded-xl border border-[#d8d2c8] max-w-sm w-full p-6 space-y-4 shadow-lg animate-slide-up"
      >
        <div className="flex items-start justify-between">
          <h2 id="report-title" className="font-display text-lg font-bold">
            Report a ruling
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            className="text-[#888] hover:text-[#2c2c2c] transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-[#2c2c2c]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-[#666]">
          You're reporting that{" "}
          <strong className="text-[#2c2c2c]">"{answer}"</strong> was incorrectly judged
          for <strong className="text-[#2c2c2c]">"{categoryLabel}"</strong>.
        </p>

        {status === "sent" ? (
          <p className="text-sm text-[#2c6e44] font-medium py-2">
            ✓ Thanks — we'll review this ruling.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="report-note" className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-1">
                Optional note
              </label>
              <textarea
                id="report-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Why do you think this ruling is wrong?"
                rows={3}
                maxLength={400}
                className="w-full px-3 py-2 rounded-lg border border-[#d8d2c8] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2c2c2c]"
              />
            </div>

            {status === "error" && (
              <p className="text-xs text-[#c05c3c]">Something went wrong. Please try again.</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-lg border border-[#d8d2c8] text-sm font-medium text-[#666] hover:bg-[#f5f2ee] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2c2c2c]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "sending"}
                className="flex-1 py-2 rounded-lg bg-[#2c2c2c] text-[#faf9f7] text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2c2c2c] focus:ring-offset-2"
              >
                {status === "sending" ? "Sending…" : "Send report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

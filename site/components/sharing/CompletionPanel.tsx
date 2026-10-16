"use client";

import { useEffect, useRef, useState } from "react";
import type { GameState } from "@/types/game";
import { lockModalViewport } from "@/lib/modal-scroll";
import { buildShareText, copyToClipboard } from "@/lib/sharing";
import { getFinishHeadline } from "@/lib/scoring";
import { BunchBuddy } from "@/components/brand/BunchBuddy";

interface CompletionPanelProps {
  gameState: GameState;
  categoryIds: string[];
  puzzleNumber: number;
  open: boolean;
  onClose: () => void;
}


export function CompletionPanel({ gameState, categoryIds, puzzleNumber, open, onClose }: CompletionPanelProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { status, moveCount, score, history } = gameState;
  const won = status === "won";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }
    const viewport = lockModalViewport();
    if (!dialog.open) dialog.showModal();
    viewport.restorePosition();
    return () => {
      if (dialog.open) dialog.close();
      viewport.release();
    };
  }, [open]);

  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);

  async function handleCopy() {
    const result = await copyToClipboard(buildShareText(gameState, categoryIds, puzzleNumber));
    if (copyTimer.current) clearTimeout(copyTimer.current);
    setCopyState(result.success ? "copied" : "failed");
    if (result.success) copyTimer.current = setTimeout(() => setCopyState("idle"), 2500);
  }

  return (
    <dialog ref={dialogRef} className="results-dialog" aria-labelledby="results-title"
      onCancel={(e) => { e.preventDefault(); onClose(); }} onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) {
        const box = e.currentTarget.getBoundingClientRect();
        if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) onClose();
      } }}>
      <div className="results-content">
        <button type="button" className="results-close" onClick={onClose} aria-label="Close results">×</button>
        <p className="results-kicker">Bunch · #{puzzleNumber}</p>
        <div className={`results-mascot ${won ? "is-happy" : ""}`}><BunchBuddy happy={won} /></div>
        <h2 id="results-title">{won ? getFinishHeadline(moveCount) : "A little unbunched."}</h2>
        <div className="results-score"><strong>{score}</strong><span>final score</span></div>
        <div className="results-facts"><span>{moveCount} move{moveCount === 1 ? "" : "s"}</span></div>
        <button type="button" className="copy-result-button" onClick={handleCopy}>
          {copyState === "copied" ? "Copied! ✓" : copyState === "failed" ? "Try copying again" : "Copy result ↗"}
        </button>
        <p className="copy-status" role="status" aria-live="polite">{copyState === "copied" ? "Ready for the group chat." : copyState === "failed" ? "Copy failed. You can select the text below." : "A fresh bunch every day."}</p>
        {copyState === "failed" && <pre tabIndex={0} className="manual-share-text">{buildShareText(gameState, categoryIds, puzzleNumber)}</pre>}
        <button type="button" className="back-to-board" onClick={onClose}>Back to my board</button>
      </div>
    </dialog>
  );
}

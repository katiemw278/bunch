"use client";

import { useEffect, useRef, useState } from "react";
import { lockModalViewport } from "@/lib/modal-scroll";
import { SCORING_LEVELS } from "@/lib/scoring";
import { GrapeMark } from "@/components/brand/GrapeMark";

export function HelpModal({ onClose, totalCategories }: { onClose: () => void; totalCategories?: number }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [section, setSection] = useState<"play" | "ratings">("play");
  useEffect(() => {
    const viewport = lockModalViewport();
    const dialog = ref.current;
    dialog?.showModal();
    viewport.restorePosition();
    return () => {
      dialog?.close();
      viewport.release();
    };
  }, []);
  return <dialog ref={ref} className="results-dialog help-dialog" aria-labelledby="help-title"
    onCancel={e => { e.preventDefault(); onClose(); }}
    onClick={e => { if (e.target === e.currentTarget) {
      const box = e.currentTarget.getBoundingClientRect();
      if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) onClose();
    } }}>
    <div className="results-content help-content">
      <button type="button" className="results-close" aria-label="Close help" onClick={onClose}>×</button>
      <div className="help-grapes"><GrapeMark /></div>
      <h2 id="help-title">Make a buncha bunches!</h2>
      <div className="guide-switch" aria-label="Guide sections">
        <button type="button" aria-pressed={section === "play"} aria-controls="guide-content" onClick={() => setSection("play")}>How to Play</button>
        <button type="button" aria-pressed={section === "ratings"} aria-controls="guide-content" onClick={() => setSection("ratings")}>Points</button>
      </div>
      <div id="guide-content">
        {section === "play" ? <>
          <ol className="play-steps">
            <li><strong>Type a word.</strong><span>Pick a word that applies to as many categories as possible.</span></li>
            <li><strong>Pick its categories.</strong><span>Tap all the cards it connects to. Any meaning counts.</span></li>
            <li><strong>Bunch it!</strong><span>Press Enter to check your picks. Clear all {totalCategories ?? "the"} cards; bigger bunches score more.</span></li>
          </ol>
        </> : <table className="scoring-table">
          <caption>Points per bunch</caption>
          <thead><tr><th scope="col">Bunch size</th><th scope="col">Points</th></tr></thead>
          <tbody>{SCORING_LEVELS.slice(0, totalCategories ?? 16).map(level => <tr key={level.count}><td>{level.count}</td><td>{level.points}</td></tr>)}</tbody>
        </table>}
      </div>
      <button type="button" className="copy-result-button" onClick={onClose}>Grape, got it!</button>
    </div>
  </dialog>;
}

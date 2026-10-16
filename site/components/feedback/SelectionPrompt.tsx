"use client";
import { useEffect, useState } from "react";
export function SelectionPrompt() {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const timer = setTimeout(() => setVisible(false), 2600); return () => clearTimeout(timer); }, []);
  if (!visible) return null;
  return <div className="selection-prompt" role="alert">Select the categories your word applies to.</div>;
}

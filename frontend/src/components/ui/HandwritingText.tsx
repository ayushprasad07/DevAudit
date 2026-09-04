"use client";

import { useEffect, useState } from "react";

type HandwritingTextProps = { text: string };

/** Draws the hero's decisive phrase as an animated, inked signature. */
export default function HandwritingText({ text }: HandwritingTextProps) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const frame = requestAnimationFrame(() => setDrawn(true)); return () => cancelAnimationFrame(frame); }, []);
  return <span className={`handwriting ${drawn ? "is-drawn" : ""}`} aria-label={text}>{text}</span>;
}

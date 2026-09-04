"use client";

import { type PointerEvent, type ReactNode, useRef } from "react";

type ThreeDCardProps = {
  children: ReactNode;
  className?: string;
};

/** A lightweight shadcn-style card primitive with pointer-driven depth. */
export default function ThreeDCard({ children, className = "" }: ThreeDCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function updateTilt(event: PointerEvent<HTMLDivElement>) {
    const card = ref.current;
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.setProperty("--card-x", `${x * 9}deg`);
    card.style.setProperty("--card-y", `${y * -9}deg`);
    card.style.setProperty("--glow-x", `${(x + 0.5) * 100}%`);
    card.style.setProperty("--glow-y", `${(y + 0.5) * 100}%`);
  }

  function resetTilt() {
    const card = ref.current;
    if (!card) return;
    card.style.setProperty("--card-x", "0deg");
    card.style.setProperty("--card-y", "0deg");
  }

  return <div ref={ref} className={`three-d-card ${className}`} onPointerMove={updateTilt} onPointerLeave={resetTilt}>{children}</div>;
}

"use client";

import { useEffect, useState } from "react";

const WORDS = [
  "dependencies.",
  "license risk.",
  "exposed secrets.",
  "breaking changes.",
  "vulnerabilities.",
];

const INTERVAL_MS = 2400;

export default function HandwritingText() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      const swap = setTimeout(() => {
        setIndex((prev) => (prev + 1) % WORDS.length);
        setVisible(true);
      }, 250);
      return () => clearTimeout(swap);
    }, INTERVAL_MS);
    return () => clearInterval(cycle);
  }, []);

  return (
    <span
      className="relative inline-block min-w-[11ch] align-baseline"
      aria-live="polite"
    >
      <span
        className={`inline-block text-4xl font-bold text-orange-400 transition-all duration-300 ease-out sm:text-5xl ${
          visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
      >
        {WORDS[index]}
      </span>
    </span>
  );
}
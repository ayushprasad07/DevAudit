"use client";

import React, { useEffect, useState } from "react";

export default function Terminal() {
  const [text, setText] = useState("");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lines = [
      "> resolving dependency tree...",
      "> cross-referencing SPDX identifiers...",
      "> flagged 2 copyleft risks in api-gateway",
      "> report ready — 41 packages scanned",
    ];

    if (reduceMotion) {
      setText(lines[lines.length - 1]);
      return;
    }

    let li = 0;
    let ci = 0;
    let deleting = false;
    let timeoutId: any;

    function tick() {
      const full = lines[li];
      if (!deleting) {
        ci++;
        setText(full.slice(0, ci));
        if (ci === full.length) {
          deleting = true;
          timeoutId = setTimeout(tick, 1400);
          return;
        }
      } else {
        ci--;
        setText(full.slice(0, ci));
        if (ci === 0) {
          deleting = false;
          li = (li + 1) % lines.length;
        }
      }
      timeoutId = setTimeout(tick, deleting ? 18 : 32);
    }

    tick();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="term" id="term">
      <span id="term-text">{text}</span>
      <span className="cursor"></span>
    </div>
  );
}

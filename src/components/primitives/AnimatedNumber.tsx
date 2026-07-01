"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Counts up to `value`, easing from whatever it currently shows (0 on mount).
 * Uses requestAnimationFrame rather than animating per-character DOM, so it
 * stays cheap even with many on screen. Honors reduced-motion by jumping
 * straight to the value.
 */
export function AnimatedNumber({
  value,
  format,
  durationMs = 850,
}: {
  value: number;
  format: (n: number) => string;
  durationMs?: number;
}) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);
  // Last animated value, tracked outside render so a new animation can ease
  // from wherever the previous one left off.
  const latest = useRef(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Reduced motion renders `value` directly (below), so nothing to animate.
    if (reduceMotion) return;
    const from = latest.current;
    if (from === value) return;

    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const current = from + (value - from) * eased;
      latest.current = current;
      setDisplay(current);
      if (t < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, durationMs, reduceMotion]);

  return (
    <span className="tabular-nums">
      {format(reduceMotion ? value : display)}
    </span>
  );
}

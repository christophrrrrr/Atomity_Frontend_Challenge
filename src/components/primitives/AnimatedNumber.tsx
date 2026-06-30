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
  const [display, setDisplay] = useState(reduceMotion ? value : 0);
  const displayRef = useRef(display);
  displayRef.current = display;
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const from = displayRef.current;
    if (from === value) return;

    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(from + (value - from) * eased);
      if (t < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, durationMs, reduceMotion]);

  return <span className="tabular-nums">{format(display)}</span>;
}

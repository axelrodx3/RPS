"use client";

import { useEffect, useRef, useState } from "react";

type UseCountUpAnimationOptions = {
  target: number;
  active: boolean;
  reducedMotion: boolean;
  durationMs?: number;
};

export function useCountUpAnimation({
  target,
  active,
  reducedMotion,
  durationMs = 900,
}: UseCountUpAnimationOptions): number {
  const [animatedValue, setAnimatedValue] = useState(0);
  const playedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      playedRef.current = false;
      return undefined;
    }

    if (reducedMotion || playedRef.current) {
      return undefined;
    }

    playedRef.current = true;
    if (target <= 0) {
      const resetTimer = window.setTimeout(() => setAnimatedValue(0), 0);
      return () => window.clearTimeout(resetTimer);
    }

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setAnimatedValue(Math.round(target * eased));
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [active, durationMs, reducedMotion, target]);

  if (!active) return 0;
  if (reducedMotion) return target;
  return animatedValue;
}

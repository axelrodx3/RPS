"use client";

import { useCallback, useRef } from "react";
import { useAudio } from "@/providers/AudioProvider";

function canPlayPointerHover(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/**
 * Subtle desktop pointer hover feedback. Does not run on touch or keyboard focus.
 */
export function useHoverSound(disabled = false) {
  const { play, unlock } = useAudio();
  const hoverCapableRef = useRef<boolean | null>(null);

  return useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (disabled) return;
      if (event.pointerType !== "mouse") return;

      if (hoverCapableRef.current === null) {
        hoverCapableRef.current = canPlayPointerHover();
      }
      if (!hoverCapableRef.current) return;

      unlock();
      play("ui_hover");
    },
    [disabled, play, unlock],
  );
}

export { canPlayPointerHover };

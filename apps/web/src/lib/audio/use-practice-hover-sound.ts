"use client";

import { useCallback, useRef } from "react";
import { useAudio } from "@/providers/AudioProvider";
import { canPlayPointerHover } from "@/lib/audio/use-hover-sound";

/**
 * Practice-only pointer hover feedback. Uses a dedicated asset so site-wide
 * hover sounds remain unchanged outside Practice mode.
 */
export function usePracticeHoverSound(disabled = false) {
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
      play("practice_hover");
    },
    [disabled, play, unlock],
  );
}

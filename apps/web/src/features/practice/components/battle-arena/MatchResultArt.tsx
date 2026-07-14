"use client";

import { PRACTICE_ASSET_SLOTS } from "@/features/practice/assets/practice-asset-slots";
import styles from "../practice-game.module.css";

type MatchResultArtProps = {
  variant: "victory" | "defeat";
  matchKey: string;
  reducedMotion: boolean;
};

export function MatchResultArt({
  variant,
  matchKey,
  reducedMotion,
}: MatchResultArtProps) {
  const slot =
    variant === "victory"
      ? PRACTICE_ASSET_SLOTS.victoryEffect
      : PRACTICE_ASSET_SLOTS.defeatEffect;

  if (!slot.path) {
    return null;
  }

  const artClass =
    variant === "victory"
      ? styles.matchResultArtVictory
      : styles.matchResultArtDefeat;

  if (reducedMotion) {
    return (
      <div
        className={`${styles.matchResultArt} ${artClass}`.trim()}
        aria-hidden="true"
      >
        <span className={styles.matchResultArtFallback}>{slot.fallback}</span>
      </div>
    );
  }

  return (
    <div
      className={`${styles.matchResultArt} ${artClass}`.trim()}
      aria-hidden="true"
    >
      <object
        key={`${variant}-${matchKey}`}
        className={styles.matchResultArtObject}
        data={slot.path}
        type="image/svg+xml"
        tabIndex={-1}
      />
    </div>
  );
}

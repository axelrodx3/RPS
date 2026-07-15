"use client";

import {
  ROUND_INTRO_MS,
  ROUND_INTRO_REDUCED_MS,
} from "@/features/practice/engine/practice-engine";
import styles from "../practice-game.module.css";

type RoundIntroOverlayProps = {
  label: string;
  reducedMotion: boolean;
  round: number;
};

export function RoundIntroOverlay({
  label,
  reducedMotion,
  round,
}: RoundIntroOverlayProps) {
  const durationMs = reducedMotion ? ROUND_INTRO_REDUCED_MS : ROUND_INTRO_MS;
  const overlayClass = [
    styles.roundIntroOverlay,
    reducedMotion ? styles.roundIntroReduced : styles.roundIntroEnter,
  ]
    .filter(Boolean)
    .join(" ");

  const labelClass = [
    styles.roundIntroLabel,
    reducedMotion ? styles.roundIntroLabelSettled : styles.roundIntroLabelEnter,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={overlayClass}
      style={{ ["--round-intro-duration" as string]: `${durationMs}ms` }}
      role="status"
      aria-live="polite"
      data-testid="round-intro-overlay"
      data-round={round}
    >
      <p className={labelClass}>{label}</p>
    </div>
  );
}

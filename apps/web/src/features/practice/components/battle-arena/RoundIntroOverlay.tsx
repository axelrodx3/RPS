"use client";

import styles from "../practice-game.module.css";

type RoundIntroOverlayProps = {
  label: string;
  reducedMotion: boolean;
};

export function RoundIntroOverlay({
  label,
  reducedMotion,
}: RoundIntroOverlayProps) {
  return (
    <div
      className={`${styles.roundIntroOverlay} ${reducedMotion ? styles.roundIntroReduced : styles.roundIntroEnter}`.trim()}
      role="status"
      aria-live="polite"
      data-testid="round-intro-overlay"
    >
      <p className={styles.roundIntroLabel}>{label}</p>
    </div>
  );
}

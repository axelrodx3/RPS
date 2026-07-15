"use client";

import { useId } from "react";
import styles from "./leaderboard-panel.module.css";

type LeaderboardPanelProps = {
  reducedMotion: boolean;
  variant?: "page" | "sidebar";
};

export function LeaderboardPanel({ variant = "page" }: LeaderboardPanelProps) {
  const baseId = useId();

  return (
    <section
      className={`${styles.panel} ${variant === "sidebar" ? styles.sidebar : styles.page}`.trim()}
      aria-labelledby={`${baseId}-page-title`}
      data-testid="leaderboard-panel"
    >
      <h1 id={`${baseId}-page-title`} className={styles.pageTitle}>
        LEADERBOARDS
      </h1>

      <div className={styles.leaderboardPlaceholder}>
        <span className={styles.placeholderBadge}>Coming soon</span>
        <p className={styles.placeholderCopy}>
          Global rankings will appear here when accounts and competitive play
          are available. Seasonal and ranked leaderboards arrive in later
          phases.
        </p>
      </div>
    </section>
  );
}

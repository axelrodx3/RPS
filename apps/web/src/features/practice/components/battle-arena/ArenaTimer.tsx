"use client";

import { TIMER_WARNING_SECONDS } from "@/features/practice/engine/practice-engine";
import styles from "../practice-game.module.css";

type ArenaTimerProps = {
  seconds: number;
  total: number;
  phaseLabel: string;
  active: boolean;
};

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function ArenaTimer({
  seconds,
  total,
  phaseLabel,
  active,
}: ArenaTimerProps) {
  const progress = active ? seconds / total : 0;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);
  const warning = active && seconds <= TIMER_WARNING_SECONDS;

  return (
    <div
      className={`${styles.arenaTimer} ${warning ? styles.arenaTimerWarning : ""}`.trim()}
      role={active ? "timer" : undefined}
      aria-label={
        active ? `${seconds} seconds remaining. ${phaseLabel}` : phaseLabel
      }
    >
      <svg
        className={styles.arenaTimerRing}
        viewBox="0 0 120 120"
        aria-hidden="true"
      >
        <circle
          className={styles.arenaTimerTrack}
          cx="60"
          cy="60"
          r={RING_RADIUS}
        />
        {active ? (
          <circle
            className={styles.arenaTimerProgress}
            cx="60"
            cy="60"
            r={RING_RADIUS}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        ) : null}
      </svg>
      <div className={styles.arenaTimerCore}>
        {active ? (
          <span className={styles.arenaTimerValue}>{seconds}</span>
        ) : (
          <span className={styles.arenaTimerPhase}>{phaseLabel}</span>
        )}
        {active ? (
          <span className={styles.arenaTimerLabel}>{phaseLabel}</span>
        ) : null}
      </div>
    </div>
  );
}

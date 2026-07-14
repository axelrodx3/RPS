"use client";

import { TIMER_WARNING_SECONDS } from "@/features/practice/engine/practice-engine";
import styles from "../practice-game.module.css";

export type ArenaCoreMode = "countdown" | "timer" | "phase" | "reveal";

type ArenaCoreProps = {
  mode: ArenaCoreMode;
  seconds: number;
  total: number;
  phaseLabel: string;
  subLabel?: string;
  countdown?: number;
  vsImpact?: boolean;
};

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function ArenaCore({
  mode,
  seconds,
  total,
  phaseLabel,
  subLabel,
  countdown = 0,
  vsImpact = false,
}: ArenaCoreProps) {
  const showProgress = mode === "timer";
  const progress = showProgress ? seconds / total : 0;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);
  const warning = showProgress && seconds <= TIMER_WARNING_SECONDS;
  const revealActive = mode === "reveal";

  return (
    <div
      className={`${styles.arenaCore} ${warning ? styles.arenaTimerWarning : ""} ${revealActive ? styles.arenaCoreReveal : ""} ${vsImpact ? styles.arenaCoreVsImpact : ""}`.trim()}
      role={showProgress ? "timer" : undefined}
      aria-label={
        showProgress
          ? `${seconds} seconds remaining. ${phaseLabel}`
          : subLabel
            ? `${phaseLabel}. ${subLabel}`
            : phaseLabel
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
        {showProgress ? (
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
        {mode === "countdown" ? (
          <strong className={styles.arenaCountdownValue}>
            {countdown || "Go"}
          </strong>
        ) : null}

        {mode === "timer" ? (
          <span className={styles.arenaTimerValue}>{seconds}</span>
        ) : null}

        {mode === "reveal" ? (
          <span className={styles.arenaCoreVs} aria-hidden="true">
            VS
          </span>
        ) : null}

        {mode === "phase" ? (
          <span className={styles.arenaCorePhase}>{phaseLabel}</span>
        ) : null}

        {mode === "timer" ? (
          <span className={styles.arenaTimerLabel}>{phaseLabel}</span>
        ) : null}

        {mode === "reveal" || mode === "phase" ? (
          <span className={styles.arenaCoreSubLabel}>
            {subLabel ?? (mode === "reveal" ? phaseLabel : "")}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** @deprecated Use ArenaCore — kept for import stability within the arena module. */
export const ArenaTimer = ArenaCore;

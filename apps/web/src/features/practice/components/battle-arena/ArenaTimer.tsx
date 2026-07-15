"use client";

import { TIMER_WARNING_SECONDS } from "@/features/practice/engine/practice-engine";
import type { ArenaCoreVisualState } from "@/features/practice/utils/arena-core-state";
import styles from "../practice-game.module.css";

export type { ArenaCoreVisualState };

type ArenaCoreProps = {
  visualState: ArenaCoreVisualState;
  seconds: number;
  total: number;
  phaseLabel: string;
  countdown?: number;
  vsImpact?: boolean;
  primaryLabel?: string | null;
  secondaryLabel?: string | null;
  outcomeAnimationKey?: string;
  reducedMotion?: boolean;
  accessibleLabel?: string;
};

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ArenaCheckMark({ animate }: { animate: boolean }) {
  return (
    <svg
      className={`${styles.arenaCoreMark} ${styles.arenaCoreCheck} ${animate ? styles.arenaCoreCheckDraw : styles.arenaCoreCheckStatic}`.trim()}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        className={styles.arenaCoreCheckPath}
        d="M5 13l4 4L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function ArenaLossMark({ animate }: { animate: boolean }) {
  return (
    <svg
      className={`${styles.arenaCoreMark} ${styles.arenaCoreLossMark} ${animate ? styles.arenaCoreLossEnter : styles.arenaCoreLossStatic}`.trim()}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M7 7l10 10M17 7L7 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

function ArenaTieMark({ animate }: { animate: boolean }) {
  return (
    <span
      className={`${styles.arenaCoreTieMark} ${animate ? styles.arenaCoreTiePulse : styles.arenaCoreTieStatic}`.trim()}
      aria-hidden="true"
    >
      =
    </span>
  );
}

export function ArenaCore({
  visualState,
  seconds,
  total,
  phaseLabel,
  countdown = 0,
  vsImpact = false,
  primaryLabel = null,
  secondaryLabel = null,
  outcomeAnimationKey = "",
  reducedMotion = false,
  accessibleLabel,
}: ArenaCoreProps) {
  const showProgress = visualState === "selecting";
  const progress = showProgress ? seconds / total : 0;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);
  const warning =
    showProgress && seconds <= TIMER_WARNING_SECONDS && seconds > 0;
  const urgencyClass =
    warning && seconds === 1
      ? styles.arenaTimerUrgent
      : warning && seconds === 2
        ? styles.arenaTimerHigh
        : warning
          ? styles.arenaTimerWarning
          : "";

  const revealActive =
    visualState === "vs_reveal" ||
    visualState === "player_round_win" ||
    visualState === "cpu_round_win" ||
    visualState === "tie";

  const outcomeActive =
    visualState === "player_round_win" ||
    visualState === "cpu_round_win" ||
    visualState === "tie";

  const outcomeClass =
    visualState === "player_round_win"
      ? styles.arenaCoreWin
      : visualState === "cpu_round_win"
        ? styles.arenaCoreLoss
        : visualState === "tie"
          ? styles.arenaCoreTieState
          : "";

  const animateOutcome = outcomeActive && !reducedMotion;

  const ariaLabel =
    accessibleLabel ??
    (showProgress
      ? warning
        ? `${seconds} seconds remaining. Choose now. ${phaseLabel}`
        : `${seconds} seconds remaining. ${phaseLabel}`
      : phaseLabel);

  return (
    <div
      className={`${styles.arenaCore} ${urgencyClass} ${revealActive ? styles.arenaCoreReveal : ""} ${vsImpact ? styles.arenaCoreVsImpact : ""} ${outcomeClass}`.trim()}
      data-visual-state={visualState}
      role={showProgress ? "timer" : outcomeActive ? "status" : undefined}
      aria-label={ariaLabel}
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
        {visualState === "countdown" ? (
          <strong className={styles.arenaCountdownValue}>
            {countdown || "Go"}
          </strong>
        ) : null}

        {visualState === "selecting" ? (
          <>
            <span
              className={`${styles.arenaTimerValue} ${warning ? styles.arenaTimerValueWarning : ""}`.trim()}
            >
              {seconds}
            </span>
            <span className={styles.arenaTimerLabel}>
              {warning ? "Choose now" : phaseLabel}
            </span>
          </>
        ) : null}

        {visualState === "phase" ? (
          <span className={styles.arenaCorePhase}>{phaseLabel}</span>
        ) : null}

        {visualState === "vs_reveal" ? (
          <span className={styles.arenaCoreVs} aria-hidden="true">
            VS
          </span>
        ) : null}

        {visualState === "player_round_win" ? (
          <div
            key={outcomeAnimationKey}
            className={styles.arenaCoreOutcomeStack}
          >
            <ArenaCheckMark animate={animateOutcome} />
            {primaryLabel ? (
              <span className={styles.arenaCorePrimaryLabel}>
                {primaryLabel}
              </span>
            ) : null}
            {secondaryLabel ? (
              <span className={styles.arenaCoreSecondaryLabel}>
                {secondaryLabel}
              </span>
            ) : null}
          </div>
        ) : null}

        {visualState === "cpu_round_win" ? (
          <div
            key={outcomeAnimationKey}
            className={styles.arenaCoreOutcomeStack}
          >
            <ArenaLossMark animate={animateOutcome} />
            {primaryLabel ? (
              <span className={styles.arenaCorePrimaryLabel}>
                {primaryLabel}
              </span>
            ) : null}
            {secondaryLabel ? (
              <span className={styles.arenaCoreSecondaryLabel}>
                {secondaryLabel}
              </span>
            ) : null}
          </div>
        ) : null}

        {visualState === "tie" ? (
          <div
            key={outcomeAnimationKey}
            className={styles.arenaCoreOutcomeStack}
          >
            <ArenaTieMark animate={animateOutcome} />
            {primaryLabel ? (
              <span className={styles.arenaCorePrimaryLabel}>
                {primaryLabel}
              </span>
            ) : null}
            {secondaryLabel ? (
              <span className={styles.arenaCoreSecondaryLabel}>
                {secondaryLabel}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** @deprecated Use ArenaCore — kept for import stability within the arena module. */
export const ArenaTimer = ArenaCore;

/** @deprecated Use ArenaCoreVisualState */
export type ArenaCoreMode = ArenaCoreVisualState;

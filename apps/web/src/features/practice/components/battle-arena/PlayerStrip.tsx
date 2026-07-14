"use client";

import { PRACTICE_ASSET_SLOTS } from "@/features/practice/assets/practice-asset-slots";
import styles from "../practice-game.module.css";

type PlayerStripProps = {
  playerScore: number;
  cpuScore: number;
  round: number;
  winTarget: number;
  phaseLabel: string;
  playerScorePulse: boolean;
  cpuScorePulse: boolean;
};

function WinMarkers({
  score,
  winTarget,
  side,
}: {
  score: number;
  winTarget: number;
  side: "player" | "cpu";
}) {
  return (
    <div className={styles.winMarkers} aria-hidden="true" data-side={side}>
      {Array.from({ length: winTarget }, (_, index) => (
        <span
          key={index}
          className={
            index < score ? styles.winMarkerFilled : styles.winMarkerEmpty
          }
        />
      ))}
    </div>
  );
}

function isMatchPoint(
  score: number,
  opponentScore: number,
  winTarget: number,
): boolean {
  return score === winTarget - 1 && opponentScore < winTarget - 1;
}

export function PlayerStrip({
  playerScore,
  cpuScore,
  round,
  winTarget,
  phaseLabel,
  playerScorePulse,
  cpuScorePulse,
}: PlayerStripProps) {
  const showMatchPoint =
    isMatchPoint(playerScore, cpuScore, winTarget) ||
    isMatchPoint(cpuScore, playerScore, winTarget);

  return (
    <header className={styles.playerStrip} aria-label="Match scoreboard">
      <div className={styles.stripSide}>
        <div className={styles.stripIdentity}>
          <div className={styles.playerAvatar} aria-hidden="true">
            {PRACTICE_ASSET_SLOTS.playerAvatar.fallback}
          </div>
          <div className={styles.stripMeta}>
            <span className={styles.stripLabel}>YOU</span>
            <span className={styles.srOnly}>Score {playerScore}</span>
            <strong
              className={`${styles.stripScore} ${playerScorePulse ? styles.scorePulse : ""}`.trim()}
              aria-hidden="true"
            >
              {playerScore}
            </strong>
          </div>
        </div>
        <WinMarkers score={playerScore} winTarget={winTarget} side="player" />
      </div>

      <div className={styles.stripCenter}>
        <span className={styles.stripRound}>ROUND {round}</span>
        <span className={styles.stripPhase}>{phaseLabel}</span>
        {showMatchPoint ? (
          <span className={styles.matchPointBadge}>Match point</span>
        ) : null}
      </div>

      <div className={`${styles.stripSide} ${styles.stripSideCpu}`.trim()}>
        <WinMarkers score={cpuScore} winTarget={winTarget} side="cpu" />
        <div className={styles.stripIdentity}>
          <div className={styles.stripMeta}>
            <span className={styles.stripLabel}>CPU</span>
            <span className={styles.srOnly}>Score {cpuScore}</span>
            <strong
              className={`${styles.stripScore} ${cpuScorePulse ? styles.scorePulse : ""}`.trim()}
              aria-hidden="true"
            >
              {cpuScore}
            </strong>
          </div>
          <div className={styles.cpuAvatar} aria-hidden="true">
            {PRACTICE_ASSET_SLOTS.cpuAvatar.fallback}
          </div>
        </div>
      </div>
    </header>
  );
}

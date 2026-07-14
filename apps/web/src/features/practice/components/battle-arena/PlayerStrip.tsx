"use client";

import { BotAvatar } from "@/features/identity/components/BotAvatar";
import { PlayerAvatar } from "@/features/identity/components/PlayerAvatar";
import { getMatchPointLabel } from "@/features/practice/utils/match-point-label";
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

export function PlayerStrip({
  playerScore,
  cpuScore,
  round,
  winTarget,
  phaseLabel,
  playerScorePulse,
  cpuScorePulse,
}: PlayerStripProps) {
  const matchPointLabel = getMatchPointLabel(playerScore, cpuScore, winTarget);

  return (
    <header className={styles.playerStrip} aria-label="Match scoreboard">
      <div className={styles.stripSide}>
        <div className={styles.stripIdentity}>
          <PlayerAvatar />
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
        {matchPointLabel ? (
          <span className={styles.matchPointBadge}>{matchPointLabel}</span>
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
          <BotAvatar />
        </div>
      </div>
    </header>
  );
}

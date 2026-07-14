"use client";

import Link from "next/link";
import { Button } from "@/design-system/components";
import buttonStyles from "@/design-system/components/button.module.css";
import styles from "../practice-game.module.css";

type MatchCompletePanelProps = {
  matchWinner: "player" | "cpu";
  playerScore: number;
  cpuScore: number;
  tiedRounds: number;
  automaticMoves: number;
  onRematch: () => void;
};

export function MatchCompletePanel({
  matchWinner,
  playerScore,
  cpuScore,
  tiedRounds,
  automaticMoves,
  onRematch,
}: MatchCompletePanelProps) {
  const isVictory = matchWinner === "player";

  return (
    <div
      className={`${styles.matchComplete} ${isVictory ? styles.matchCompleteVictory : styles.matchCompleteDefeat}`.trim()}
      role="status"
    >
      <div className={styles.matchCompleteBody}>
        <p className={styles.matchCompleteKicker}>Match complete</p>
        <h2
          className={`${styles.matchCompleteTitle} ${
            isVictory ? styles.matchVictory : styles.matchDefeat
          }`.trim()}
        >
          {isVictory ? "VICTORY" : "DEFEAT"}
        </h2>
        <p className={styles.matchCompleteScore}>
          Final score {playerScore} – {cpuScore}
        </p>
        <p className={styles.matchCompleteMeta}>
          Tied rounds {tiedRounds} · Automatic moves {automaticMoves}
        </p>
      </div>
      <div className={styles.matchCompleteActions}>
        <Button
          size="lg"
          className={styles.matchActionButton}
          onClick={onRematch}
        >
          Rematch
        </Button>
        <Link
          href="/"
          className={`${buttonStyles.button} ${buttonStyles.secondary} ${buttonStyles.lg} ${styles.matchActionButton} ${styles.matchActionLink}`.trim()}
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

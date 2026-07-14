"use client";

import Link from "next/link";
import { Button } from "@/design-system/components";
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
      <div className={styles.matchCompleteActions}>
        <Button onClick={onRematch}>Rematch</Button>
        <Link href="/">
          <Button variant="secondary">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}

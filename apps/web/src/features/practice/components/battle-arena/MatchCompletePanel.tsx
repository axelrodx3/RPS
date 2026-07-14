"use client";

import Link from "next/link";
import { Button } from "@/design-system/components";
import buttonStyles from "@/design-system/components/button.module.css";
import { useHoverSound } from "@/lib/audio/use-hover-sound";
import { useSettings } from "@/providers/SettingsProvider";
import { MatchResultArt } from "./MatchResultArt";
import styles from "../practice-game.module.css";

type MatchCompletePanelProps = {
  matchWinner: "player" | "cpu";
  playerScore: number;
  cpuScore: number;
  tiedRounds: number;
  automaticMoves: number;
  matchKey: string;
  onRematch: () => void;
};

export function MatchCompletePanel({
  matchWinner,
  playerScore,
  cpuScore,
  tiedRounds,
  automaticMoves,
  matchKey,
  onRematch,
}: MatchCompletePanelProps) {
  const { settings } = useSettings();
  const isVictory = matchWinner === "player";
  const playHover = useHoverSound(false);
  const playHoverRematch = useHoverSound(false);

  return (
    <div
      className={`${styles.matchComplete} ${isVictory ? styles.matchCompleteVictory : styles.matchCompleteDefeat}`.trim()}
      role="status"
    >
      <div className={styles.matchCompleteBody}>
        <p className={styles.matchCompleteKicker}>Match complete</p>

        <div
          className={`${styles.matchCompleteHero} ${isVictory ? styles.matchCompleteHeroVictory : styles.matchCompleteHeroDefeat}`.trim()}
        >
          <h2
            className={`${styles.matchCompleteTitle} ${
              isVictory ? styles.matchVictory : styles.matchDefeat
            } ${!isVictory && !settings.reducedMotion ? styles.matchDefeatShake : ""}`.trim()}
          >
            {isVictory ? "VICTORY" : "DEFEAT"}
          </h2>
          <MatchResultArt
            variant={isVictory ? "victory" : "defeat"}
            matchKey={matchKey}
            reducedMotion={settings.reducedMotion}
          />
        </div>

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
          onPointerEnter={playHoverRematch}
        >
          Rematch
        </Button>
        <Link
          href="/"
          className={`${buttonStyles.button} ${buttonStyles.secondary} ${buttonStyles.lg} ${styles.matchActionButton} ${styles.matchActionLink}`.trim()}
          onPointerEnter={playHover}
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

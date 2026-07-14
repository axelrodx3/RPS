"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/design-system/components";
import buttonStyles from "@/design-system/components/button.module.css";
import {
  MATCH_RESULT_BACKGROUNDS,
  type MatchResultVariant,
} from "@/features/practice/assets/match-result-backgrounds";
import { useHoverSound } from "@/lib/audio/use-hover-sound";
import styles from "../practice-game.module.css";

export type CinematicResultScreenProps = {
  variant: MatchResultVariant;
  playerScore: number;
  cpuScore: number;
  tiedRounds: number;
  automaticMoves: number;
  matchKey: string;
  reducedMotion: boolean;
  onRematch: () => void;
};

export function CinematicResultScreen({
  variant,
  playerScore,
  cpuScore,
  tiedRounds,
  automaticMoves,
  matchKey,
  reducedMotion,
  onRematch,
}: CinematicResultScreenProps) {
  const isVictory = variant === "victory";
  const background = MATCH_RESULT_BACKGROUNDS[variant];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const playHover = useHoverSound(false);
  const playHoverRematch = useHoverSound(false);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [matchKey]);

  const panelClass = isVictory
    ? styles.cinematicResultVictory
    : styles.cinematicResultDefeat;
  const titleClass = isVictory ? styles.matchVictory : styles.matchDefeat;
  const titleMotionClass = reducedMotion
    ? ""
    : isVictory
      ? styles.matchVictoryImpact
      : styles.matchDefeatImpact;
  const backdropMotionClass = reducedMotion
    ? styles.cinematicResultBackdropStatic
    : "";

  return (
    <section
      className={`${styles.cinematicResult} ${panelClass}`.trim()}
      role="status"
      aria-labelledby={`match-result-heading-${matchKey}`}
      data-result-variant={variant}
    >
      <div
        className={`${styles.cinematicResultBackdrop} ${backdropMotionClass}`.trim()}
        aria-hidden="true"
      >
        <picture className={styles.cinematicResultPicture}>
          <source srcSet={background.webp} type="image/webp" />
          <img
            key={matchKey}
            className={styles.cinematicResultImage}
            src={background.png}
            alt=""
            decoding="async"
            loading="eager"
            style={
              {
                "--result-bg-position": background.objectPosition,
                "--result-bg-position-mobile": background.objectPositionMobile,
              } as React.CSSProperties
            }
          />
        </picture>
        <div className={styles.cinematicResultOverlay} />
        <div
          className={
            isVictory
              ? styles.cinematicResultGlowVictory
              : styles.cinematicResultGlowDefeat
          }
        />
      </div>

      <div className={styles.cinematicResultContent}>
        <p className={styles.matchCompleteKicker}>Match complete</p>

        <h2
          id={`match-result-heading-${matchKey}`}
          ref={headingRef}
          tabIndex={-1}
          className={`${styles.matchCompleteTitle} ${titleClass} ${titleMotionClass}`.trim()}
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
    </section>
  );
}

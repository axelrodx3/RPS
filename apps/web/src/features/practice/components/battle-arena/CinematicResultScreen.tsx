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

function ResultBackgroundLayer({
  background,
  matchKey,
  variant,
  reducedMotion,
}: {
  background: (typeof MATCH_RESULT_BACKGROUNDS)[MatchResultVariant];
  matchKey: string;
  variant: MatchResultVariant;
  reducedMotion: boolean;
}) {
  const isVictory = variant === "victory";

  return (
    <div
      className={`${styles.cinematicResultBackdrop} ${
        reducedMotion ? styles.cinematicResultBackdropStatic : ""
      }`.trim()}
      aria-hidden="true"
    >
      <picture className={styles.cinematicResultBleedPicture}>
        <source srcSet={background.webp} type="image/webp" />
        <img
          key={`${matchKey}-bleed`}
          className={styles.cinematicResultBleedImage}
          src={background.png}
          alt=""
          decoding="async"
          loading="eager"
          style={
            {
              "--result-bleed-position": background.bleedPosition,
              "--result-bleed-position-mobile": background.bleedPositionMobile,
            } as React.CSSProperties
          }
        />
      </picture>

      <picture className={styles.cinematicResultSharpPicture}>
        <source srcSet={background.webp} type="image/webp" />
        <img
          key={`${matchKey}-sharp`}
          className={styles.cinematicResultSharpImage}
          src={background.png}
          alt=""
          decoding="async"
          loading="eager"
          style={
            {
              "--result-sharp-position": background.sharpPosition,
              "--result-sharp-position-mobile": background.sharpPositionMobile,
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
      <div
        className={
          isVictory
            ? styles.cinematicResultAtmosphereVictory
            : styles.cinematicResultAtmosphereDefeat
        }
      />
    </div>
  );
}

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
  const motionClass = reducedMotion
    ? styles.cinematicResultReduced
    : styles.cinematicResultEnter;

  return (
    <section
      className={`${styles.cinematicResult} ${panelClass} ${motionClass}`.trim()}
      role="status"
      aria-labelledby={`match-result-heading-${matchKey}`}
      data-result-variant={variant}
      data-testid="cinematic-result-screen"
    >
      <ResultBackgroundLayer
        background={background}
        matchKey={matchKey}
        variant={variant}
        reducedMotion={reducedMotion}
      />

      <div className={styles.cinematicResultContent}>
        <p
          className={`${styles.matchCompleteKicker} ${styles.cinematicResultKicker}`.trim()}
        >
          Match complete
        </p>

        <h2
          id={`match-result-heading-${matchKey}`}
          ref={headingRef}
          tabIndex={-1}
          className={`${styles.matchCompleteTitle} ${titleClass} ${titleMotionClass}`.trim()}
        >
          {isVictory ? "VICTORY" : "DEFEAT"}
        </h2>

        <div className={styles.cinematicResultDetails}>
          <p className={styles.matchCompleteScore}>
            Final score {playerScore} – {cpuScore}
          </p>
          <p className={styles.matchCompleteMeta}>
            Tied rounds {tiedRounds} · Automatic moves {automaticMoves}
          </p>
        </div>

        <div
          className={`${styles.matchCompleteActions} ${styles.cinematicResultActions}`.trim()}
        >
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

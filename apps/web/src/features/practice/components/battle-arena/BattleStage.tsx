"use client";

import { PRACTICE_ASSET_SLOTS } from "@/features/practice/assets/practice-asset-slots";
import {
  MOVE_EMOJI,
  MOVE_LABELS,
  type Move,
  type RoundOutcome,
  type PracticePhase,
} from "@/features/practice/engine/practice-engine";
import { ArenaTimer } from "./ArenaTimer";
import styles from "../practice-game.module.css";

type BattleStageProps = {
  phase: PracticePhase;
  countdown: number;
  timerSeconds: number;
  timerTotal: number;
  playerMove: Move | null;
  cpuMove: Move | null;
  roundOutcome: RoundOutcome | null;
  playerTimedOut: boolean;
  transitionMessage: string | null;
  phaseLabel: string;
};

function revealPodClass(
  side: "player" | "cpu",
  outcome: RoundOutcome | null,
  phase: PracticePhase,
): string {
  const classes = [styles.battlePod];
  if (side === "player") classes.push(styles.battlePodPlayer);
  if (side === "cpu") classes.push(styles.battlePodCpu);

  if (phase === "reveal" || phase === "round_result") {
    classes.push(styles.battlePodReveal);
    if (side === "player") classes.push(styles.battlePodEnterPlayer);
    if (side === "cpu") classes.push(styles.battlePodEnterCpu);

    if (outcome) {
      if (outcome === "tie") {
        classes.push(styles.battlePodTie);
      } else {
        const isWinner =
          (side === "player" && outcome === "player") ||
          (side === "cpu" && outcome === "cpu");
        classes.push(isWinner ? styles.battlePodWin : styles.battlePodLoss);
      }
    }
  }

  if (phase === "move_locked" && side === "player") {
    classes.push(styles.battlePodLocked);
  }

  if (phase === "waiting_cpu" && side === "cpu") {
    classes.push(styles.battlePodThinking);
  }

  if (phase === "reveal_pause") {
    classes.push(styles.battlePodConcealed);
  }

  return classes.filter(Boolean).join(" ");
}

function MoveDisplay({
  move,
  concealed,
  timedOut,
  side,
}: {
  move: Move | null;
  concealed: boolean;
  timedOut?: boolean;
  side: "player" | "cpu";
}) {
  if (concealed || !move) {
    return (
      <div className={styles.concealedCard} aria-hidden="true">
        <span className={styles.concealedMark}>?</span>
      </div>
    );
  }

  return (
    <div className={styles.moveRevealArt}>
      <strong aria-label={MOVE_LABELS[move]}>
        <span aria-hidden="true">{MOVE_EMOJI[move]}</span>
      </strong>
      {timedOut && side === "player" ? (
        <span className={styles.autoBadge}>AUTO</span>
      ) : null}
    </div>
  );
}

export function BattleStage({
  phase,
  countdown,
  timerSeconds,
  timerTotal,
  playerMove,
  cpuMove,
  roundOutcome,
  playerTimedOut,
  transitionMessage,
  phaseLabel,
}: BattleStageProps) {
  const showTimer = phase === "commit";
  const showCountdown = phase === "countdown";
  const showVs =
    phase === "reveal" || (phase === "round_result" && playerMove && cpuMove);
  const showResult =
    (phase === "reveal" || phase === "round_result") && roundOutcome;
  const playerConcealed =
    phase === "reveal_pause" ||
    phase === "waiting_cpu" ||
    (phase === "commit" && !playerMove);
  const cpuConcealed =
    phase === "reveal_pause" ||
    phase === "move_locked" ||
    phase === "waiting_cpu" ||
    phase === "commit" ||
    (phase === "reveal" && !cpuMove);

  const resultText =
    roundOutcome === "tie"
      ? "Tie. Replay round."
      : roundOutcome === "player"
        ? "You win the round."
        : roundOutcome === "cpu"
          ? "CPU wins the round."
          : "";

  const resultClass =
    roundOutcome === "player"
      ? styles.resultWin
      : roundOutcome === "cpu"
        ? styles.resultLoss
        : styles.resultTie;

  return (
    <div className={styles.battleStage} data-phase={phase}>
      <div className={styles.stageSpotlight} aria-hidden="true" />
      <div className={styles.stageGrid} aria-hidden="true" />

      <div className={styles.stageField}>
        <div className={revealPodClass("player", roundOutcome, phase)}>
          <span className={styles.podLabel}>YOU</span>
          {phase === "move_locked" && playerMove ? (
            <MoveDisplay
              move={playerMove}
              concealed={false}
              timedOut={playerTimedOut}
              side="player"
            />
          ) : phase === "reveal" || phase === "round_result" ? (
            <MoveDisplay
              move={playerMove}
              concealed={false}
              timedOut={playerTimedOut}
              side="player"
            />
          ) : (
            <MoveDisplay
              move={playerMove}
              concealed={playerConcealed}
              side="player"
            />
          )}
        </div>

        <div className={styles.stageCenter}>
          {showCountdown ? (
            <div className={styles.openingCountdown} aria-live="assertive">
              <span className={styles.openingKicker}>Opening round</span>
              <strong>{countdown || "Go"}</strong>
            </div>
          ) : null}

          {showTimer ? (
            <ArenaTimer
              seconds={timerSeconds}
              total={timerTotal}
              phaseLabel={phaseLabel}
              active
            />
          ) : null}

          {!showCountdown && !showTimer ? (
            <ArenaTimer
              seconds={0}
              total={timerTotal}
              phaseLabel={phaseLabel}
              active={false}
            />
          ) : null}

          {showVs ? (
            <div
              className={`${styles.vsImpact} ${showVs ? styles.vsImpactActive : ""}`.trim()}
              aria-hidden="true"
            >
              {PRACTICE_ASSET_SLOTS.vsEffect.fallback}
            </div>
          ) : null}

          {showResult ? (
            <div
              className={`${styles.roundResultPanel} ${resultClass} ${
                phase === "round_result" ? styles.roundResultVisible : ""
              }`.trim()}
              role="status"
            >
              <p>{resultText}</p>
              {phase === "round_result" && transitionMessage ? (
                <p className={styles.roundResultNext}>{transitionMessage}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className={revealPodClass("cpu", roundOutcome, phase)}>
          <span className={styles.podLabel}>CPU</span>
          {phase === "reveal" || phase === "round_result" ? (
            <MoveDisplay move={cpuMove} concealed={false} side="cpu" />
          ) : (
            <MoveDisplay move={cpuMove} concealed={cpuConcealed} side="cpu" />
          )}
        </div>
      </div>
    </div>
  );
}

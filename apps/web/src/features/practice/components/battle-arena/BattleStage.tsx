"use client";

import { useEffect, useState } from "react";
import {
  CPU_REVEAL_DELAY_MS,
  CPU_REVEAL_DELAY_REDUCED_MS,
  MOVE_LABELS,
  type Move,
  type RoundOutcome,
  type PracticePhase,
} from "@/features/practice/engine/practice-engine";
import { MoveArt } from "@/features/practice/components/battle-arena/MoveArt";
import { ArenaCore } from "./ArenaTimer";
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
  round: number;
  reducedMotion: boolean;
};

function playerShowsMove(
  phase: PracticePhase,
  playerMove: Move | null,
): boolean {
  if (!playerMove) return false;
  return (
    phase === "move_locked" ||
    phase === "waiting_cpu" ||
    phase === "reveal_pause" ||
    phase === "reveal" ||
    phase === "round_result"
  );
}

function revealPodClass(
  side: "player" | "cpu",
  outcome: RoundOutcome | null,
  phase: PracticePhase,
  playerMove: Move | null,
  cpuRevealVisible: boolean,
): string {
  const classes = [styles.battlePod];
  if (side === "player") classes.push(styles.battlePodPlayer);
  if (side === "cpu") classes.push(styles.battlePodCpu);

  if (phase === "reveal" || phase === "round_result") {
    classes.push(styles.battlePodReveal);
    if (side === "player") classes.push(styles.battlePodEnterPlayer);
    if (side === "cpu" && cpuRevealVisible) {
      classes.push(styles.battlePodEnterCpu);
    }

    if (outcome && cpuRevealVisible) {
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

  if (
    side === "player" &&
    playerMove &&
    (phase === "move_locked" ||
      phase === "waiting_cpu" ||
      phase === "reveal_pause")
  ) {
    classes.push(styles.battlePodLocked);
    if (phase === "move_locked") {
      classes.push(styles.battlePodLockedFlash);
    }
  }

  if (phase === "waiting_cpu" && side === "cpu") {
    classes.push(styles.battlePodThinking);
  }

  if (phase === "reveal_pause") {
    classes.push(styles.battlePodAnticipation);
    if (side === "cpu") classes.push(styles.battlePodConcealed);
  }

  return classes.filter(Boolean).join(" ");
}

function podStatusLabel(
  side: "player" | "cpu",
  phase: PracticePhase,
): string | null {
  if (side === "player") {
    if (phase === "move_locked") return "Locked in";
    if (phase === "waiting_cpu" || phase === "reveal_pause") {
      return "Your move is ready";
    }
  }

  if (side === "cpu") {
    if (
      phase === "move_locked" ||
      phase === "waiting_cpu" ||
      phase === "reveal_pause"
    ) {
      return phase === "reveal_pause" ? "Move concealed" : "Concealed";
    }
  }

  return null;
}

function MoveDisplay({
  move,
  concealed,
  timedOut,
  side,
  showName = false,
  entering = false,
}: {
  move: Move | null;
  concealed: boolean;
  timedOut?: boolean;
  side: "player" | "cpu";
  showName?: boolean;
  entering?: boolean;
}) {
  if (concealed || !move) {
    return (
      <div className={styles.concealedCard} aria-hidden="true">
        <span className={styles.concealedMark}>?</span>
      </div>
    );
  }

  return (
    <div
      className={`${styles.moveRevealArt} ${entering ? styles.moveRevealEnter : ""}`.trim()}
    >
      <MoveArt move={move} variant="reveal" label={MOVE_LABELS[move]} />
      {showName ? (
        <span className={styles.moveRevealName} aria-hidden="true">
          {MOVE_LABELS[move]}
        </span>
      ) : null}
      {timedOut && side === "player" ? (
        <span className={styles.autoBadge}>AUTO</span>
      ) : null}
    </div>
  );
}

function phaseCoreMode(
  phase: PracticePhase,
): "countdown" | "timer" | "phase" | "reveal" {
  if (phase === "countdown") return "countdown";
  if (phase === "commit") return "timer";
  if (phase === "reveal" || phase === "round_result") return "reveal";
  return "phase";
}

function stageAtmosphereClass(phase: PracticePhase): string {
  switch (phase) {
    case "commit":
      return styles.battleStageCommit ?? "";
    case "move_locked":
      return styles.battleStageMoveLocked ?? "";
    case "waiting_cpu":
      return styles.battleStageWaitingCpu ?? "";
    case "reveal_pause":
      return styles.battleStageRevealPrep ?? "";
    case "reveal":
    case "round_result":
      return styles.battleStageReveal ?? "";
    default:
      return "";
  }
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
  round,
  reducedMotion,
}: BattleStageProps) {
  const [cpuRevealVisible, setCpuRevealVisible] = useState(false);
  const [revealImpact, setRevealImpact] = useState(false);

  useEffect(() => {
    if (phase !== "reveal") {
      const resetTimer = window.setTimeout(() => {
        setCpuRevealVisible(false);
        setRevealImpact(false);
      }, 0);
      return () => window.clearTimeout(resetTimer);
    }

    const hideTimer = window.setTimeout(() => {
      setCpuRevealVisible(false);
      setRevealImpact(!reducedMotion);
    }, 0);
    const revealTimer = window.setTimeout(
      () => {
        setCpuRevealVisible(true);
      },
      reducedMotion ? CPU_REVEAL_DELAY_REDUCED_MS : CPU_REVEAL_DELAY_MS,
    );
    const impactTimer = window.setTimeout(
      () => {
        setRevealImpact(false);
      },
      reducedMotion
        ? CPU_REVEAL_DELAY_REDUCED_MS + 420
        : CPU_REVEAL_DELAY_MS + 420,
    );

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(revealTimer);
      window.clearTimeout(impactTimer);
    };
  }, [phase, round, reducedMotion]);

  const showResult =
    (phase === "reveal" || phase === "round_result") && roundOutcome;
  const playerVisible = playerShowsMove(phase, playerMove);
  const cpuVisible =
    (phase === "reveal" || phase === "round_result") && cpuRevealVisible;
  const coreMode = phaseCoreMode(phase);
  const playerMoveEntering = phase === "move_locked" && Boolean(playerMove);

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

  const stageClass = [
    styles.battleStage,
    stageAtmosphereClass(phase),
    phase === "reveal_pause" ? styles.battleStageAnticipation : "",
    revealImpact ? styles.battleStageImpact : "",
    roundOutcome === "tie" && (phase === "reveal" || phase === "round_result")
      ? styles.battleStageTie
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const fieldClass = [
    styles.stageField,
    phase === "reveal_pause" ? styles.stageFieldRevealPrep : "",
    phase === "reveal" || phase === "round_result"
      ? styles.stageFieldReveal
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={stageClass} data-phase={phase}>
      <div className={styles.stageSpotlight} aria-hidden="true" />
      <div className={styles.stageGrid} aria-hidden="true" />
      <div className={styles.stageScanline} aria-hidden="true" />
      <div className={styles.stageHaze} aria-hidden="true" />

      <div className={fieldClass}>
        <div
          className={revealPodClass(
            "player",
            roundOutcome,
            phase,
            playerMove,
            cpuRevealVisible,
          )}
        >
          <span className={styles.podLabel}>YOU</span>
          {podStatusLabel("player", phase) ? (
            <span className={styles.podStatus}>
              {podStatusLabel("player", phase)}
            </span>
          ) : null}
          <MoveDisplay
            move={playerMove}
            concealed={!playerVisible}
            timedOut={playerTimedOut}
            side="player"
            showName={playerVisible}
            entering={playerMoveEntering}
          />
        </div>

        <div className={styles.stageCenter}>
          <ArenaCore
            mode={coreMode}
            seconds={timerSeconds}
            total={timerTotal}
            phaseLabel={phaseLabel}
            countdown={countdown}
            vsImpact={phase === "reveal" && cpuRevealVisible}
          />

          {showResult ? (
            <div
              className={`${styles.roundResultPanel} ${resultClass} ${
                phase === "round_result" ? styles.roundResultVisible : ""
              } ${phase === "reveal" && cpuRevealVisible ? styles.roundResultReveal : ""}`.trim()}
              role="status"
            >
              <p>{resultText}</p>
              {phase === "round_result" && transitionMessage ? (
                <p className={styles.roundResultNext}>{transitionMessage}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div
          className={revealPodClass(
            "cpu",
            roundOutcome,
            phase,
            playerMove,
            cpuRevealVisible,
          )}
        >
          <span className={styles.podLabel}>CPU</span>
          {podStatusLabel("cpu", phase) ? (
            <span
              className={`${styles.podStatus} ${phase === "waiting_cpu" ? styles.podStatusDots : ""}`.trim()}
            >
              {podStatusLabel("cpu", phase)}
            </span>
          ) : null}
          <MoveDisplay
            move={cpuMove}
            concealed={!cpuVisible}
            side="cpu"
            showName={cpuVisible}
            entering={cpuVisible && phase === "reveal"}
          />
        </div>
      </div>
    </div>
  );
}

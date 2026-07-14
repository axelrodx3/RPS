"use client";

import {
  MOVE_EMOJI,
  MOVE_LABELS,
  type Move,
  type RoundOutcome,
  type PracticePhase,
} from "@/features/practice/engine/practice-engine";
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

function cpuShowsMove(phase: PracticePhase): boolean {
  return phase === "reveal" || phase === "round_result";
}

function revealPodClass(
  side: "player" | "cpu",
  outcome: RoundOutcome | null,
  phase: PracticePhase,
  playerMove: Move | null,
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

  if (
    side === "player" &&
    playerMove &&
    (phase === "move_locked" ||
      phase === "waiting_cpu" ||
      phase === "reveal_pause")
  ) {
    classes.push(styles.battlePodLocked);
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
    if (phase === "move_locked") return "Move locked";
    if (phase === "waiting_cpu" || phase === "reveal_pause") {
      return "Your move is ready";
    }
  }

  if (side === "cpu") {
    if (phase === "move_locked") return "CPU locked";
    if (phase === "waiting_cpu") return "Waiting on CPU";
    if (phase === "reveal_pause") return "Reveal incoming";
  }

  return null;
}

function MoveDisplay({
  move,
  concealed,
  timedOut,
  side,
  showName = false,
}: {
  move: Move | null;
  concealed: boolean;
  timedOut?: boolean;
  side: "player" | "cpu";
  showName?: boolean;
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

function phaseCoreSubLabel(phase: PracticePhase): string | undefined {
  if (phase === "move_locked") return "Move locked";
  if (phase === "waiting_cpu") return "Waiting on CPU";
  if (phase === "reveal_pause") return "Reveal incoming";
  return undefined;
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
  const showResult =
    (phase === "reveal" || phase === "round_result") && roundOutcome;
  const playerVisible = playerShowsMove(phase, playerMove);
  const cpuVisible = cpuShowsMove(phase);
  const coreMode = phaseCoreMode(phase);

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
        <div
          className={revealPodClass("player", roundOutcome, phase, playerMove)}
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
          />
        </div>

        <div className={styles.stageCenter}>
          <ArenaCore
            mode={coreMode}
            seconds={timerSeconds}
            total={timerTotal}
            phaseLabel={phaseLabel}
            subLabel={phaseCoreSubLabel(phase)}
            countdown={countdown}
          />

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

        <div className={revealPodClass("cpu", roundOutcome, phase, playerMove)}>
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
          />
        </div>
      </div>
    </div>
  );
}

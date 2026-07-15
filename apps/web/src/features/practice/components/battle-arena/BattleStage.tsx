"use client";

import { useEffect, useState } from "react";
import {
  CPU_REVEAL_DELAY_MS,
  CPU_REVEAL_DELAY_REDUCED_MS,
  REVEAL_IMPACT_MS,
  MOVE_LABELS,
  type Move,
  type RoundOutcome,
  type PracticePhase,
} from "@/features/practice/engine/practice-engine";
import { MoveArt } from "@/features/practice/components/battle-arena/MoveArt";
import {
  getRoundResultAccessibleLabel,
  getRoundResultPrimaryLabel,
  getRoundResultSecondaryLabel,
  resolveArenaCoreVisualState,
} from "@/features/practice/utils/arena-core-state";
import { PRACTICE_WIN_TARGET } from "@/features/practice/engine/practice-engine";
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
  playerScore: number;
  cpuScore: number;
  winTarget?: number;
  phaseLabel: string;
  round: number;
  reducedMotion: boolean;
  onBothMovesRevealed?: () => void;
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

function cpuShowsMove(
  phase: PracticePhase,
  cpuRevealVisible: boolean,
): boolean {
  if (phase === "round_result") return true;
  return phase === "reveal" && cpuRevealVisible;
}

function revealPodClass(
  side: "player" | "cpu",
  outcome: RoundOutcome | null,
  phase: PracticePhase,
  playerMove: Move | null,
  cpuRevealVisible: boolean,
  revealImpact: boolean,
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

  if (revealImpact && cpuRevealVisible && phase === "reveal") {
    classes.push(styles.battlePodImpact);
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
  revealed = false,
}: {
  move: Move | null;
  concealed: boolean;
  timedOut?: boolean;
  side: "player" | "cpu";
  showName?: boolean;
  entering?: boolean;
  revealed?: boolean;
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
      className={[
        styles.moveRevealArt,
        entering ? styles.moveRevealEnter : "",
        revealed ? styles.moveRevealShown : "",
      ]
        .filter(Boolean)
        .join(" ")}
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

type RevealAnimationDriverProps = {
  round: number;
  reducedMotion: boolean;
  bothMovesReady: boolean;
  onBothMovesRevealed?: () => void;
  onCpuRevealVisible: (visible: boolean) => void;
  onRevealImpact: (active: boolean) => void;
};

function RevealAnimationDriver({
  round,
  reducedMotion,
  bothMovesReady,
  onBothMovesRevealed,
  onCpuRevealVisible,
  onRevealImpact,
}: RevealAnimationDriverProps) {
  useEffect(() => {
    onCpuRevealVisible(false);
    onRevealImpact(false);

    const revealDelay = reducedMotion
      ? CPU_REVEAL_DELAY_REDUCED_MS
      : CPU_REVEAL_DELAY_MS;

    const revealTimer = window.setTimeout(() => {
      onCpuRevealVisible(true);
      if (bothMovesReady) {
        onBothMovesRevealed?.();
      }
    }, revealDelay);

    const impactTimer = window.setTimeout(() => {
      onRevealImpact(true);
    }, revealDelay + 40);

    const impactEndTimer = window.setTimeout(() => {
      onRevealImpact(false);
    }, revealDelay + REVEAL_IMPACT_MS);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(impactTimer);
      window.clearTimeout(impactEndTimer);
    };
  }, [
    round,
    reducedMotion,
    bothMovesReady,
    onBothMovesRevealed,
    onCpuRevealVisible,
    onRevealImpact,
  ]);

  return null;
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
  playerScore,
  cpuScore,
  winTarget = PRACTICE_WIN_TARGET,
  phaseLabel,
  round,
  reducedMotion,
  onBothMovesRevealed,
}: BattleStageProps) {
  const [cpuRevealVisible, setCpuRevealVisible] = useState(false);
  const [revealImpact, setRevealImpact] = useState(false);

  const effectiveCpuRevealVisible =
    phase === "round_result" ? true : cpuRevealVisible;
  const effectiveRevealImpact = phase === "reveal" ? revealImpact : false;

  const playerVisible = playerShowsMove(phase, playerMove);
  const cpuVisible = cpuShowsMove(phase, effectiveCpuRevealVisible);
  const playerMoveEntering = phase === "move_locked" && Boolean(playerMove);
  const movesFullyRevealed =
    (phase === "reveal" || phase === "round_result") &&
    effectiveCpuRevealVisible;

  const visualState = resolveArenaCoreVisualState(
    phase,
    roundOutcome,
    movesFullyRevealed,
  );

  const outcomeLabels =
    roundOutcome && movesFullyRevealed
      ? {
          primary: getRoundResultPrimaryLabel(roundOutcome),
          secondary: getRoundResultSecondaryLabel(
            roundOutcome,
            playerScore,
            cpuScore,
            winTarget,
          ),
          accessible: getRoundResultAccessibleLabel(
            roundOutcome,
            playerScore,
            cpuScore,
            winTarget,
          ),
        }
      : null;

  const stageClass = [
    styles.battleStage,
    stageAtmosphereClass(phase),
    phase === "reveal_pause" ? styles.battleStageAnticipation : "",
    effectiveRevealImpact ? styles.battleStageImpact : "",
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
    movesFullyRevealed ? styles.stageFieldBothRevealed : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={stageClass} data-phase={phase}>
      {phase === "reveal" ? (
        <RevealAnimationDriver
          key={round}
          round={round}
          reducedMotion={reducedMotion}
          bothMovesReady={Boolean(playerMove && cpuMove)}
          onBothMovesRevealed={onBothMovesRevealed}
          onCpuRevealVisible={setCpuRevealVisible}
          onRevealImpact={setRevealImpact}
        />
      ) : null}

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
            effectiveCpuRevealVisible,
            effectiveRevealImpact,
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
            revealed={movesFullyRevealed}
          />
        </div>

        <div className={styles.stageCenter}>
          <ArenaCore
            visualState={visualState}
            seconds={timerSeconds}
            total={timerTotal}
            phaseLabel={phaseLabel}
            countdown={countdown}
            vsImpact={
              visualState === "vs_reveal" &&
              movesFullyRevealed &&
              effectiveRevealImpact
            }
            primaryLabel={outcomeLabels?.primary ?? null}
            secondaryLabel={outcomeLabels?.secondary ?? null}
            outcomeAnimationKey={
              outcomeLabels ? `${round}-${roundOutcome}` : undefined
            }
            reducedMotion={reducedMotion}
            accessibleLabel={outcomeLabels?.accessible}
          />
        </div>

        <div
          className={revealPodClass(
            "cpu",
            roundOutcome,
            phase,
            playerMove,
            effectiveCpuRevealVisible,
            effectiveRevealImpact,
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
            revealed={movesFullyRevealed}
          />
        </div>
      </div>
    </div>
  );
}

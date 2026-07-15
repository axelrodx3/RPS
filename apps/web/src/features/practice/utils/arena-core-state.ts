import {
  PRACTICE_WIN_TARGET,
  type PracticePhase,
  type RoundOutcome,
} from "@/features/practice/engine/practice-engine";
import { getMatchPointLabel } from "@/features/practice/utils/match-point-label";

export type ArenaCoreVisualState =
  | "countdown"
  | "selecting"
  | "phase"
  | "vs_reveal"
  | "player_round_win"
  | "cpu_round_win"
  | "tie";

export function resolveArenaCoreVisualState(
  phase: PracticePhase,
  roundOutcome: RoundOutcome | null,
  movesFullyRevealed: boolean,
): ArenaCoreVisualState {
  if (phase === "countdown") return "countdown";
  if (phase === "commit") return "selecting";

  if (
    (phase === "reveal" || phase === "round_result") &&
    roundOutcome &&
    movesFullyRevealed
  ) {
    if (roundOutcome === "player") return "player_round_win";
    if (roundOutcome === "cpu") return "cpu_round_win";
    return "tie";
  }

  if (phase === "reveal") return "vs_reveal";
  return "phase";
}

export function getRoundResultPrimaryLabel(outcome: RoundOutcome): string {
  switch (outcome) {
    case "player":
      return "ROUND WON";
    case "cpu":
      return "ROUND LOST";
    case "tie":
      return "TIE";
  }
}

export function getRoundResultSecondaryLabel(
  outcome: RoundOutcome,
  playerScore: number,
  cpuScore: number,
  winTarget: number = PRACTICE_WIN_TARGET,
): string | null {
  if (outcome === "tie") {
    return "REPLAY ROUND";
  }

  return getMatchPointLabel(playerScore, cpuScore, winTarget);
}

export function formatRoundResultAnnouncement(
  outcome: RoundOutcome,
  playerScore: number,
  cpuScore: number,
  winTarget: number = PRACTICE_WIN_TARGET,
): string {
  const spokenPrimary =
    outcome === "player"
      ? "You won the round"
      : outcome === "cpu"
        ? "CPU won the round"
        : "Tie";

  const secondary = getRoundResultSecondaryLabel(
    outcome,
    playerScore,
    cpuScore,
    winTarget,
  );

  if (!secondary) {
    return `${spokenPrimary}.`;
  }

  if (secondary === "REPLAY ROUND") {
    return `${spokenPrimary}. Replay round.`;
  }

  return `${spokenPrimary}. ${secondary.charAt(0)}${secondary.slice(1).toLowerCase()}.`;
}

export function getRoundResultAccessibleLabel(
  outcome: RoundOutcome,
  playerScore: number,
  cpuScore: number,
  winTarget: number = PRACTICE_WIN_TARGET,
): string {
  return formatRoundResultAnnouncement(
    outcome,
    playerScore,
    cpuScore,
    winTarget,
  );
}

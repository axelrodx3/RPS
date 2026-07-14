import { PRACTICE_WIN_TARGET } from "@/features/practice/engine/practice-engine";
import { getMatchPointLabel } from "@/features/practice/utils/match-point-label";

export function getRoundIntroLabel(
  round: number,
  playerScore: number,
  cpuScore: number,
  winTarget: number = PRACTICE_WIN_TARGET,
): string {
  const matchPoint = getMatchPointLabel(playerScore, cpuScore, winTarget);
  if (matchPoint) {
    return matchPoint;
  }

  if (round >= 3 && playerScore < winTarget && cpuScore < winTarget) {
    return "FINAL ROUND";
  }

  return `ROUND ${round}`;
}

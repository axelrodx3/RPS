import { PRACTICE_WIN_TARGET } from "@/features/practice/engine/practice-engine";

export function getMatchPointLabel(
  playerScore: number,
  cpuScore: number,
  winTarget: number = PRACTICE_WIN_TARGET,
): string | null {
  const playerOneWinAway = playerScore === winTarget - 1;
  const cpuOneWinAway = cpuScore === winTarget - 1;

  if (playerOneWinAway && cpuOneWinAway) {
    return "DOUBLE MATCH POINT";
  }

  if (playerOneWinAway && cpuScore < winTarget - 1) {
    return "YOUR MATCH POINT";
  }

  if (cpuOneWinAway && playerScore < winTarget - 1) {
    return "CPU MATCH POINT";
  }

  return null;
}

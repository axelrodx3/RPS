"use client";

import { useSettings } from "@/providers/SettingsProvider";
import { CinematicResultScreen } from "./CinematicResultScreen";

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

  return (
    <CinematicResultScreen
      variant={matchWinner === "player" ? "victory" : "defeat"}
      playerScore={playerScore}
      cpuScore={cpuScore}
      tiedRounds={tiedRounds}
      automaticMoves={automaticMoves}
      matchKey={matchKey}
      reducedMotion={settings.reducedMotion}
      onRematch={onRematch}
    />
  );
}

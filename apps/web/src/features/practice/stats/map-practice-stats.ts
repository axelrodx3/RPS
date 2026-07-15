import { MOVE_LABELS } from "@/features/practice/engine/practice-engine";
import type { PracticeStatistics } from "@/lib/storage/local-storage";
import type { PlayerStatsViewModel, StatsMetric } from "./stats-view-model";

export function mapPracticeStatsToViewModel(
  stats: PracticeStatistics,
): PlayerStatsViewModel {
  const averageMatchLengthSeconds =
    stats.matchesPlayed > 0
      ? Math.round(stats.totalMatchDurationMs / stats.matchesPlayed / 1000)
      : null;

  return {
    source: "practice-local",
    wins: stats.wins,
    losses: stats.losses,
    ties: stats.tiedRounds,
    winRate: stats.winPercentage,
    bestWinStreak: stats.bestWinStreak,
    rockUsed: stats.rockSelections,
    paperUsed: stats.paperSelections,
    scissorsUsed: stats.scissorsSelections,
    favoriteMove: stats.mostUsedMove
      ? MOVE_LABELS[stats.mostUsedMove]
      : "None yet",
    automaticPicks: stats.automaticMoveCount,
    totalMatches: stats.matchesPlayed,
    averageMatchLengthSeconds,
  };
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds <= 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder > 0 ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

export function buildStatsMetrics(
  viewModel: PlayerStatsViewModel,
): StatsMetric[] {
  return [
    {
      id: "wins",
      icon: "🏆",
      label: "Wins",
      value: String(viewModel.wins),
      numericValue: viewModel.wins,
    },
    {
      id: "losses",
      icon: "❌",
      label: "Losses",
      value: String(viewModel.losses),
      numericValue: viewModel.losses,
    },
    {
      id: "ties",
      icon: "🤝",
      label: "Ties",
      value: String(viewModel.ties),
      numericValue: viewModel.ties,
    },
    {
      id: "win-rate",
      icon: "📈",
      label: "Win Rate",
      value: `${viewModel.winRate}%`,
      numericValue: viewModel.winRate,
    },
    {
      id: "best-streak",
      icon: "🔥",
      label: "Best Win Streak",
      value: String(viewModel.bestWinStreak),
      numericValue: viewModel.bestWinStreak,
    },
    {
      id: "rock",
      icon: "🪨",
      label: "Rock Used",
      value: String(viewModel.rockUsed),
      numericValue: viewModel.rockUsed,
    },
    {
      id: "paper",
      icon: "📄",
      label: "Paper Used",
      value: String(viewModel.paperUsed),
      numericValue: viewModel.paperUsed,
    },
    {
      id: "scissors",
      icon: "✂️",
      label: "Scissors Used",
      value: String(viewModel.scissorsUsed),
      numericValue: viewModel.scissorsUsed,
    },
    {
      id: "favorite",
      icon: "⭐",
      label: "Favorite Move",
      value: viewModel.favoriteMove,
    },
    {
      id: "automatic",
      icon: "⚡",
      label: "Automatic Picks",
      value: String(viewModel.automaticPicks),
      numericValue: viewModel.automaticPicks,
    },
    {
      id: "matches",
      icon: "🎯",
      label: "Total Matches",
      value: String(viewModel.totalMatches),
      numericValue: viewModel.totalMatches,
    },
    {
      id: "avg-length",
      icon: "⏱",
      label: "Average Match Length",
      value: formatDuration(viewModel.averageMatchLengthSeconds),
    },
  ];
}

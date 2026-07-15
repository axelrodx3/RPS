import { describe, expect, it } from "vitest";
import { DEFAULT_PRACTICE_STATS } from "@/lib/storage/local-storage";
import {
  buildStatsMetrics,
  formatDuration,
  mapPracticeStatsToViewModel,
} from "@/features/practice/stats/map-practice-stats";

describe("mapPracticeStatsToViewModel", () => {
  it("maps practice storage stats into a reusable view model", () => {
    const viewModel = mapPracticeStatsToViewModel({
      ...DEFAULT_PRACTICE_STATS,
      matchesPlayed: 4,
      wins: 3,
      losses: 1,
      tiedRounds: 2,
      winPercentage: 75,
      bestWinStreak: 2,
      rockSelections: 5,
      paperSelections: 2,
      scissorsSelections: 1,
      automaticMoveCount: 1,
      mostUsedMove: "rock",
      totalMatchDurationMs: 240_000,
    });

    expect(viewModel.source).toBe("practice-local");
    expect(viewModel.wins).toBe(3);
    expect(viewModel.ties).toBe(2);
    expect(viewModel.favoriteMove).toBe("Rock");
    expect(viewModel.averageMatchLengthSeconds).toBe(60);
  });
});

describe("buildStatsMetrics", () => {
  it("includes all requested stat cards", () => {
    const metrics = buildStatsMetrics(
      mapPracticeStatsToViewModel(DEFAULT_PRACTICE_STATS),
    );
    expect(metrics.map((metric) => metric.label)).toEqual([
      "Wins",
      "Losses",
      "Ties",
      "Win Rate",
      "Best Win Streak",
      "Rock Used",
      "Paper Used",
      "Scissors Used",
      "Favorite Move",
      "Automatic Picks",
      "Total Matches",
      "Average Match Length",
    ]);
  });
});

describe("formatDuration", () => {
  it("formats short and long durations", () => {
    expect(formatDuration(null)).toBe("—");
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(125)).toBe("2m 5s");
  });
});

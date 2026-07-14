import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRACTICE_STATS,
  DEFAULT_SETTINGS,
  computeRemainingSeconds,
  parsePracticeStats,
  parseSettings,
  recordPracticeMatchResult,
  resetPracticeStats,
} from "@/lib/storage/local-storage";

describe("parseSettings", () => {
  it("returns defaults for invalid input", () => {
    expect(parseSettings("{bad")).toEqual(DEFAULT_SETTINGS);
  });

  it("migrates legacy volume and muted fields", () => {
    expect(
      parseSettings(JSON.stringify({ volume: 0.4, muted: true })),
    ).toMatchObject({
      masterVolume: 0.4,
      masterMuted: true,
    });
  });
});

describe("parsePracticeStats", () => {
  it("returns defaults for invalid input", () => {
    expect(parsePracticeStats("{bad")).toEqual(DEFAULT_PRACTICE_STATS);
  });

  it("migrates legacy stats shape", () => {
    expect(
      parsePracticeStats(
        JSON.stringify({
          matchesPlayed: 3,
          matchesWon: 2,
          matchesLost: 1,
          ties: 1,
          timeouts: 2,
        }),
      ),
    ).toMatchObject({
      matchesPlayed: 3,
      wins: 2,
      losses: 1,
      tiedRounds: 1,
      automaticMoveCount: 2,
    });
  });
});

describe("recordPracticeMatchResult", () => {
  it("updates extended practice statistics once", () => {
    const next = recordPracticeMatchResult(DEFAULT_PRACTICE_STATS, "player", [
      {
        outcome: "player",
        playerTimedOut: false,
        playerMove: "rock",
      },
      {
        outcome: "tie",
        playerTimedOut: true,
        playerMove: "paper",
      },
    ]);

    expect(next.matchesPlayed).toBe(1);
    expect(next.wins).toBe(1);
    expect(next.currentWinStreak).toBe(1);
    expect(next.rockSelections).toBe(1);
    expect(next.paperSelections).toBe(1);
    expect(next.tiedRounds).toBe(1);
    expect(next.automaticMoveCount).toBe(1);
    expect(next.mostUsedMove).toBe("rock");
  });
});

describe("resetPracticeStats", () => {
  it("returns a fresh stats object", () => {
    expect(resetPracticeStats()).toEqual(DEFAULT_PRACTICE_STATS);
  });
});

describe("computeRemainingSeconds", () => {
  it("uses elapsed wall clock time", () => {
    expect(computeRemainingSeconds(1000, 20, 6000)).toBe(15);
    expect(computeRemainingSeconds(1000, 20, 22000)).toBe(0);
  });
});

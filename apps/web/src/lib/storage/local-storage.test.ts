import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  parsePracticeStats,
  parseSettings,
  recordPracticeMatchResult,
} from "@/lib/storage/local-storage";

describe("parseSettings", () => {
  it("returns defaults for empty input", () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it("parses persisted settings safely", () => {
    expect(
      parseSettings(
        JSON.stringify({
          volume: 0.8,
          muted: true,
          tutorialCompleted: true,
          reducedMotion: true,
          highContrast: true,
          theme: "light",
          wagerPresetLamports: 1000000,
        }),
      ),
    ).toMatchObject({
      volume: 0.8,
      muted: true,
      tutorialCompleted: true,
      reducedMotion: true,
      highContrast: true,
      theme: "light",
      wagerPresetLamports: 1000000,
    });
  });
});

describe("parsePracticeStats", () => {
  it("records practice-only statistics", () => {
    const stats = recordPracticeMatchResult(
      parsePracticeStats(null),
      "player",
      [
        { outcome: "player", playerTimedOut: false },
        { outcome: "tie", playerTimedOut: false },
        { outcome: "player", playerTimedOut: true },
      ],
    );
    expect(stats.matchesPlayed).toBe(1);
    expect(stats.matchesWon).toBe(1);
    expect(stats.roundsPlayed).toBe(3);
    expect(stats.ties).toBe(1);
    expect(stats.timeouts).toBe(1);
  });
});

describe("localStorage persistence", () => {
  it("round-trips settings through storage helpers", async () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    } as Storage;

    const { readSettings, writeSettings } =
      await import("@/lib/storage/local-storage");
    writeSettings(storage, { ...DEFAULT_SETTINGS, tutorialCompleted: true });
    expect(readSettings(storage).tutorialCompleted).toBe(true);
  });
});

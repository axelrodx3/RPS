import type { ThemePreference } from "@/design-system/tokens";

export type UserSettings = {
  volume: number;
  muted: boolean;
  tutorialCompleted: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  theme: ThemePreference;
  wagerPresetLamports: number | null;
};

export type PracticeStatistics = {
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  roundsPlayed: number;
  ties: number;
  timeouts: number;
};

export const SETTINGS_STORAGE_KEY = "rps.settings.v1";
export const PRACTICE_STATS_STORAGE_KEY = "rps.practice-stats.v1";

export const DEFAULT_SETTINGS: UserSettings = {
  volume: 0.55,
  muted: false,
  tutorialCompleted: false,
  reducedMotion: false,
  highContrast: false,
  theme: "dark",
  wagerPresetLamports: null,
};

export const DEFAULT_PRACTICE_STATS: PracticeStatistics = {
  matchesPlayed: 0,
  matchesWon: 0,
  matchesLost: 0,
  roundsPlayed: 0,
  ties: 0,
  timeouts: 0,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function clampVolume(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value))
    return DEFAULT_SETTINGS.volume;
  return Math.min(1, Math.max(0, value));
}

export function parseSettings(raw: string | null): UserSettings {
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return { ...DEFAULT_SETTINGS };
    return {
      volume: clampVolume(parsed.volume),
      muted: parsed.muted === true,
      tutorialCompleted: parsed.tutorialCompleted === true,
      reducedMotion: parsed.reducedMotion === true,
      highContrast: parsed.highContrast === true,
      theme:
        parsed.theme === "light" || parsed.theme === "system"
          ? parsed.theme
          : "dark",
      wagerPresetLamports:
        typeof parsed.wagerPresetLamports === "number"
          ? parsed.wagerPresetLamports
          : null,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function parsePracticeStats(raw: string | null): PracticeStatistics {
  if (!raw) return { ...DEFAULT_PRACTICE_STATS };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return { ...DEFAULT_PRACTICE_STATS };
    const num = (key: keyof PracticeStatistics) =>
      typeof parsed[key] === "number" && parsed[key] >= 0
        ? (parsed[key] as number)
        : DEFAULT_PRACTICE_STATS[key];
    return {
      matchesPlayed: num("matchesPlayed"),
      matchesWon: num("matchesWon"),
      matchesLost: num("matchesLost"),
      roundsPlayed: num("roundsPlayed"),
      ties: num("ties"),
      timeouts: num("timeouts"),
    };
  } catch {
    return { ...DEFAULT_PRACTICE_STATS };
  }
}

export function readSettings(storage: Storage | null): UserSettings {
  if (!storage) return { ...DEFAULT_SETTINGS };
  return parseSettings(storage.getItem(SETTINGS_STORAGE_KEY));
}

export function writeSettings(
  storage: Storage | null,
  settings: UserSettings,
): void {
  if (!storage) return;
  storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function readPracticeStats(storage: Storage | null): PracticeStatistics {
  if (!storage) return { ...DEFAULT_PRACTICE_STATS };
  return parsePracticeStats(storage.getItem(PRACTICE_STATS_STORAGE_KEY));
}

export function writePracticeStats(
  storage: Storage | null,
  stats: PracticeStatistics,
): void {
  if (!storage) return;
  storage.setItem(PRACTICE_STATS_STORAGE_KEY, JSON.stringify(stats));
}

export function recordPracticeMatchResult(
  stats: PracticeStatistics,
  winner: "player" | "cpu",
  history: { outcome: "player" | "cpu" | "tie"; playerTimedOut: boolean }[],
): PracticeStatistics {
  return {
    matchesPlayed: stats.matchesPlayed + 1,
    matchesWon: stats.matchesWon + (winner === "player" ? 1 : 0),
    matchesLost: stats.matchesLost + (winner === "cpu" ? 1 : 0),
    roundsPlayed: stats.roundsPlayed + history.length,
    ties: stats.ties + history.filter((r) => r.outcome === "tie").length,
    timeouts: stats.timeouts + history.filter((r) => r.playerTimedOut).length,
  };
}

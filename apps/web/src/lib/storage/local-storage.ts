import type { ThemePreference } from "@/design-system/tokens";
import type { Move } from "@/features/practice/engine/practice-engine";

export type UserSettings = {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  masterMuted: boolean;
  sfxMuted: boolean;
  musicMuted: boolean;
  tutorialCompleted: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  theme: ThemePreference;
  wagerPresetLamports: number | null;
};

export type PracticeStatistics = {
  version: 2;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winPercentage: number;
  currentWinStreak: number;
  bestWinStreak: number;
  roundsWon: number;
  roundsLost: number;
  tiedRounds: number;
  rockSelections: number;
  paperSelections: number;
  scissorsSelections: number;
  automaticMoveCount: number;
  mostUsedMove: Move | null;
};

export const SETTINGS_STORAGE_KEY = "rps.settings.v2";
export const PRACTICE_STATS_STORAGE_KEY = "rps.practice-stats.v2";
export const LEGACY_SETTINGS_KEY = "rps.settings.v1";
export const LEGACY_STATS_KEY = "rps.practice-stats.v1";

export const DEFAULT_SETTINGS: UserSettings = {
  masterVolume: 0.55,
  sfxVolume: 0.85,
  musicVolume: 0.45,
  masterMuted: false,
  sfxMuted: false,
  musicMuted: true,
  tutorialCompleted: false,
  reducedMotion: false,
  highContrast: false,
  theme: "dark",
  wagerPresetLamports: null,
};

export const DEFAULT_PRACTICE_STATS: PracticeStatistics = {
  version: 2,
  matchesPlayed: 0,
  wins: 0,
  losses: 0,
  winPercentage: 0,
  currentWinStreak: 0,
  bestWinStreak: 0,
  roundsWon: 0,
  roundsLost: 0,
  tiedRounds: 0,
  rockSelections: 0,
  paperSelections: 0,
  scissorsSelections: 0,
  automaticMoveCount: 0,
  mostUsedMove: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function clampVolume(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(1, Math.max(0, value));
}

function computeWinPercentage(wins: number, matches: number): number {
  if (matches <= 0) return 0;
  return Math.round((wins / matches) * 1000) / 10;
}

function computeMostUsedMove(stats: PracticeStatistics): Move | null {
  const counts: [Move, number][] = [
    ["rock", stats.rockSelections],
    ["paper", stats.paperSelections],
    ["scissors", stats.scissorsSelections],
  ];
  const top = counts.sort((a, b) => b[1] - a[1])[0];
  if (!top || top[1] <= 0) return null;
  return top[0];
}

export function parseSettings(raw: string | null): UserSettings {
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return { ...DEFAULT_SETTINGS };

    if ("masterVolume" in parsed) {
      return {
        masterVolume: clampVolume(
          parsed.masterVolume,
          DEFAULT_SETTINGS.masterVolume,
        ),
        sfxVolume: clampVolume(parsed.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
        musicVolume: clampVolume(
          parsed.musicVolume,
          DEFAULT_SETTINGS.musicVolume,
        ),
        masterMuted: parsed.masterMuted === true,
        sfxMuted: parsed.sfxMuted === true,
        musicMuted: parsed.musicMuted === true,
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
    }

    return {
      ...DEFAULT_SETTINGS,
      masterVolume: clampVolume(parsed.volume, DEFAULT_SETTINGS.masterVolume),
      masterMuted: parsed.muted === true,
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

    if (parsed.version === 2) {
      const num = (key: keyof PracticeStatistics) =>
        typeof parsed[key] === "number" && (parsed[key] as number) >= 0
          ? (parsed[key] as number)
          : DEFAULT_PRACTICE_STATS[key as keyof PracticeStatistics];
      const stats: PracticeStatistics = {
        version: 2,
        matchesPlayed: num("matchesPlayed") as number,
        wins: num("wins") as number,
        losses: num("losses") as number,
        winPercentage: num("winPercentage") as number,
        currentWinStreak: num("currentWinStreak") as number,
        bestWinStreak: num("bestWinStreak") as number,
        roundsWon: num("roundsWon") as number,
        roundsLost: num("roundsLost") as number,
        tiedRounds: num("tiedRounds") as number,
        rockSelections: num("rockSelections") as number,
        paperSelections: num("paperSelections") as number,
        scissorsSelections: num("scissorsSelections") as number,
        automaticMoveCount: num("automaticMoveCount") as number,
        mostUsedMove:
          parsed.mostUsedMove === "rock" ||
          parsed.mostUsedMove === "paper" ||
          parsed.mostUsedMove === "scissors"
            ? parsed.mostUsedMove
            : null,
      };
      return {
        ...stats,
        mostUsedMove: computeMostUsedMove(stats),
        winPercentage: computeWinPercentage(stats.wins, stats.matchesPlayed),
      };
    }

    const matchesPlayed =
      typeof parsed.matchesPlayed === "number" ? parsed.matchesPlayed : 0;
    const wins = typeof parsed.matchesWon === "number" ? parsed.matchesWon : 0;
    const losses =
      typeof parsed.matchesLost === "number" ? parsed.matchesLost : 0;
    return {
      ...DEFAULT_PRACTICE_STATS,
      matchesPlayed,
      wins,
      losses,
      winPercentage: computeWinPercentage(wins, matchesPlayed),
      tiedRounds: typeof parsed.ties === "number" ? parsed.ties : 0,
      automaticMoveCount:
        typeof parsed.timeouts === "number" ? parsed.timeouts : 0,
    };
  } catch {
    return { ...DEFAULT_PRACTICE_STATS };
  }
}

export function readSettings(storage: Storage | null): UserSettings {
  if (!storage) return { ...DEFAULT_SETTINGS };
  const current = parseSettings(storage.getItem(SETTINGS_STORAGE_KEY));
  if (storage.getItem(SETTINGS_STORAGE_KEY)) return current;
  const legacy = parseSettings(storage.getItem(LEGACY_SETTINGS_KEY));
  writeSettings(storage, legacy);
  return legacy;
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
  const current = parsePracticeStats(
    storage.getItem(PRACTICE_STATS_STORAGE_KEY),
  );
  if (storage.getItem(PRACTICE_STATS_STORAGE_KEY)) return current;
  const legacy = parsePracticeStats(storage.getItem(LEGACY_STATS_KEY));
  writePracticeStats(storage, legacy);
  return legacy;
}

export function writePracticeStats(
  storage: Storage | null,
  stats: PracticeStatistics,
): void {
  if (!storage) return;
  storage.setItem(PRACTICE_STATS_STORAGE_KEY, JSON.stringify(stats));
}

export function resetPracticeStats(): PracticeStatistics {
  return { ...DEFAULT_PRACTICE_STATS };
}

type MatchHistoryEntry = {
  outcome: "player" | "cpu" | "tie";
  playerTimedOut: boolean;
  playerMove: Move;
};

export function recordPracticeMatchResult(
  stats: PracticeStatistics,
  winner: "player" | "cpu",
  history: MatchHistoryEntry[],
): PracticeStatistics {
  const wins = stats.wins + (winner === "player" ? 1 : 0);
  const losses = stats.losses + (winner === "cpu" ? 1 : 0);
  const matchesPlayed = stats.matchesPlayed + 1;
  const currentWinStreak = winner === "player" ? stats.currentWinStreak + 1 : 0;
  const bestWinStreak = Math.max(stats.bestWinStreak, currentWinStreak);

  let rockSelections = stats.rockSelections;
  let paperSelections = stats.paperSelections;
  let scissorsSelections = stats.scissorsSelections;
  let roundsWon = stats.roundsWon;
  let roundsLost = stats.roundsLost;
  let tiedRounds = stats.tiedRounds;
  let automaticMoveCount = stats.automaticMoveCount;

  for (const round of history) {
    if (round.playerMove === "rock") rockSelections += 1;
    if (round.playerMove === "paper") paperSelections += 1;
    if (round.playerMove === "scissors") scissorsSelections += 1;
    if (round.outcome === "player") roundsWon += 1;
    if (round.outcome === "cpu") roundsLost += 1;
    if (round.outcome === "tie") tiedRounds += 1;
    if (round.playerTimedOut) automaticMoveCount += 1;
  }

  const next: PracticeStatistics = {
    version: 2,
    matchesPlayed,
    wins,
    losses,
    winPercentage: computeWinPercentage(wins, matchesPlayed),
    currentWinStreak,
    bestWinStreak,
    roundsWon,
    roundsLost,
    tiedRounds,
    rockSelections,
    paperSelections,
    scissorsSelections,
    automaticMoveCount,
    mostUsedMove: null,
  };
  next.mostUsedMove = computeMostUsedMove(next);
  return next;
}

export function computeRemainingSeconds(
  startedAtMs: number,
  totalSeconds: number,
  nowMs: number,
): number {
  const elapsed = Math.floor((nowMs - startedAtMs) / 1000);
  return Math.max(0, totalSeconds - elapsed);
}

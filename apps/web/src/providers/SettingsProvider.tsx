"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  UserSettings,
  PracticeStatistics,
} from "@/lib/storage/local-storage";
import type { Move } from "@/features/practice/engine/practice-engine";
import {
  DEFAULT_PRACTICE_STATS,
  DEFAULT_SETTINGS,
  readPracticeStats,
  readSettings,
  writePracticeStats,
  writeSettings,
  recordPracticeMatchResult,
  resetPracticeStats,
} from "@/lib/storage/local-storage";

type SettingsContextValue = {
  settings: UserSettings;
  stats: PracticeStatistics;
  updateSettings: (patch: Partial<UserSettings>) => void;
  completeTutorial: () => void;
  recordMatch: (
    winner: "player" | "cpu",
    history: {
      outcome: "player" | "cpu" | "tie";
      playerTimedOut: boolean;
      playerMove: Move;
    }[],
  ) => void;
  resetStats: () => void;
  ready: boolean;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function applyDocumentSettings(settings: UserSettings) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme =
    settings.theme === "system"
      ? window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
      : settings.theme;
  document.documentElement.dataset.contrast = settings.highContrast
    ? "high"
    : "normal";
  document.documentElement.dataset.reducedMotion = settings.reducedMotion
    ? "true"
    : "false";
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<PracticeStatistics>(
    DEFAULT_PRACTICE_STATS,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadedSettings = readSettings(window.localStorage);
    const loadedStats = readPracticeStats(window.localStorage);
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const merged = {
      ...loadedSettings,
      reducedMotion: loadedSettings.reducedMotion || prefersReducedMotion,
    };
    // Hydrate client preferences once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage hydration
    setSettings(merged);
    setStats(loadedStats);
    applyDocumentSettings(merged);
    setReady(true);
  }, []);

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      writeSettings(window.localStorage, next);
      applyDocumentSettings(next);
      return next;
    });
  }, []);

  const completeTutorial = useCallback(() => {
    updateSettings({ tutorialCompleted: true });
  }, [updateSettings]);

  const recordMatch = useCallback(
    (
      winner: "player" | "cpu",
      history: {
        outcome: "player" | "cpu" | "tie";
        playerTimedOut: boolean;
        playerMove: Move;
      }[],
    ) => {
      setStats((current) => {
        const next = recordPracticeMatchResult(current, winner, history);
        writePracticeStats(window.localStorage, next);
        return next;
      });
    },
    [],
  );

  const resetStats = useCallback(() => {
    const next = resetPracticeStats();
    writePracticeStats(window.localStorage, next);
    setStats(next);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      stats,
      updateSettings,
      completeTutorial,
      recordMatch,
      resetStats,
      ready,
    }),
    [
      settings,
      stats,
      updateSettings,
      completeTutorial,
      recordMatch,
      resetStats,
      ready,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}

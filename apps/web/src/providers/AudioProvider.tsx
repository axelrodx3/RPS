"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import type { SoundId } from "@/lib/audio/sound-registry";
import { audioEngine, type AudioLevels } from "@/lib/audio/audio-engine";
import { useSettings } from "./SettingsProvider";

type AudioContextValue = {
  play: (id: SoundId) => void;
  unlock: () => void;
  stopAll: () => void;
  stopSelectionCountdown: () => void;
  stopMoveLockSounds: () => void;
  stopPhaseCues: () => void;
  levels: AudioLevels;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();

  const levels = useMemo<AudioLevels>(
    () => ({
      masterVolume: settings.masterVolume,
      sfxVolume: settings.sfxVolume,
      musicVolume: settings.musicVolume,
      masterMuted: settings.masterMuted,
      sfxMuted: settings.sfxMuted,
      musicMuted: settings.musicMuted,
    }),
    [settings],
  );

  const play = useCallback(
    (id: SoundId) => {
      audioEngine.play(id, levels);
    },
    [levels],
  );

  const unlock = useCallback(() => {
    audioEngine.unlock();
  }, []);

  const stopAll = useCallback(() => {
    audioEngine.stopAll();
  }, []);

  const stopSelectionCountdown = useCallback(() => {
    audioEngine.stopSelectionCountdown();
  }, []);

  const stopMoveLockSounds = useCallback(() => {
    audioEngine.stopMoveLockSounds();
  }, []);

  const stopPhaseCues = useCallback(() => {
    audioEngine.stopPhaseCues();
  }, []);

  const value = useMemo(
    () => ({
      play,
      unlock,
      stopAll,
      stopSelectionCountdown,
      stopMoveLockSounds,
      stopPhaseCues,
      levels,
    }),
    [
      play,
      unlock,
      stopAll,
      stopSelectionCountdown,
      stopMoveLockSounds,
      stopPhaseCues,
      levels,
    ],
  );

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}

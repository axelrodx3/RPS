"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import type { SoundId } from "@/lib/audio/audio-engine";
import { audioEngine } from "@/lib/audio/audio-engine";
import { useSettings } from "./SettingsProvider";

type AudioContextValue = {
  play: (id: SoundId) => void;
  unlock: () => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();

  const play = useCallback(
    (id: SoundId) => {
      audioEngine.play(id, settings.volume, settings.muted);
    },
    [settings.muted, settings.volume],
  );

  const unlock = useCallback(() => {
    audioEngine.unlock();
  }, []);

  const value = useMemo(() => ({ play, unlock }), [play, unlock]);

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

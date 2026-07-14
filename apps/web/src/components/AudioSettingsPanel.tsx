"use client";

import { Slider, Toggle } from "@/design-system/components";
import { useSettings } from "@/providers/SettingsProvider";
import { useAudio } from "@/providers/AudioProvider";
import styles from "./audio-settings-panel.module.css";

type AudioSettingsPanelProps = {
  layout?: "compact" | "drawer";
  onChange?: () => void;
};

export function AudioSettingsPanel({
  layout = "compact",
  onChange,
}: AudioSettingsPanelProps) {
  const { settings, updateSettings } = useSettings();
  const { play, unlock } = useAudio();

  const patch = (next: Parameters<typeof updateSettings>[0]) => {
    unlock();
    updateSettings(next);
    onChange?.();
  };

  return (
    <div
      className={`${styles.panel} ${layout === "drawer" ? styles.drawer : ""}`.trim()}
      aria-label="Audio settings"
    >
      <p className={styles.title}>Audio settings</p>
      <Toggle
        label="Master mute"
        checked={settings.masterMuted}
        onChange={(masterMuted) => {
          patch({ masterMuted });
          play("button");
        }}
      />
      <Slider
        label="Master volume"
        value={settings.masterVolume}
        onChange={(masterVolume) => patch({ masterVolume, masterMuted: false })}
      />
      <Toggle
        label="Sound effects mute"
        checked={settings.sfxMuted}
        onChange={(sfxMuted) => {
          patch({ sfxMuted });
          play("button");
        }}
      />
      <Slider
        label="Sound effects volume"
        value={settings.sfxVolume}
        onChange={(sfxVolume) => patch({ sfxVolume, sfxMuted: false })}
      />
      <Toggle
        label="Music mute"
        checked={settings.musicMuted}
        onChange={(musicMuted) => patch({ musicMuted })}
      />
      <Slider
        label="Music volume"
        value={settings.musicVolume}
        onChange={(musicVolume) => patch({ musicVolume, musicMuted: false })}
      />
      <p className={styles.note}>
        Music playback stays disabled until an approved track is added.
      </p>
    </div>
  );
}

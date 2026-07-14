"use client";

import { useEffect, useRef, useState } from "react";
import { Slider, Toggle } from "@/design-system/components";
import { useSettings } from "@/providers/SettingsProvider";
import { useAudio } from "@/providers/AudioProvider";
import styles from "./audio-control.module.css";

export function AudioControl() {
  const { settings, updateSettings } = useSettings();
  const { play, unlock } = useAudio();
  const [panelOpen, setPanelOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [panelOpen]);

  const toggleMute = () => {
    unlock();
    updateSettings({ muted: !settings.muted });
    play("button");
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.iconButton}
        aria-label={settings.muted ? "Unmute audio" : "Mute audio"}
        aria-expanded={panelOpen}
        aria-controls="audio-panel"
        onClick={() => {
          unlock();
          if (window.matchMedia("(max-width: 880px)").matches) {
            setPanelOpen((open) => !open);
            return;
          }
          toggleMute();
        }}
        onMouseEnter={() => {
          if (!window.matchMedia("(max-width: 880px)").matches) {
            setPanelOpen(true);
          }
        }}
      >
        {settings.muted ? "🔇" : "🔊"}
      </button>

      <div
        id="audio-panel"
        className={`${styles.panel} ${panelOpen ? styles.open : ""}`.trim()}
        onMouseLeave={() => {
          if (!window.matchMedia("(max-width: 880px)").matches) {
            setPanelOpen(false);
          }
        }}
      >
        <Toggle
          label="Mute"
          checked={settings.muted}
          onChange={(muted) => {
            unlock();
            updateSettings({ muted });
          }}
        />
        <Slider
          label="Volume"
          value={settings.volume}
          onChange={(volume) => {
            unlock();
            updateSettings({ volume, muted: false });
            play("button");
          }}
        />
      </div>
    </div>
  );
}

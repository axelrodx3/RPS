"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useSettings } from "@/providers/SettingsProvider";
import { useAudio } from "@/providers/AudioProvider";
import { AudioSettingsPanel } from "@/components/AudioSettingsPanel";
import styles from "./audio-control.module.css";

const MOBILE_QUERY = "(max-width: 880px)";

function useIsMobile() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const sync = () => setMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return mobile;
}

export function AudioControl() {
  const { settings, updateSettings } = useSettings();
  const { play, unlock } = useAudio();
  const [panelOpen, setPanelOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const isMobile = useIsMobile();

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!panelOpen || isMobile) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closePanel();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [panelOpen, isMobile, closePanel]);

  const toggleMasterMute = () => {
    unlock();
    updateSettings({ masterMuted: !settings.masterMuted });
    play("button");
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.iconButton}
        aria-label={
          settings.masterMuted ? "Unmute master audio" : "Mute master audio"
        }
        aria-expanded={!isMobile && panelOpen}
        aria-controls={!isMobile ? panelId : undefined}
        onClick={() => {
          unlock();
          if (isMobile) {
            toggleMasterMute();
            return;
          }
          setPanelOpen((open) => !open);
        }}
        onMouseEnter={() => {
          if (!isMobile) setPanelOpen(true);
        }}
      >
        {settings.masterMuted ? "🔇" : "🔊"}
      </button>

      {!isMobile ? (
        <div
          id={panelId}
          className={`${styles.panel} ${panelOpen ? styles.open : ""}`.trim()}
          onMouseLeave={() => setPanelOpen(false)}
        >
          <AudioSettingsPanel onChange={() => play("button")} />
        </div>
      ) : null}
    </div>
  );
}

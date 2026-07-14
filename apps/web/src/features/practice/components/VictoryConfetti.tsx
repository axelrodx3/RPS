"use client";

import { useSettings } from "@/providers/SettingsProvider";
import styles from "./practice-game.module.css";

type VictoryConfettiProps = {
  active: boolean;
};

export function VictoryConfetti({ active }: VictoryConfettiProps) {
  const { settings } = useSettings();

  if (!active || settings.reducedMotion) {
    return null;
  }

  return (
    <div className={styles.confettiOverlay} aria-hidden="true">
      <object
        className={styles.confettiObject}
        data="/assets/animations/confetti-victory.svg"
        type="image/svg+xml"
        tabIndex={-1}
      />
    </div>
  );
}

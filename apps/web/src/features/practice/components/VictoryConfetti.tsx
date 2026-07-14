"use client";

import { useSettings } from "@/providers/SettingsProvider";
import styles from "./practice-game.module.css";

type VictoryConfettiProps = {
  active: boolean;
  matchKey: string;
};

export function VictoryConfetti({ active, matchKey }: VictoryConfettiProps) {
  const { settings } = useSettings();

  if (!active || settings.reducedMotion) {
    return null;
  }

  return (
    <div className={styles.confettiOverlay} aria-hidden="true">
      <object
        key={matchKey}
        className={styles.confettiObject}
        data="/assets/animations/confetti-victory.svg"
        type="image/svg+xml"
        tabIndex={-1}
      />
    </div>
  );
}

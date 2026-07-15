"use client";

import { LeaderboardPanel } from "@/features/practice/components/LeaderboardPanel";
import { useSettings } from "@/providers/SettingsProvider";
import styles from "./leaderboards-page.module.css";

export function LeaderboardsPageContent() {
  const { settings } = useSettings();

  return (
    <div className={styles.page}>
      <LeaderboardPanel reducedMotion={settings.reducedMotion} variant="page" />
    </div>
  );
}

"use client";

import { ProfilePanel } from "@/features/profile/components/ProfilePanel";
import { useSettings } from "@/providers/SettingsProvider";
import styles from "./profile-page.module.css";

export function ProfilePageContent() {
  const { settings } = useSettings();

  return (
    <div className={styles.page}>
      <ProfilePanel reducedMotion={settings.reducedMotion} />
    </div>
  );
}

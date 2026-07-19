"use client";

import { MyStatsPanel } from "@/features/practice/components/MyStatsPanel";
import type { ProfileNavigationState } from "@/features/profile/profile-navigation";

type ProfileStatsTabProps = {
  animate: boolean;
  reducedMotion: boolean;
  onNavigationChange: (navigation: ProfileNavigationState) => void;
};

export function ProfileStatsTab({
  animate,
  reducedMotion,
  onNavigationChange,
}: ProfileStatsTabProps) {
  return (
    <MyStatsPanel
      animate={animate}
      reducedMotion={reducedMotion}
      showReset={false}
      variant="profile"
      onNavigationChange={onNavigationChange}
    />
  );
}

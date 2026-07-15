"use client";

import { MyStatsPanel } from "@/features/practice/components/MyStatsPanel";

type ProfileStatsTabProps = {
  animate: boolean;
  reducedMotion: boolean;
};

export function ProfileStatsTab({
  animate,
  reducedMotion,
}: ProfileStatsTabProps) {
  return (
    <MyStatsPanel
      animate={animate}
      reducedMotion={reducedMotion}
      showReset={false}
    />
  );
}

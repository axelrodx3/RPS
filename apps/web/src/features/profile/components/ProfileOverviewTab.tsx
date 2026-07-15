"use client";

import { useMemo } from "react";
import { PlayerAvatar } from "@/features/identity/components/PlayerAvatar";
import { MoveArt } from "@/features/practice/components/battle-arena/MoveArt";
import {
  buildStatsMetrics,
  mapPracticeStatsToViewModel,
} from "@/features/practice/stats/map-practice-stats";
import {
  DEFAULT_LOCAL_PROFILE,
  getProfileRankName,
  type LocalProfile,
} from "@/features/profile/profile-model";
import { useSettings } from "@/providers/SettingsProvider";
import styles from "../profile-panel.module.css";

type ProfileOverviewTabProps = {
  profile?: LocalProfile;
};

export function ProfileOverviewTab({
  profile = DEFAULT_LOCAL_PROFILE,
}: ProfileOverviewTabProps) {
  const { stats } = useSettings();
  const viewModel = useMemo(() => mapPracticeStatsToViewModel(stats), [stats]);
  const summaryMetrics = useMemo(
    () => buildStatsMetrics(viewModel).slice(0, 3),
    [viewModel],
  );

  const equippedItems = [
    {
      label: "Equipped Avatar",
      tier: "Tier 1",
      content: <PlayerAvatar avatarId={profile.equipped.avatarId} />,
    },
    {
      label: "Equipped Rock",
      tier: "Tier 1",
      content: (
        <MoveArt
          move="rock"
          variant="timeline"
          skinId={profile.equipped.rockSkinId}
        />
      ),
    },
    {
      label: "Equipped Paper",
      tier: "Tier 1",
      content: (
        <MoveArt
          move="paper"
          variant="timeline"
          skinId={profile.equipped.paperSkinId}
        />
      ),
    },
    {
      label: "Equipped Scissors",
      tier: "Tier 1",
      content: (
        <MoveArt
          move="scissors"
          variant="timeline"
          skinId={profile.equipped.scissorsSkinId}
        />
      ),
    },
  ];

  return (
    <div className={styles.overviewGrid}>
      <div className={styles.identityCard}>
        <div className={styles.identityAvatar}>
          <PlayerAvatar avatarId={profile.avatarId} />
        </div>
        <div className={styles.identityCopy}>
          <p className={styles.sectionKicker}>Profile overview</p>
          <h2 className={styles.identityName}>{profile.username}</h2>
          <div className={styles.identityMeta}>
            <span className={styles.metaPill}>Level {profile.level}</span>
            <span className={styles.metaPill}>{profile.xp} XP</span>
            <span className={styles.metaPill}>
              {getProfileRankName(profile)}
            </span>
          </div>
          <p className={styles.sectionNote}>
            Local profile preview only. Account sync, authentication, and reward
            earning arrive in later phases.
          </p>
        </div>
      </div>

      <div className={styles.equippedGrid}>
        <section className={styles.equippedCard}>
          <h3>Equipped cosmetics</h3>
          {equippedItems.map((item) => (
            <div key={item.label} className={styles.equippedItem}>
              <div className={styles.equippedPreview}>{item.content}</div>
              <div>
                <p className={styles.equippedLabel}>{item.label}</p>
                <p className={styles.equippedTier}>{item.tier}</p>
              </div>
            </div>
          ))}
        </section>

        <section className={styles.summaryCard}>
          <h3>Practice performance</h3>
          <div className={styles.summaryMetrics}>
            {summaryMetrics.map((metric) => (
              <div key={metric.id} className={styles.summaryMetric}>
                <p className={styles.summaryMetricLabel}>{metric.label}</p>
                <p className={styles.summaryMetricValue}>{metric.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

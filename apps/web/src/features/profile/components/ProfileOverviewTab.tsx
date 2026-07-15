"use client";

import { useMemo } from "react";
import { PlayerAvatar } from "@/features/identity/components/PlayerAvatar";
import { getPlayerAvatar } from "@/features/identity/avatar-registry";
import { MoveArt } from "@/features/practice/components/battle-arena/MoveArt";
import { resolveMoveSkin } from "@/features/practice/moves/move-asset-registry";
import {
  buildStatsMetrics,
  mapPracticeStatsToViewModel,
} from "@/features/practice/stats/map-practice-stats";
import {
  DEFAULT_LOCAL_PROFILE,
  getProfileRankName,
  getProfileXpProgress,
  getProfileXpRemaining,
  NEXT_REWARD_PREVIEW,
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

  const xpProgress = getProfileXpProgress(profile);
  const xpRemaining = getProfileXpRemaining(profile);
  const rankName = getProfileRankName(profile);
  const avatar = getPlayerAvatar(profile.avatarId);
  const rockSkin = resolveMoveSkin("rock", profile.equipped.rockSkinId);
  const paperSkin = resolveMoveSkin("paper", profile.equipped.paperSkinId);
  const scissorsSkin = resolveMoveSkin(
    "scissors",
    profile.equipped.scissorsSkinId,
  );

  const loadoutCards = [
    {
      label: "Avatar",
      name: avatar.displayName,
      tier: avatar.tier,
      content: <PlayerAvatar avatarId={profile.equipped.avatarId} size={72} />,
    },
    {
      label: "Rock",
      name: rockSkin.displayName,
      tier: rockSkin.tier,
      content: (
        <MoveArt
          move="rock"
          variant="arena"
          skinId={profile.equipped.rockSkinId}
        />
      ),
    },
    {
      label: "Paper",
      name: paperSkin.displayName,
      tier: paperSkin.tier,
      content: (
        <MoveArt
          move="paper"
          variant="arena"
          skinId={profile.equipped.paperSkinId}
        />
      ),
    },
    {
      label: "Scissors",
      name: scissorsSkin.displayName,
      tier: scissorsSkin.tier,
      content: (
        <MoveArt
          move="scissors"
          variant="arena"
          skinId={profile.equipped.scissorsSkinId}
        />
      ),
    },
  ];

  return (
    <div className={styles.overviewGrid}>
      <section className={styles.heroCard} aria-label="Player identity">
        <div className={styles.heroMain}>
          <div className={styles.heroAvatarFrame}>
            <PlayerAvatar avatarId={profile.avatarId} size={112} />
          </div>
          <div className={styles.heroIdentity}>
            <h2 className={styles.heroName}>{profile.username}</h2>
            <div className={styles.heroMeta}>
              <span className={styles.heroMetaPill}>Level {profile.level}</span>
              <span className={styles.heroMetaPill}>{rankName}</span>
              <span className={styles.heroMetaPill}>{profile.xp} XP</span>
            </div>
            <div className={styles.heroXpBlock}>
              <div className={styles.xpLabelRow}>
                <span>Level {profile.level}</span>
                <span>
                  {profile.xp} / {profile.xpToNextLevel} XP
                </span>
              </div>
              <div
                className={styles.heroXpTrack}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={profile.xpToNextLevel}
                aria-valuenow={profile.xp}
                aria-label={`Level ${profile.level} progress`}
              >
                <div
                  className={styles.heroXpFill}
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
            <p className={styles.sectionNote}>
              Local profile preview only. Account sync, authentication, and
              reward earning arrive in later phases.
            </p>
          </div>
        </div>

        <aside className={styles.nextRewardCard} aria-label="Next reward">
          <p className={styles.nextRewardKicker}>Next reward</p>
          <p className={styles.nextRewardName}>{NEXT_REWARD_PREVIEW.label}</p>
          <p className={styles.nextRewardRemaining}>
            {xpRemaining} XP remaining
          </p>
          <div
            className={styles.nextRewardTrack}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={profile.xpToNextLevel}
            aria-valuenow={profile.xp}
            aria-label="Progress to next reward"
          >
            <div
              className={styles.nextRewardFill}
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </aside>
      </section>

      <div className={styles.overviewColumns}>
        <section
          className={styles.loadoutSection}
          aria-labelledby="loadout-heading"
        >
          <h3 id="loadout-heading">Equipped loadout</h3>
          <div className={styles.loadoutGrid}>
            {loadoutCards.map((card) => (
              <article key={card.label} className={styles.loadoutCard}>
                <div className={styles.loadoutArt}>{card.content}</div>
                <div className={styles.loadoutCopy}>
                  <p className={styles.loadoutLabel}>{card.label}</p>
                  <p className={styles.loadoutName}>{card.name}</p>
                  <p className={styles.loadoutTier}>Tier {card.tier}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className={styles.snapshotSection}
          aria-labelledby="snapshot-heading"
        >
          <h3 id="snapshot-heading">Performance snapshot</h3>
          <div className={styles.snapshotMetrics}>
            {summaryMetrics.map((metric) => (
              <div key={metric.id} className={styles.snapshotMetric}>
                <p className={styles.snapshotMetricLabel}>{metric.label}</p>
                <p className={styles.snapshotMetricValue}>{metric.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

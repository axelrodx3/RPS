"use client";

import { useMemo } from "react";
import { getPlayerAvatar } from "@/features/identity/avatar-registry";
import { AvatarPreview } from "@/features/profile/components/AvatarPreview";
import { MoveSkinPreview } from "@/features/profile/components/MoveSkinPreview";
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

function buildAvatarAccessibleLabel(displayName: string, tier: number): string {
  return `${displayName}. Tier ${tier}. Equipped.`;
}

function buildMoveAccessibleLabel(displayName: string, tier: number): string {
  return `${displayName}. Tier ${tier}. Equipped.`;
}

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
      content: (
        <AvatarPreview
          avatarId={profile.equipped.avatarId}
          accessibleLabel={buildAvatarAccessibleLabel(
            avatar.displayName,
            avatar.tier,
          )}
        />
      ),
    },
    {
      label: "Rock",
      name: rockSkin.displayName,
      tier: rockSkin.tier,
      content: (
        <MoveSkinPreview
          move="rock"
          skinId={profile.equipped.rockSkinId}
          accessibleLabel={buildMoveAccessibleLabel(
            rockSkin.displayName,
            rockSkin.tier,
          )}
        />
      ),
    },
    {
      label: "Paper",
      name: paperSkin.displayName,
      tier: paperSkin.tier,
      content: (
        <MoveSkinPreview
          move="paper"
          skinId={profile.equipped.paperSkinId}
          accessibleLabel={buildMoveAccessibleLabel(
            paperSkin.displayName,
            paperSkin.tier,
          )}
        />
      ),
    },
    {
      label: "Scissors",
      name: scissorsSkin.displayName,
      tier: scissorsSkin.tier,
      content: (
        <MoveSkinPreview
          move="scissors"
          skinId={profile.equipped.scissorsSkinId}
          accessibleLabel={buildMoveAccessibleLabel(
            scissorsSkin.displayName,
            scissorsSkin.tier,
          )}
        />
      ),
    },
  ];

  return (
    <div className={styles.overviewGrid}>
      <section
        className={styles.heroCard}
        aria-label="Player identity"
        data-rank={profile.rankId}
      >
        <div className={styles.heroMain}>
          <div
            className={styles.heroAvatarFrame}
            data-rank-glow={profile.rankId}
          >
            <AvatarPreview
              avatarId={profile.avatarId}
              accessibleLabel={`${profile.username} equipped avatar`}
            />
          </div>
          <div className={styles.heroIdentity}>
            <p className={styles.heroEyebrow}>Player identity</p>
            <h2 className={styles.heroName}>{profile.username}</h2>
            <div className={styles.heroMeta}>
              <span className={styles.heroMetaPill}>Level {profile.level}</span>
              <span
                className={styles.heroRankBadge}
                aria-label={`Competitive rank ${rankName}`}
              >
                {rankName}
              </span>
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
                <p className={styles.loadoutLabel}>{card.label}</p>
                <div className={styles.loadoutArt}>{card.content}</div>
                <div className={styles.loadoutCopy}>
                  <p className={styles.loadoutName}>{card.name}</p>
                  <p className={styles.loadoutTier}>Tier {card.tier}</p>
                  <span className={styles.loadoutEquippedBadge}>Equipped</span>
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

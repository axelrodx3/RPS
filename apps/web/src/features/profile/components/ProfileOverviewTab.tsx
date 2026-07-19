"use client";

import { useMemo, useRef } from "react";
import { Button } from "@/design-system/components";
import { getPlayerAvatar } from "@/features/identity/avatar-registry";
import { AvatarPreview } from "@/features/profile/components/AvatarPreview";
import { MoveSkinPreview } from "@/features/profile/components/MoveSkinPreview";
import { ProfileProgressBar } from "@/features/profile/components/ProfileProgressBar";
import type { Move } from "@/features/practice/engine/practice-engine";
import {
  buildStatsMetrics,
  mapPracticeStatsToViewModel,
} from "@/features/practice/stats/map-practice-stats";
import {
  getProfileRankName,
  getProfileXpRemaining,
  NEXT_REWARD_PREVIEW,
  OVERVIEW_SUMMARY_METRIC_IDS,
} from "@/features/profile/profile-model";
import type { ProfileNavigationState } from "@/features/profile/profile-navigation";
import {
  resolveEquippedMoveSkin,
  useProfile,
} from "@/providers/ProfileProvider";
import { useSettings } from "@/providers/SettingsProvider";
import styles from "../profile-panel.module.css";

type ProfileOverviewTabProps = {
  reducedMotion: boolean;
  onNavigationChange: (navigation: ProfileNavigationState) => void;
};

function buildAvatarAccessibleLabel(displayName: string, tier: number): string {
  return `${displayName}. Tier ${tier}. Equipped.`;
}

function buildMoveAccessibleLabel(displayName: string, tier: number): string {
  return `${displayName}. Tier ${tier}. Equipped.`;
}

export function ProfileOverviewTab({
  reducedMotion,
  onNavigationChange,
}: ProfileOverviewTabProps) {
  const avatarHeroRef = useRef<HTMLButtonElement>(null);
  const { stats } = useSettings();
  const { profile, openPreview, navigateToUnlockItem } = useProfile();

  const viewModel = useMemo(() => mapPracticeStatsToViewModel(stats), [stats]);
  const summaryMetrics = useMemo(() => {
    const metrics = buildStatsMetrics(viewModel);
    return OVERVIEW_SUMMARY_METRIC_IDS.map((id) =>
      metrics.find((metric) => metric.id === id)!,
    ).filter(Boolean);
  }, [viewModel]);

  const xpRemaining = getProfileXpRemaining(profile);
  const rankName = getProfileRankName(profile);
  const avatar = getPlayerAvatar(profile.equipped.avatarId);
  const rockSkin = resolveEquippedMoveSkin(
    "rock",
    profile.equipped.rockSkinId,
    profile.unlockedRockSkinIds,
  );
  const paperSkin = resolveEquippedMoveSkin(
    "paper",
    profile.equipped.paperSkinId,
    profile.unlockedPaperSkinIds,
  );
  const scissorsSkin = resolveEquippedMoveSkin(
    "scissors",
    profile.equipped.scissorsSkinId,
    profile.unlockedScissorsSkinIds,
  );

  const loadoutCards: {
    label: string;
    name: string;
    tier: number;
    target: {
      kind: "avatar" | Move;
      itemId: string;
      category: "avatars" | Move;
    };
    content: React.ReactNode;
  }[] = [
    {
      label: "Avatar",
      name: avatar.displayName,
      tier: avatar.tier,
      target: {
        kind: "avatar",
        itemId: profile.equipped.avatarId,
        category: "avatars",
      },
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
      target: {
        kind: "rock",
        itemId: profile.equipped.rockSkinId,
        category: "rock",
      },
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
      target: {
        kind: "paper",
        itemId: profile.equipped.paperSkinId,
        category: "paper",
      },
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
      target: {
        kind: "scissors",
        itemId: profile.equipped.scissorsSkinId,
        category: "scissors",
      },
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
    <div className={styles.overviewCompact}>
      <div className={styles.overviewTopRow}>
        <section className={styles.identityPanel} aria-label="Player identity">
          <button
            ref={avatarHeroRef}
            type="button"
            className={styles.identityAvatarButton}
            onClick={() =>
              openPreview(
                {
                  kind: "avatar",
                  itemId: profile.equipped.avatarId,
                  category: "avatars",
                },
                avatarHeroRef,
              )
            }
            aria-label={`Open ${profile.username} avatar preview`}
          >
            <div
              className={styles.heroAvatarFrame}
              data-rank-glow={profile.rankId}
            >
              <AvatarPreview
                avatarId={profile.equipped.avatarId}
                accessibleLabel={`${profile.username} equipped avatar`}
              />
            </div>
          </button>

          <div className={styles.identityCopy}>
            <p className={styles.localProfileLabel}>Local profile</p>
            <h2 className={styles.heroName}>{profile.username}</h2>
            <div className={styles.heroMeta}>
              <span className={styles.heroMetaPill}>Level {profile.level}</span>
              <span className={styles.heroRankBadge}>{rankName}</span>
              <span className={styles.heroMetaPill}>{profile.xp} XP</span>
            </div>
            <div className={styles.heroXpBlock}>
              <div className={styles.xpLabelRow}>
                <span>Level {profile.level}</span>
                <span>
                  {profile.xp} / {profile.xpToNextLevel} XP
                </span>
              </div>
              <ProfileProgressBar
                value={profile.xp}
                max={profile.xpToNextLevel}
                label={`Level ${profile.level} progress`}
                reducedMotion={reducedMotion}
              />
            </div>
            <Button variant="ghost" size="sm" disabled>
              Edit profile
            </Button>
          </div>
        </section>

        <aside className={styles.nextRewardPanel} aria-label="Next reward">
          <p className={styles.nextRewardKicker}>Next reward</p>
          <button
            type="button"
            className={styles.nextRewardPreviewButton}
            onClick={() =>
              onNavigationChange(
                navigateToUnlockItem(
                  NEXT_REWARD_PREVIEW.category,
                  NEXT_REWARD_PREVIEW.itemId,
                ),
              )
            }
          >
            <div className={styles.nextRewardArt}>
              <AvatarPreview
                avatarId={NEXT_REWARD_PREVIEW.itemId}
                accessibleLabel={NEXT_REWARD_PREVIEW.label}
                locked
              />
            </div>
            <div className={styles.nextRewardCopy}>
              <p className={styles.nextRewardName}>
                {NEXT_REWARD_PREVIEW.label}
              </p>
              <p className={styles.nextRewardRequirement}>
                Level {NEXT_REWARD_PREVIEW.level}
              </p>
              <p className={styles.nextRewardRemaining}>
                {xpRemaining} XP remaining
              </p>
              <ProfileProgressBar
                value={profile.xp}
                max={profile.xpToNextLevel}
                label="Progress to next reward"
                reducedMotion={reducedMotion}
                compact
              />
            </div>
          </button>
        </aside>
      </div>

      <div className={styles.overviewBottomRow}>
        <section
          className={styles.loadoutSection}
          aria-labelledby="loadout-heading"
        >
          <h3 id="loadout-heading">Equipped loadout</h3>
          <div className={styles.loadoutGrid}>
            {loadoutCards.map((card) => (
              <button
                key={card.label}
                type="button"
                className={styles.loadoutCard}
                onClick={() =>
                  openPreview({
                    kind:
                      card.target.kind === "avatar"
                        ? "avatar"
                        : card.target.kind,
                    itemId: card.target.itemId,
                    category:
                      card.target.category === "avatars"
                        ? "avatars"
                        : card.target.category,
                  })
                }
              >
                <span className={styles.loadoutLabel}>{card.label}</span>
                <div className={styles.loadoutArt}>{card.content}</div>
                <div className={styles.loadoutCopy}>
                  <p className={styles.loadoutName}>{card.name}</p>
                  <span className={styles.loadoutEquippedBadge}>Equipped</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section
          className={styles.snapshotSection}
          aria-labelledby="snapshot-heading"
        >
          <h3 id="snapshot-heading">Performance snapshot</h3>
          <div className={styles.snapshotMetricsCompact}>
            {summaryMetrics.map((metric) => (
              <div key={metric.id} className={styles.snapshotMetricCompact}>
                <span
                  className={styles.statsMetricIcon}
                  data-icon={metric.iconKey}
                  aria-hidden="true"
                />
                <p className={styles.snapshotMetricValue}>{metric.value}</p>
                <p className={styles.snapshotMetricLabel}>{metric.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

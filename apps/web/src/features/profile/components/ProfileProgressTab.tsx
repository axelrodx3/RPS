"use client";

import { AvatarPreview } from "@/features/profile/components/AvatarPreview";
import { MoveSkinPreview } from "@/features/profile/components/MoveSkinPreview";
import { ProfileProgressBar } from "@/features/profile/components/ProfileProgressBar";
import {
  getProfileRankName,
  getProfileXpRemaining,
  NEXT_REWARD_PREVIEW,
  PROFILE_REWARD_ROADMAP,
} from "@/features/profile/profile-model";
import {
  getRankStepState,
  RANK_LADDER,
} from "@/features/profile/rank-registry";
import type { ProfileNavigationState } from "@/features/profile/profile-navigation";
import { useProfile } from "@/providers/ProfileProvider";
import styles from "../profile-panel.module.css";

type ProfileProgressTabProps = {
  reducedMotion: boolean;
  onNavigationChange: (navigation: ProfileNavigationState) => void;
};

function rankBadgeLabel(state: ReturnType<typeof getRankStepState>): string {
  switch (state) {
    case "completed":
      return "Completed";
    case "current":
      return "Current";
    case "highest":
      return "Highest rank";
    case "locked":
      return "Locked";
  }
}

function rankBadgeClass(state: ReturnType<typeof getRankStepState>): string {
  switch (state) {
    case "completed":
      return styles.rankBadgeCompleted ?? "";
    case "current":
      return styles.rankBadgeCurrent ?? "";
    case "highest":
      return styles.rankBadgeHighest ?? "";
    case "locked":
      return styles.rankBadgeLocked ?? "";
  }
}

export function ProfileProgressTab({
  reducedMotion,
  onNavigationChange,
}: ProfileProgressTabProps) {
  const { profile, openPreview, navigateToUnlockItem } = useProfile();
  const xpRemaining = getProfileXpRemaining(profile);
  const currentRank = getProfileRankName(profile);

  return (
    <div className={styles.progressLayout}>
      <section
        className={styles.progressBlock}
        aria-labelledby="account-progression-heading"
      >
        <div className={styles.progressBlockHeader}>
          <h2
            id="account-progression-heading"
            className={styles.progressHeading}
          >
            Account progression
          </h2>
          <p className={styles.sectionNote}>
            Preview progression values only. XP earning is not active yet.
          </p>
        </div>

        <div className={styles.accountProgressGrid}>
          <div className={styles.accountStat}>
            <p className={styles.accountStatLabel}>Level</p>
            <p className={styles.accountStatValue}>{profile.level}</p>
          </div>
          <div className={styles.accountStat}>
            <p className={styles.accountStatLabel}>XP</p>
            <p className={styles.accountStatValue}>{profile.xp}</p>
          </div>
          <div className={styles.accountStat}>
            <p className={styles.accountStatLabel}>Next level</p>
            <p className={styles.accountStatValue}>{profile.level + 1}</p>
          </div>
        </div>

        <div className={styles.xpBlock}>
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

        <div className={styles.rewardTrack} aria-label="Reward roadmap">
          <p className={styles.sectionKicker}>Reward track</p>
          {PROFILE_REWARD_ROADMAP.map((milestone, index) => {
            const upcoming = profile.level < milestone.level;
            const previewKind =
              milestone.category === "avatars" ? "avatar" : milestone.category;
            return (
              <button
                key={milestone.level}
                type="button"
                className={styles.rewardTrackStep}
                onClick={() =>
                  openPreview({
                    kind: previewKind,
                    itemId: milestone.itemId,
                    category: milestone.category,
                  })
                }
              >
                <span className={styles.rewardTrackLevel}>
                  Level {milestone.level}
                </span>
                <span className={styles.rewardTrackArt}>
                  {milestone.category === "avatars" ? (
                    <AvatarPreview
                      avatarId={milestone.itemId}
                      accessibleLabel={milestone.reward}
                      locked={upcoming}
                    />
                  ) : (
                    <MoveSkinPreview
                      move={milestone.category}
                      skinId={milestone.itemId}
                      accessibleLabel={milestone.reward}
                    />
                  )}
                </span>
                <span className={styles.rewardTrackCopy}>
                  <span className={styles.rewardTrackName}>
                    {milestone.reward}
                  </span>
                  <span className={styles.rewardTrackState}>
                    {upcoming ? "Upcoming" : "Preview"}
                  </span>
                </span>
                {index < PROFILE_REWARD_ROADMAP.length - 1 ? (
                  <span
                    className={styles.rewardTrackConnector}
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section
        className={styles.progressBlock}
        aria-labelledby="competitive-rank-heading"
      >
        <div className={styles.progressBlockHeader}>
          <h2 id="competitive-rank-heading" className={styles.progressHeading}>
            Competitive rank
          </h2>
          <p className={styles.sectionNote}>
            Competitive ranking becomes available with online competitive play.
          </p>
        </div>

        <div className={styles.currentRankBanner}>
          <p className={styles.currentRankLabel}>Current rank</p>
          <p className={styles.currentRankValue}>{currentRank}</p>
        </div>

        <div className={styles.rankLadderCompact} aria-label="Rank ladder">
          {RANK_LADDER.map((rank) => {
            const state = getRankStepState(rank, profile.rankId);
            return (
              <div
                key={rank.id}
                className={[
                  styles.rankStepCompact,
                  state === "current" ? styles.rankStepCurrent : "",
                  state === "completed" ? styles.rankStepCompleted : "",
                  state === "locked" ? styles.rankStepLocked : "",
                  state === "highest" ? styles.rankStepHighest : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className={styles.rankTier}>#{rank.tier}</span>
                <p className={styles.rankName}>{rank.name}</p>
                <span
                  className={`${styles.rankBadge} ${rankBadgeClass(state)}`.trim()}
                >
                  {rankBadgeLabel(state)}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

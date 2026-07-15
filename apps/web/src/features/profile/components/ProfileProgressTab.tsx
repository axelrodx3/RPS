"use client";

import {
  DEFAULT_LOCAL_PROFILE,
  getProfileRankName,
  getProfileXpProgress,
  getProfileXpRemaining,
  NEXT_REWARD_PREVIEW,
  type LocalProfile,
} from "@/features/profile/profile-model";
import {
  getRankStepState,
  RANK_LADDER,
} from "@/features/profile/rank-registry";
import styles from "../profile-panel.module.css";

type ProfileProgressTabProps = {
  profile?: LocalProfile;
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
  profile = DEFAULT_LOCAL_PROFILE,
}: ProfileProgressTabProps) {
  const xpProgress = getProfileXpProgress(profile);
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
            Placeholder progression values only. XP earning is not active yet.
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
          <div
            className={styles.xpTrack}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={profile.xpToNextLevel}
            aria-valuenow={profile.xp}
            aria-label={`Level ${profile.level} progress`}
          >
            <div
              className={styles.xpFill}
              style={{ width: `${xpProgress}%` }}
            />
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

        <div className={styles.upcomingRewards}>
          <p className={styles.sectionKicker}>Upcoming cosmetic rewards</p>
          <div className={styles.rewardRow}>
            <span>Level 4</span>
            <span>Avatar Tier 2 unlock preview</span>
          </div>
          <div className={styles.rewardRow}>
            <span>Silver rank</span>
            <span>Rock Tier 2 unlock preview</span>
          </div>
          <div className={styles.rewardRow}>
            <span>Gold rank</span>
            <span>Paper Tier 2 unlock preview</span>
          </div>
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
            Competitive ranking unlocks later with online play. Rank shown here
            is a local preview only.
          </p>
        </div>

        <div className={styles.currentRankBanner}>
          <p className={styles.currentRankLabel}>Current rank</p>
          <p className={styles.currentRankValue}>{currentRank}</p>
        </div>

        <div className={styles.rankLadder} aria-label="Rank ladder">
          {RANK_LADDER.map((rank) => {
            const state = getRankStepState(rank, profile.rankId);
            const stepClass = [
              styles.rankStep,
              state === "current" ? styles.rankStepCurrent : "",
              state === "completed" ? styles.rankStepCompleted : "",
              state === "locked" ? styles.rankStepLocked : "",
              state === "highest" ? styles.rankStepHighest : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div key={rank.id} className={stepClass}>
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

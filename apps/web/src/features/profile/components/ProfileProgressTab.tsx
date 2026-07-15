"use client";

import {
  DEFAULT_LOCAL_PROFILE,
  getProfileRankName,
  getProfileXpProgress,
  type LocalProfile,
} from "@/features/profile/profile-model";
import { HIGHEST_RANK_ID, RANK_LADDER } from "@/features/profile/rank-registry";
import styles from "../profile-panel.module.css";

type ProfileProgressTabProps = {
  profile?: LocalProfile;
};

export function ProfileProgressTab({
  profile = DEFAULT_LOCAL_PROFILE,
}: ProfileProgressTabProps) {
  const xpProgress = getProfileXpProgress(profile);
  const currentRank = getProfileRankName(profile);

  return (
    <div className={styles.progressSection}>
      <div>
        <p className={styles.sectionKicker}>Progression preview</p>
        <p className={styles.sectionNote}>
          Placeholder progression values only. XP earning and rank advancement
          are not active yet.
        </p>
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
          <div className={styles.xpFill} style={{ width: `${xpProgress}%` }} />
        </div>
      </div>

      <div>
        <p className={styles.sectionKicker}>Current rank</p>
        <p className={styles.identityName}>{currentRank}</p>
      </div>

      <div className={styles.rankLadder} aria-label="Rank ladder">
        {RANK_LADDER.map((rank) => {
          const isCurrent = rank.id === profile.rankId;
          return (
            <div
              key={rank.id}
              className={`${styles.rankStep} ${isCurrent ? styles.rankStepCurrent : ""}`.trim()}
            >
              <span className={styles.rankTier}>#{rank.tier}</span>
              <p className={styles.rankName}>{rank.name}</p>
              {isCurrent ? (
                <span className={styles.rankBadge}>Current</span>
              ) : rank.id === HIGHEST_RANK_ID ? (
                <span className={styles.rankBadge}>Highest</span>
              ) : (
                <span className={styles.rankBadge}>Locked</span>
              )}
            </div>
          );
        })}
      </div>

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
    </div>
  );
}

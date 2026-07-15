"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { AVATAR_TIERS } from "@/features/identity/avatar-registry";
import { MoveArt } from "@/features/practice/components/battle-arena/MoveArt";
import {
  getMoveFallbackEmoji,
  MOVE_ASSET_SETS,
} from "@/features/practice/moves/move-asset-registry";
import {
  DEFAULT_LOCAL_PROFILE,
  type LocalProfile,
} from "@/features/profile/profile-model";
import styles from "../profile-panel.module.css";

type ProfileUnlocksTabProps = {
  profile?: LocalProfile;
};

type UnlockCategory = "avatars" | "rock" | "paper" | "scissors";

const UNLOCK_CATEGORIES: { id: UnlockCategory; label: string }[] = [
  { id: "avatars", label: "Avatars" },
  { id: "rock", label: "Rock" },
  { id: "paper", label: "Paper" },
  { id: "scissors", label: "Scissors" },
];

function isUnlocked(unlockedIds: string[], id: string): boolean {
  return unlockedIds.includes(id);
}

function getAvatarUnlockRequirement(tier: number): string {
  if (tier <= 1) return "Unlocked";
  return `Reach Level ${tier + 2}`;
}

function getMoveUnlockRequirement(
  description: string | undefined,
  tier: number,
): string {
  if (description) return description;
  return `Unlock at Tier ${tier}`;
}

export function ProfileUnlocksTab({
  profile = DEFAULT_LOCAL_PROFILE,
}: ProfileUnlocksTabProps) {
  const baseId = useId();
  const [activeCategory, setActiveCategory] =
    useState<UnlockCategory>("avatars");

  return (
    <div className={styles.unlocksLayout}>
      <div
        className={styles.categoryFilterList}
        role="tablist"
        aria-label="Cosmetic categories"
      >
        {UNLOCK_CATEGORIES.map((category) => {
          const selected = activeCategory === category.id;
          const tabId = `${baseId}-category-${category.id}`;
          return (
            <button
              key={category.id}
              id={tabId}
              type="button"
              role="tab"
              className={`${styles.categoryFilterButton} ${selected ? styles.categoryFilterButtonActive : ""}`.trim()}
              aria-selected={selected}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      {activeCategory === "avatars" ? (
        <section
          className={styles.unlockCategory}
          role="tabpanel"
          aria-label="Avatars"
        >
          <div className={styles.cosmeticGrid}>
            {AVATAR_TIERS.map((avatar) => {
              const unlocked = isUnlocked(profile.unlockedAvatarIds, avatar.id);
              const requirement = getAvatarUnlockRequirement(avatar.tier);
              return (
                <article
                  key={avatar.id}
                  className={`${styles.cosmeticCard} ${unlocked ? styles.cosmeticUnlocked : styles.cosmeticLocked}`.trim()}
                  aria-label={`${avatar.displayName}, tier ${avatar.tier}${unlocked ? ", unlocked" : ", locked"}`}
                >
                  <div className={styles.cosmeticPreview}>
                    {avatar.previewPath ? (
                      <Image
                        src={avatar.previewPath}
                        alt=""
                        aria-hidden="true"
                        width={64}
                        height={64}
                        className={
                          unlocked ? "" : styles.cosmeticPreviewSilhouette
                        }
                      />
                    ) : (
                      <span
                        className={styles.cosmeticSilhouette}
                        aria-hidden="true"
                      >
                        <span className={styles.cosmeticSilhouetteIcon}>◉</span>
                        <span className={styles.cosmeticSilhouetteTier}>
                          T{avatar.tier}
                        </span>
                      </span>
                    )}
                    {!unlocked ? (
                      <span className={styles.lockBadge} aria-hidden="true">
                        <span className={styles.lockBadgeIcon}>🔒</span>
                      </span>
                    ) : null}
                  </div>
                  <p className={styles.cosmeticName}>{avatar.displayName}</p>
                  <p className={styles.cosmeticTier}>Tier {avatar.tier}</p>
                  <p className={styles.cosmeticRequirement}>{requirement}</p>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {(["rock", "paper", "scissors"] as const).map((move) => {
        if (activeCategory !== move) return null;

        const unlockedKey =
          move === "rock"
            ? profile.unlockedRockSkinIds
            : move === "paper"
              ? profile.unlockedPaperSkinIds
              : profile.unlockedScissorsSkinIds;

        return (
          <section
            key={move}
            className={styles.unlockCategory}
            role="tabpanel"
            aria-label={move.charAt(0).toUpperCase() + move.slice(1)}
          >
            <div className={styles.cosmeticGrid}>
              {MOVE_ASSET_SETS[move].skins.map((skin) => {
                const unlocked = isUnlocked(unlockedKey, skin.skinId);
                const requirement = getMoveUnlockRequirement(
                  skin.futureUnlockRequirement.description,
                  skin.tier,
                );
                return (
                  <article
                    key={skin.skinId}
                    className={`${styles.cosmeticCard} ${unlocked ? styles.cosmeticUnlocked : styles.cosmeticLocked}`.trim()}
                    aria-label={`${skin.displayName}${unlocked ? ", unlocked" : ", locked"}`}
                  >
                    <div className={styles.cosmeticPreview}>
                      {skin.active ? (
                        <MoveArt move={move} variant="arena" />
                      ) : (
                        <span
                          className={styles.cosmeticSilhouette}
                          aria-hidden="true"
                        >
                          <span className={styles.cosmeticSilhouetteIcon}>
                            {getMoveFallbackEmoji(move)}
                          </span>
                          <span className={styles.cosmeticSilhouetteTier}>
                            T{skin.tier}
                          </span>
                        </span>
                      )}
                      {!unlocked ? (
                        <span className={styles.lockBadge} aria-hidden="true">
                          <span className={styles.lockBadgeIcon}>🔒</span>
                        </span>
                      ) : null}
                    </div>
                    <p className={styles.cosmeticName}>{skin.displayName}</p>
                    <p className={styles.cosmeticTier}>Tier {skin.tier}</p>
                    <p className={styles.cosmeticRequirement}>{requirement}</p>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

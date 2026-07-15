"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { AVATAR_TIERS } from "@/features/identity/avatar-registry";
import {
  DEFAULT_LOCAL_PROFILE,
  type LocalProfile,
} from "@/features/profile/profile-model";
import { MoveSkinPreview } from "@/features/profile/components/MoveSkinPreview";
import { MOVE_ASSET_SETS } from "@/features/practice/moves/move-asset-registry";
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

function isEquipped(
  profile: LocalProfile,
  move: "rock" | "paper" | "scissors",
  skinId: string,
): boolean {
  if (move === "rock") return profile.equipped.rockSkinId === skinId;
  if (move === "paper") return profile.equipped.paperSkinId === skinId;
  return profile.equipped.scissorsSkinId === skinId;
}

function getAvatarUnlockRequirement(
  tier: number,
  unlocked: boolean,
): string | null {
  if (unlocked && tier === 1) return "Default unlock";
  if (unlocked) return null;
  return `Reach Level ${tier + 2}`;
}

function getMoveUnlockRequirement(
  tier: number,
  unlocked: boolean,
  equipped: boolean,
  description: string | undefined,
): string | null {
  if (equipped) return "Default unlock";
  if (unlocked) return null;
  if (description) return description;
  return `Unlock at Tier ${tier}`;
}

function buildMoveAccessibleLabel(
  displayName: string,
  tier: number,
  unlocked: boolean,
  equipped: boolean,
): string {
  if (equipped) {
    return `${displayName}. Tier ${tier}. Equipped.`;
  }
  if (unlocked) {
    return `${displayName}. Tier ${tier}. Unlocked.`;
  }
  return `${displayName}. Tier ${tier}. Locked. Future unlock.`;
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
              const equipped = profile.equipped.avatarId === avatar.id;
              const requirement = getAvatarUnlockRequirement(
                avatar.tier,
                unlocked,
              );
              return (
                <article
                  key={avatar.id}
                  className={`${styles.cosmeticCard} ${equipped ? styles.cosmeticEquipped : unlocked ? styles.cosmeticUnlocked : styles.cosmeticLocked}`.trim()}
                  aria-label={`${avatar.displayName}, tier ${avatar.tier}${equipped ? ", equipped" : unlocked ? ", unlocked" : ", locked"}`}
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
                          unlocked
                            ? styles.cosmeticPreviewImage
                            : styles.cosmeticPreviewArtLocked
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
                      <span className={styles.lockOverlay} aria-hidden="true">
                        <span className={styles.lockBadge}>
                          <span className={styles.lockBadgeIcon}>🔒</span>
                        </span>
                      </span>
                    ) : null}
                  </div>
                  {equipped ? (
                    <span className={styles.statusBadgeEquipped}>Equipped</span>
                  ) : null}
                  <p className={styles.cosmeticName}>{avatar.displayName}</p>
                  <p className={styles.cosmeticTier}>Tier {avatar.tier}</p>
                  {requirement ? (
                    <p className={styles.cosmeticRequirement}>{requirement}</p>
                  ) : null}
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
                const equipped = isEquipped(profile, move, skin.skinId);
                const requirement = getMoveUnlockRequirement(
                  skin.tier,
                  unlocked,
                  equipped,
                  skin.futureUnlockRequirement.description,
                );
                const accessibleLabel = buildMoveAccessibleLabel(
                  skin.displayName,
                  skin.tier,
                  unlocked,
                  equipped,
                );

                return (
                  <article
                    key={skin.skinId}
                    className={`${styles.cosmeticCard} ${equipped ? styles.cosmeticEquipped : unlocked ? styles.cosmeticUnlocked : styles.cosmeticLocked}`.trim()}
                    aria-label={accessibleLabel}
                  >
                    <div className={styles.cosmeticPreview}>
                      <div
                        className={`${styles.cosmeticPreviewArt} ${unlocked ? "" : styles.cosmeticPreviewArtLocked}`.trim()}
                      >
                        <MoveSkinPreview
                          move={move}
                          skinId={skin.skinId}
                          accessibleLabel={accessibleLabel}
                        />
                      </div>
                      {!unlocked ? (
                        <span className={styles.lockOverlay} aria-hidden="true">
                          <span className={styles.lockBadge}>
                            <span className={styles.lockBadgeIcon}>🔒</span>
                          </span>
                        </span>
                      ) : null}
                    </div>
                    {equipped ? (
                      <span className={styles.statusBadgeEquipped}>
                        Equipped
                      </span>
                    ) : null}
                    <p className={styles.cosmeticName}>{skin.displayName}</p>
                    <p className={styles.cosmeticTier}>Tier {skin.tier}</p>
                    {requirement ? (
                      <p className={styles.cosmeticRequirement}>
                        {requirement}
                      </p>
                    ) : null}
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

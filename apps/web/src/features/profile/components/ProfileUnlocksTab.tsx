"use client";

import { useId, useState } from "react";
import { AVATAR_TIERS } from "@/features/identity/avatar-registry";
import { AvatarPreview } from "@/features/profile/components/AvatarPreview";
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

const UNLOCK_CATEGORIES: {
  id: UnlockCategory;
  label: string;
  icon: string;
}[] = [
  { id: "avatars", label: "Avatars", icon: "◉" },
  { id: "rock", label: "Rock", icon: "🪨" },
  { id: "paper", label: "Paper", icon: "📄" },
  { id: "scissors", label: "Scissors", icon: "✂" },
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

function buildAvatarAccessibleLabel(
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
  return `${displayName}. Tier ${tier}. Locked.`;
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
  return `${displayName}. Tier ${tier}. Locked.`;
}

function getActiveCategoryLabel(category: UnlockCategory): string {
  return UNLOCK_CATEGORIES.find((entry) => entry.id === category)?.label ?? "";
}

export function ProfileUnlocksTab({
  profile = DEFAULT_LOCAL_PROFILE,
}: ProfileUnlocksTabProps) {
  const baseId = useId();
  const [activeCategory, setActiveCategory] =
    useState<UnlockCategory>("avatars");

  const renderAvatarGrid = () => (
    <div className={styles.cosmeticGrid}>
      {AVATAR_TIERS.map((avatar) => {
        const unlocked = isUnlocked(profile.unlockedAvatarIds, avatar.id);
        const equipped = profile.equipped.avatarId === avatar.id;
        const accessibleLabel = buildAvatarAccessibleLabel(
          avatar.displayName,
          avatar.tier,
          unlocked,
          equipped,
        );

        return (
          <article
            key={avatar.id}
            className={`${styles.cosmeticCard} ${equipped ? styles.cosmeticEquipped : unlocked ? styles.cosmeticUnlocked : styles.cosmeticLocked}`.trim()}
            aria-label={accessibleLabel}
          >
            <div className={styles.cosmeticPreview}>
              <div
                className={`${styles.cosmeticPreviewArt} ${unlocked ? "" : styles.cosmeticPreviewArtLocked}`.trim()}
              >
                <AvatarPreview
                  avatarId={avatar.id}
                  accessibleLabel={accessibleLabel}
                  locked={!unlocked}
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
              <span className={styles.statusBadgeEquipped}>Equipped</span>
            ) : null}
            {!unlocked ? (
              <span className={styles.statusBadgeLocked}>Locked</span>
            ) : null}
            <p className={styles.cosmeticName}>{avatar.displayName}</p>
            <p className={styles.cosmeticTier}>Tier {avatar.tier}</p>
          </article>
        );
      })}
    </div>
  );

  const renderMoveGrid = (move: "rock" | "paper" | "scissors") => {
    const unlockedKey =
      move === "rock"
        ? profile.unlockedRockSkinIds
        : move === "paper"
          ? profile.unlockedPaperSkinIds
          : profile.unlockedScissorsSkinIds;

    return (
      <div className={styles.cosmeticGrid}>
        {MOVE_ASSET_SETS[move].skins.map((skin) => {
          const unlocked = isUnlocked(unlockedKey, skin.skinId);
          const equipped = isEquipped(profile, move, skin.skinId);
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
                <span className={styles.statusBadgeEquipped}>Equipped</span>
              ) : null}
              {!unlocked && !equipped ? (
                <span className={styles.statusBadgeLocked}>Locked</span>
              ) : null}
              <p className={styles.cosmeticName}>{skin.displayName}</p>
              <p className={styles.cosmeticTier}>Tier {skin.tier}</p>
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.unlocksLayout}>
      <nav className={styles.categorySidebar} aria-label="Cosmetic categories">
        <div
          className={styles.categorySidebarList}
          role="tablist"
          aria-label="Unlock categories"
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
                className={`${styles.categorySidebarButton} ${selected ? styles.categorySidebarButtonActive : ""}`.trim()}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${category.id}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className={styles.categorySidebarIcon} aria-hidden="true">
                  {category.icon}
                </span>
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className={styles.unlocksContent}>
        {UNLOCK_CATEGORIES.map((category) => {
          if (activeCategory !== category.id) return null;

          return (
            <section
              key={category.id}
              id={`${baseId}-panel-${category.id}`}
              className={styles.unlockCategory}
              role="tabpanel"
              aria-labelledby={`${baseId}-category-${category.id}`}
              aria-label={category.label}
            >
              <div className={styles.unlockCategoryHeader}>
                <h2 className={styles.unlockCategoryTitle}>
                  {getActiveCategoryLabel(category.id)}
                </h2>
              </div>
              {category.id === "avatars"
                ? renderAvatarGrid()
                : renderMoveGrid(category.id)}
            </section>
          );
        })}
      </div>
    </div>
  );
}

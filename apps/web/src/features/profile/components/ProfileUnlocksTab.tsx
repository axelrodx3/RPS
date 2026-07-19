"use client";

import { useId } from "react";
import { AVATAR_TIERS } from "@/features/identity/avatar-registry";
import { CosmeticCard } from "@/features/profile/components/CosmeticCard";
import type { UnlockCategory } from "@/features/profile/profile-navigation";
import { MOVE_ASSET_SETS } from "@/features/practice/moves/move-asset-registry";
import { useProfile } from "@/providers/ProfileProvider";
import styles from "../profile-panel.module.css";

type ProfileUnlocksTabProps = {
  activeCategory: UnlockCategory;
  onCategoryChange: (category: UnlockCategory) => void;
};

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

function buildAccessibleLabel(
  displayName: string,
  tier: number,
  unlocked: boolean,
  equipped: boolean,
): string {
  if (equipped) return `${displayName}. Tier ${tier}. Equipped.`;
  if (unlocked) return `${displayName}. Tier ${tier}. Unlocked.`;
  return `${displayName}. Tier ${tier}. Locked.`;
}

export function ProfileUnlocksTab({
  activeCategory,
  onCategoryChange,
}: ProfileUnlocksTabProps) {
  const baseId = useId();
  const {
    isAvatarUnlocked,
    isMoveSkinUnlocked,
    isAvatarEquipped,
    isMoveSkinEquipped,
  } = useProfile();

  const activeLabel =
    UNLOCK_CATEGORIES.find((entry) => entry.id === activeCategory)?.label ?? "";

  return (
    <div className={styles.unlocksLayout}>
      <nav className={styles.categorySidebar} aria-label="Cosmetic categories">
        <label
          className={styles.categoryMobileLabel}
          htmlFor={`${baseId}-mobile-category`}
        >
          Category
        </label>
        <select
          id={`${baseId}-mobile-category`}
          className={styles.categoryMobileSelect}
          value={activeCategory}
          onChange={(event) =>
            onCategoryChange(event.target.value as UnlockCategory)
          }
          aria-label="Unlock category"
        >
          {UNLOCK_CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>

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
                onClick={() => onCategoryChange(category.id)}
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
        <section
          id={`${baseId}-panel-${activeCategory}`}
          className={styles.unlockCategory}
          role="tabpanel"
          aria-labelledby={`${baseId}-category-${activeCategory}`}
          aria-label={activeLabel}
        >
          <div className={styles.unlockCategoryHeader}>
            <h2 className={styles.unlockCategoryTitle}>{activeLabel}</h2>
          </div>

          {activeCategory === "avatars" ? (
            <div className={styles.cosmeticGrid}>
              {AVATAR_TIERS.map((avatar) => {
                const unlocked = isAvatarUnlocked(avatar.id);
                const equipped = isAvatarEquipped(avatar.id);
                return (
                  <CosmeticCard
                    key={avatar.id}
                    target={{
                      kind: "avatar",
                      itemId: avatar.id,
                      category: "avatars",
                    }}
                    displayName={avatar.displayName}
                    tier={avatar.tier}
                    unlocked={unlocked}
                    equipped={equipped}
                    accessibleLabel={buildAccessibleLabel(
                      avatar.displayName,
                      avatar.tier,
                      unlocked,
                      equipped,
                    )}
                  />
                );
              })}
            </div>
          ) : (
            <div className={styles.cosmeticGrid}>
              {MOVE_ASSET_SETS[activeCategory].skins.map((skin) => {
                const unlocked = isMoveSkinUnlocked(
                  activeCategory,
                  skin.skinId,
                );
                const equipped = isMoveSkinEquipped(
                  activeCategory,
                  skin.skinId,
                );
                return (
                  <CosmeticCard
                    key={skin.skinId}
                    target={{
                      kind: activeCategory,
                      itemId: skin.skinId,
                      category: activeCategory,
                    }}
                    displayName={skin.displayName}
                    tier={skin.tier}
                    unlocked={unlocked}
                    equipped={equipped}
                    accessibleLabel={buildAccessibleLabel(
                      skin.displayName,
                      skin.tier,
                      unlocked,
                      equipped,
                    )}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

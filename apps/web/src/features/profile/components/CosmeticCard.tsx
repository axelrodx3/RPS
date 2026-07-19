"use client";

import { useRef } from "react";
import { AvatarPreview } from "@/features/profile/components/AvatarPreview";
import { MoveSkinPreview } from "@/features/profile/components/MoveSkinPreview";
import type { CosmeticPreviewTarget } from "@/features/profile/profile-navigation";
import { useProfile } from "@/providers/ProfileProvider";
import styles from "../profile-panel.module.css";

type CosmeticCardProps = {
  target: CosmeticPreviewTarget;
  displayName: string;
  tier: number;
  unlocked: boolean;
  equipped: boolean;
  accessibleLabel: string;
};

export function CosmeticCard({
  target,
  displayName,
  tier,
  unlocked,
  equipped,
  accessibleLabel,
}: CosmeticCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const { openPreview } = useProfile();

  const cardClass = [
    styles.cosmeticCard,
    equipped
      ? styles.cosmeticEquipped
      : unlocked
        ? styles.cosmeticUnlocked
        : styles.cosmeticLocked,
  ]
    .filter(Boolean)
    .join(" ");

  const openCardPreview = () => {
    openPreview(target, cardRef);
  };

  return (
    <article
      ref={cardRef}
      className={cardClass}
      aria-label={accessibleLabel}
      data-testid={`cosmetic-card-${target.itemId}`}
    >
      <div className={styles.cosmeticCardTopRow}>
        <span className={styles.cosmeticTierBadge}>Tier {tier}</span>
        {equipped ? (
          <span className={styles.statusBadgeEquipped}>Equipped</span>
        ) : !unlocked ? (
          <span className={styles.statusBadgeLocked}>Locked</span>
        ) : null}
      </div>

      <button
        type="button"
        className={styles.cosmeticCardButton}
        onClick={openCardPreview}
      >
        <div className={styles.cosmeticPreview}>
          <div
            className={`${styles.cosmeticPreviewArt} ${unlocked ? "" : styles.cosmeticPreviewArtLocked}`.trim()}
          >
            {target.kind === "avatar" ? (
              <AvatarPreview
                avatarId={target.itemId}
                accessibleLabel={accessibleLabel}
                locked={!unlocked}
              />
            ) : (
              <MoveSkinPreview
                move={target.kind}
                skinId={target.itemId}
                accessibleLabel={accessibleLabel}
              />
            )}
          </div>
          {!unlocked ? (
            <span className={styles.lockOverlay} aria-hidden="true">
              <span className={styles.lockBadge}>
                <span className={styles.lockBadgeIcon}>🔒</span>
              </span>
            </span>
          ) : null}
        </div>

        <span className={styles.cosmeticPreviewAction}>Preview</span>
        <p className={styles.cosmeticName}>{displayName}</p>
      </button>
    </article>
  );
}

"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "@/design-system/components";
import { getPlayerAvatar } from "@/features/identity/avatar-registry";
import { AvatarPreview } from "@/features/profile/components/AvatarPreview";
import { MoveSkinPreview } from "@/features/profile/components/MoveSkinPreview";
import { getMoveSkinById } from "@/features/practice/moves/move-asset-registry";
import { useProfile } from "@/providers/ProfileProvider";
import styles from "../profile-panel.module.css";

function getCategoryLabel(kind: "avatar" | "rock" | "paper" | "scissors") {
  switch (kind) {
    case "avatar":
      return "Avatar";
    case "rock":
      return "Rock";
    case "paper":
      return "Paper";
    case "scissors":
      return "Scissors";
  }
}

export function CosmeticPreviewDialog() {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const {
    preview,
    closePreview,
    equipPreviewTarget,
    isAvatarUnlocked,
    isMoveSkinUnlocked,
    isAvatarEquipped,
    isMoveSkinEquipped,
    navigateToUnlockItem,
  } = useProfile();

  useEffect(() => {
    if (!preview) return;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePreview();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [closePreview, preview]);

  if (!preview) return null;

  const unlocked =
    preview.kind === "avatar"
      ? isAvatarUnlocked(preview.itemId)
      : isMoveSkinUnlocked(preview.kind, preview.itemId);
  const equipped =
    preview.kind === "avatar"
      ? isAvatarEquipped(preview.itemId)
      : isMoveSkinEquipped(preview.kind, preview.itemId);

  const displayName =
    preview.kind === "avatar"
      ? getPlayerAvatar(preview.itemId).displayName
      : getMoveSkinById(preview.kind, preview.itemId).displayName;
  const tier =
    preview.kind === "avatar"
      ? getPlayerAvatar(preview.itemId).tier
      : getMoveSkinById(preview.kind, preview.itemId).tier;
  const accessibleLabel = `${displayName}. Tier ${tier}. ${equipped ? "Equipped" : unlocked ? "Unlocked" : "Locked"}.`;

  return (
    <div
      className={styles.previewDialogBackdrop}
      role="presentation"
      onClick={closePreview}
      data-testid="cosmetic-preview-backdrop"
    >
      <div
        ref={dialogRef}
        className={styles.previewDialogPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        data-testid="cosmetic-preview-dialog"
      >
        <header className={styles.previewDialogHeader}>
          <div>
            <p className={styles.previewDialogKicker}>
              {getCategoryLabel(preview.kind)}
            </p>
            <h2 id={titleId} className={styles.previewDialogTitle}>
              {displayName}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.previewDialogClose}
            onClick={closePreview}
            aria-label="Close preview"
          >
            ×
          </button>
        </header>

        <div className={styles.previewDialogArtFrame}>
          {preview.kind === "avatar" ? (
            <AvatarPreview
              avatarId={preview.itemId}
              accessibleLabel={accessibleLabel}
            />
          ) : (
            <MoveSkinPreview
              move={preview.kind}
              skinId={preview.itemId}
              accessibleLabel={accessibleLabel}
            />
          )}
        </div>

        <div className={styles.previewDialogMeta}>
          <span className={styles.previewDialogTierBadge}>Tier {tier}</span>
          {equipped ? (
            <span className={styles.statusBadgeEquipped}>Equipped</span>
          ) : unlocked ? (
            <span className={styles.statusBadgeUnlocked}>Unlocked</span>
          ) : (
            <span className={styles.statusBadgeLocked}>Locked</span>
          )}
        </div>

        <footer className={styles.previewDialogActions}>
          {equipped ? (
            <Button variant="secondary" size="sm" disabled>
              Equipped
            </Button>
          ) : unlocked ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                equipPreviewTarget();
                closePreview();
              }}
            >
              Equip
            </Button>
          ) : (
            <Button variant="secondary" size="sm" disabled>
              Locked
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigateToUnlockItem(preview.category, preview.itemId);
              closePreview();
            }}
          >
            View in Unlocks
          </Button>
        </footer>
      </div>
    </div>
  );
}

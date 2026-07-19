"use client";

import { useCallback, useState } from "react";
import {
  getAvatarPreviewPresentation,
  getPlayerAvatar,
} from "@/features/identity/avatar-registry";
import styles from "../profile-panel.module.css";

type AvatarPreviewProps = {
  avatarId: string;
  accessibleLabel: string;
  locked?: boolean;
};

export function AvatarPreview({
  avatarId,
  accessibleLabel,
  locked = false,
}: AvatarPreviewProps) {
  const avatar = getPlayerAvatar(avatarId);
  const presentation = getAvatarPreviewPresentation(avatar.tier);
  const [failed, setFailed] = useState(false);

  const handleError = useCallback(() => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[AvatarPreview] Failed to load artwork for ${avatar.id} (${avatar.sourceFilename})`,
      );
    }
    setFailed(true);
  }, [avatar.id, avatar.sourceFilename]);

  const previewStyle = {
    "--avatar-preview-scale": presentation.previewScale,
    "--avatar-preview-max-width": presentation.maxWidth,
    "--avatar-preview-max-height": presentation.maxHeight,
    "--avatar-preview-object-position": presentation.objectPosition,
    "--avatar-preview-padding": presentation.internalPadding,
  } as React.CSSProperties;

  if (failed) {
    return (
      <span
        className={styles.avatarPreviewFallback}
        aria-label={accessibleLabel}
        data-testid={`avatar-preview-fallback-${avatar.tier}`}
      >
        <span className={styles.avatarPreviewFallbackIcon} aria-hidden="true">
          ◉
        </span>
        <span className={styles.avatarPreviewFallbackLabel}>
          {avatar.displayName}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`${styles.avatarPreviewFrame} ${locked ? styles.avatarPreviewFrameLocked : ""}`.trim()}
      style={previewStyle}
      data-tier={avatar.tier}
      data-testid={`avatar-preview-${avatar.tier}`}
    >
      <picture className={styles.avatarPreviewPicture}>
        {avatar.profilePreviewWebpPath ? (
          <source srcSet={avatar.profilePreviewWebpPath} type="image/webp" />
        ) : null}
        <img
          className={styles.avatarPreviewImage}
          src={avatar.profilePreviewPath}
          alt=""
          aria-hidden="true"
          decoding="async"
          loading="lazy"
          draggable={false}
          onError={handleError}
        />
      </picture>
      <span className={styles.srOnly}>{accessibleLabel}</span>
    </span>
  );
}

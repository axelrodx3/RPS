"use client";

import { useCallback, useState } from "react";
import type { Move } from "@/features/practice/engine/practice-engine";
import {
  getMoveFallbackEmoji,
  getMoveSkinById,
  getMoveSkinPreviewPresentation,
} from "@/features/practice/moves/move-asset-registry";
import styles from "../profile-panel.module.css";

type MoveSkinPreviewProps = {
  move: Move;
  skinId: string;
  accessibleLabel: string;
};

export function MoveSkinPreview({
  move,
  skinId,
  accessibleLabel,
}: MoveSkinPreviewProps) {
  const skin = getMoveSkinById(move, skinId);
  const presentation = getMoveSkinPreviewPresentation(move);
  const [failed, setFailed] = useState(false);

  const handleError = useCallback(() => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[MoveSkinPreview] Failed to load artwork for ${move} (${skin.skinId})`,
      );
    }
    setFailed(true);
  }, [move, skin.skinId]);

  if (failed) {
    return (
      <span
        className={styles.moveSkinPreviewFallback}
        aria-label={accessibleLabel}
        data-testid={`move-skin-preview-fallback-${move}-${skin.tier}`}
      >
        <span className={styles.moveSkinPreviewFallbackIcon} aria-hidden="true">
          {getMoveFallbackEmoji(move)}
        </span>
        <span className={styles.moveSkinPreviewFallbackLabel}>
          {skin.displayName}
        </span>
      </span>
    );
  }

  const previewStyle = {
    "--move-preview-scale": presentation.scale,
    "--move-preview-max-width": presentation.maxWidth,
    "--move-preview-max-height": presentation.maxHeight,
    "--move-preview-object-position": presentation.objectPosition,
    "--move-preview-padding": presentation.padding,
  } as React.CSSProperties;

  return (
    <span
      className={styles.moveSkinPreviewFrame}
      style={previewStyle}
      data-move={move}
      data-tier={skin.tier}
      data-testid={`move-skin-preview-${move}-${skin.tier}`}
    >
      <picture className={styles.moveSkinPreviewPicture}>
        {skin.paths.webp ? (
          <source srcSet={skin.paths.webp} type="image/webp" />
        ) : null}
        <img
          className={styles.moveSkinPreviewImage}
          src={skin.paths.png}
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

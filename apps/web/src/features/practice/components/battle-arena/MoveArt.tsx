"use client";

import { useCallback, useState } from "react";
import type { Move } from "@/features/practice/engine/practice-engine";
import {
  getMoveAccessibleLabel,
  getMoveFallbackEmoji,
  resolveMoveSkin,
  type MoveArtVariant,
} from "@/features/practice/moves/move-asset-registry";
import styles from "../practice-game.module.css";

type MoveArtProps = {
  move: Move;
  variant: MoveArtVariant;
  skinId?: string | null;
  className?: string;
  showFallbackEmoji?: boolean;
  label?: string;
};

const VARIANT_CLASS: Record<MoveArtVariant, string> = {
  selection: styles.moveArtSelection ?? "",
  arena: styles.moveArtArena ?? "",
  reveal: styles.moveArtReveal ?? "",
  timeline: styles.moveArtTimeline ?? "",
};

export function MoveArt({
  move,
  variant,
  skinId,
  className,
  showFallbackEmoji = true,
  label,
}: MoveArtProps) {
  const skin = resolveMoveSkin(move, skinId);
  const [failed, setFailed] = useState(false);
  const accessibleLabel = label ?? getMoveAccessibleLabel(move);

  const handleError = useCallback(() => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[MoveArt] Failed to load artwork for ${move} (${skin.paths.png})`,
      );
    }
    setFailed(true);
  }, [move, skin.paths.png]);

  if (failed) {
    return (
      <span
        className={`${styles.moveArtFallback} ${VARIANT_CLASS[variant]} ${className ?? ""}`.trim()}
        aria-label={accessibleLabel}
        data-testid={`move-art-fallback-${move}`}
      >
        {showFallbackEmoji ? (
          <span aria-hidden="true">{getMoveFallbackEmoji(move)}</span>
        ) : (
          <span className={styles.moveArtFallbackLabel}>{accessibleLabel}</span>
        )}
      </span>
    );
  }

  const scaleStyle = {
    "--move-art-scale": skin.presentationScale,
  } as React.CSSProperties;

  const imageClass = [styles.moveArtImage, VARIANT_CLASS[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={`${styles.moveArtFrame} ${VARIANT_CLASS[variant]} ${className ?? ""}`.trim()}
      style={scaleStyle}
      data-move={move}
      data-variant={variant}
      data-testid={`move-art-${move}-${variant}`}
    >
      {skin.paths.webp ? (
        <picture className={styles.moveArtPicture}>
          <source srcSet={skin.paths.webp} type="image/webp" />
          <img
            className={imageClass}
            src={skin.paths.png}
            alt=""
            aria-hidden="true"
            decoding="async"
            loading={variant === "selection" ? "eager" : "lazy"}
            draggable={false}
            onError={handleError}
          />
        </picture>
      ) : (
        // Native img keeps picture/webp fallback and onError handling explicit.
        // eslint-disable-next-line @next/next/no-img-element -- move art uses picture fallback paths
        <img
          className={imageClass}
          src={skin.paths.png}
          alt=""
          aria-hidden="true"
          decoding="async"
          loading={variant === "selection" ? "eager" : "lazy"}
          draggable={false}
          onError={handleError}
        />
      )}
      <span className={styles.srOnly}>{accessibleLabel}</span>
    </span>
  );
}

"use client";

import {
  PROFILE_PROGRESS_ASSETS_EXPORTED,
  PROFILE_PROGRESS_RUNTIME_ASSETS,
} from "@/features/profile/profile-progress-assets";
import styles from "../profile-panel.module.css";

type ProfileProgressBarProps = {
  value: number;
  max: number;
  label: string;
  reducedMotion?: boolean;
  compact?: boolean;
};

export function ProfileProgressBar({
  value,
  max,
  label,
  reducedMotion = false,
  compact = false,
}: ProfileProgressBarProps) {
  const safeMax = max > 0 ? max : 1;
  const percent = Math.min(100, Math.round((value / safeMax) * 100));

  const trackClass = [
    styles.profileProgressTrack,
    compact ? styles.profileProgressTrackCompact : "",
    reducedMotion ? styles.profileProgressReducedMotion : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={styles.profileProgressRoot}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={value}
      aria-label={label}
      data-exported={PROFILE_PROGRESS_ASSETS_EXPORTED ? "true" : "false"}
    >
      {PROFILE_PROGRESS_ASSETS_EXPORTED ? (
        <div className={styles.profileProgressAssetTrack}>
          {/* eslint-disable-next-line @next/next/no-img-element -- optional pixel-art export slots */}
          <img
            src={PROFILE_PROGRESS_RUNTIME_ASSETS.frame}
            alt=""
            aria-hidden="true"
            className={styles.profileProgressFrame}
          />
          <div
            className={styles.profileProgressAssetFillMask}
            style={{ width: `${percent}%` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- optional pixel-art export slots */}
            <img
              src={PROFILE_PROGRESS_RUNTIME_ASSETS.fill}
              alt=""
              aria-hidden="true"
              className={styles.profileProgressFillAsset}
            />
          </div>
          {!reducedMotion ? (
            /* eslint-disable-next-line @next/next/no-img-element -- optional pixel-art export slots */
            <img
              src={PROFILE_PROGRESS_RUNTIME_ASSETS.shine}
              alt=""
              aria-hidden="true"
              className={styles.profileProgressShine}
            />
          ) : null}
        </div>
      ) : (
        <div className={trackClass}>
          <div
            className={styles.profileProgressFill}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}

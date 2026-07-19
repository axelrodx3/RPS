"use client";

import { useMemo, useState } from "react";
import { Button } from "@/design-system/components";
import { useCountUpAnimation } from "@/features/practice/hooks/useCountUpAnimation";
import {
  buildStatsMetrics,
  mapPracticeStatsToViewModel,
} from "@/features/practice/stats/map-practice-stats";
import type { StatsMetric } from "@/features/practice/stats/stats-view-model";
import type { ProfileNavigationState } from "@/features/profile/profile-navigation";
import { MoveSkinPreview } from "@/features/profile/components/MoveSkinPreview";
import { getDefaultMoveSkin } from "@/features/practice/moves/move-asset-registry";
import { useSettings } from "@/providers/SettingsProvider";
import profileStyles from "@/features/profile/profile-panel.module.css";
import styles from "./leaderboard-panel.module.css";

type MyStatsPanelProps = {
  animate: boolean;
  reducedMotion: boolean;
  showReset?: boolean;
  variant?: "default" | "profile";
  onNavigationChange?: (navigation: ProfileNavigationState) => void;
};

const PROFILE_STAT_GROUPS: {
  id: string;
  title: string;
  metricIds: string[];
}[] = [
  {
    id: "match-record",
    title: "Match record",
    metricIds: [
      "wins",
      "losses",
      "ties",
      "win-rate",
      "best-streak",
      "matches",
      "avg-length",
    ],
  },
  {
    id: "move-usage",
    title: "Move usage",
    metricIds: ["rock", "paper", "scissors", "favorite"],
  },
  {
    id: "performance",
    title: "Performance",
    metricIds: ["automatic"],
  },
];

function AnimatedMetricValue({
  metric,
  animate,
  reducedMotion,
  variant = "default",
}: {
  metric: StatsMetric;
  animate: boolean;
  reducedMotion: boolean;
  variant?: "default" | "profile" | "profile-compact";
}) {
  const numericValue = metric.numericValue ?? 0;
  const animatedValue = useCountUpAnimation({
    target: numericValue,
    active: animate && metric.numericValue !== undefined,
    reducedMotion,
  });

  const valueClass =
    variant === "profile" || variant === "profile-compact"
      ? variant === "profile-compact"
        ? profileStyles.statsMetricTileValue
        : profileStyles.statsMetricValue
      : styles.metricValue;

  if (metric.numericValue === undefined) {
    return <span className={valueClass}>{metric.value}</span>;
  }

  if (metric.id === "win-rate") {
    return <span className={valueClass}>{`${animatedValue}%`}</span>;
  }

  return <span className={valueClass}>{animatedValue}</span>;
}

function ProfileMetricTile({
  metric,
  animate,
  reducedMotion,
  favoriteMoveKey,
  onFavoriteClick,
}: {
  metric: StatsMetric;
  animate: boolean;
  reducedMotion: boolean;
  favoriteMoveKey: ReturnType<
    typeof mapPracticeStatsToViewModel
  >["favoriteMoveKey"];
  onFavoriteClick?: () => void;
}) {
  if (metric.id === "favorite" && favoriteMoveKey) {
    const skin = getDefaultMoveSkin(favoriteMoveKey);
    return (
      <button
        type="button"
        className={profileStyles.statsMetricTile}
        onClick={onFavoriteClick}
        aria-label={`Favorite move ${metric.value}. Open ${favoriteMoveKey} unlocks.`}
      >
        <span className={profileStyles.statsMetricTileArt}>
          <MoveSkinPreview
            move={favoriteMoveKey}
            skinId={skin.skinId}
            accessibleLabel={`Favorite move ${metric.value}`}
          />
        </span>
        <AnimatedMetricValue
          metric={metric}
          animate={animate}
          reducedMotion={reducedMotion}
          variant="profile-compact"
        />
        <p className={profileStyles.statsMetricTileLabel}>{metric.label}</p>
      </button>
    );
  }

  return (
    <article className={profileStyles.statsMetricTile}>
      <span
        className={profileStyles.statsMetricIcon}
        data-icon={metric.iconKey}
        aria-hidden="true"
      />
      <AnimatedMetricValue
        metric={metric}
        animate={animate}
        reducedMotion={reducedMotion}
        variant="profile-compact"
      />
      <p className={profileStyles.statsMetricTileLabel}>{metric.label}</p>
    </article>
  );
}

function MetricCard({
  metric,
  animate,
  reducedMotion,
  variant,
}: {
  metric: StatsMetric;
  animate: boolean;
  reducedMotion: boolean;
  variant: "default" | "profile";
}) {
  if (variant === "profile") {
    return (
      <article className={profileStyles.statsMetricCard}>
        <span
          className={profileStyles.statsMetricIcon}
          data-icon={metric.iconKey}
          aria-hidden="true"
        />
        <div className={profileStyles.statsMetricCopy}>
          <p className={profileStyles.statsMetricLabel}>{metric.label}</p>
          <AnimatedMetricValue
            metric={metric}
            animate={animate}
            reducedMotion={reducedMotion}
            variant={variant}
          />
        </div>
      </article>
    );
  }

  return (
    <article className={styles.metricCard}>
      <span
        className={styles.metricIcon}
        data-icon={metric.iconKey}
        aria-hidden="true"
      />
      <div className={styles.metricCopy}>
        <p className={styles.metricLabel}>{metric.label}</p>
        <AnimatedMetricValue
          metric={metric}
          animate={animate}
          reducedMotion={reducedMotion}
          variant={variant}
        />
      </div>
    </article>
  );
}

export function MyStatsPanel({
  animate,
  reducedMotion,
  showReset = true,
  variant = "default",
  onNavigationChange,
}: MyStatsPanelProps) {
  const { stats, resetStats } = useSettings();
  const [confirmReset, setConfirmReset] = useState(false);
  const viewModel = useMemo(() => mapPracticeStatsToViewModel(stats), [stats]);
  const metrics = useMemo(() => buildStatsMetrics(viewModel), [viewModel]);
  const metricsById = useMemo(
    () => Object.fromEntries(metrics.map((metric) => [metric.id, metric])),
    [metrics],
  );

  if (variant === "profile") {
    return (
      <div className={profileStyles.statsLayout} data-source={viewModel.source}>
        <div className={profileStyles.statsHeader}>
          <p className={profileStyles.sectionKicker}>Practice stats</p>
          <p className={profileStyles.sectionNote}>
            Saved on this device only. Account statistics will appear here
            later.
          </p>
        </div>

        {PROFILE_STAT_GROUPS.map((group) => (
          <section key={group.id} className={profileStyles.statsGroup}>
            <h3 className={profileStyles.statsGroupTitle}>{group.title}</h3>
            <div className={profileStyles.statsMetricTileGrid}>
              {group.metricIds.map((metricId) => {
                const metric = metricsById[metricId];
                if (!metric) return null;
                return (
                  <ProfileMetricTile
                    key={metric.id}
                    metric={metric}
                    animate={animate}
                    reducedMotion={reducedMotion}
                    favoriteMoveKey={viewModel.favoriteMoveKey}
                    onFavoriteClick={
                      metric.id === "favorite" && viewModel.favoriteMoveKey
                        ? () =>
                            onNavigationChange?.({
                              tab: "unlocks",
                              category: viewModel.favoriteMoveKey!,
                              itemId: null,
                            })
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.myStatsPanel} data-source={viewModel.source}>
      <div className={styles.myStatsHeader}>
        <p className={styles.myStatsKicker}>Practice stats</p>
        <p className={styles.myStatsNote}>
          Saved on this device only. Account statistics will appear here later.
        </p>
      </div>

      <div className={styles.metricGrid}>
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            metric={metric}
            animate={animate}
            reducedMotion={reducedMotion}
            variant={variant}
          />
        ))}
      </div>

      {showReset ? (
        <div className={styles.resetBlock}>
          {confirmReset ? (
            <>
              <p>Reset all Practice statistics on this device?</p>
              <div className={styles.resetActions}>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    resetStats();
                    setConfirmReset(false);
                  }}
                >
                  Confirm reset
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfirmReset(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmReset(true)}
            >
              Reset Practice statistics
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

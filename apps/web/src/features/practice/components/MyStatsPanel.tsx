"use client";

import { useMemo, useState } from "react";
import { Button } from "@/design-system/components";
import { useCountUpAnimation } from "@/features/practice/hooks/useCountUpAnimation";
import {
  buildStatsMetrics,
  mapPracticeStatsToViewModel,
} from "@/features/practice/stats/map-practice-stats";
import type { StatsMetric } from "@/features/practice/stats/stats-view-model";
import { useSettings } from "@/providers/SettingsProvider";
import profileStyles from "@/features/profile/profile-panel.module.css";
import styles from "./leaderboard-panel.module.css";

type MyStatsPanelProps = {
  animate: boolean;
  reducedMotion: boolean;
  showReset?: boolean;
  variant?: "default" | "profile";
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
  variant?: "default" | "profile";
}) {
  const numericValue = metric.numericValue ?? 0;
  const animatedValue = useCountUpAnimation({
    target: numericValue,
    active: animate && metric.numericValue !== undefined,
    reducedMotion,
  });

  const valueClass =
    variant === "profile" ? profileStyles.statsMetricValue : styles.metricValue;

  if (metric.numericValue === undefined) {
    return <span className={valueClass}>{metric.value}</span>;
  }

  if (metric.id === "win-rate") {
    return <span className={valueClass}>{`${animatedValue}%`}</span>;
  }

  return <span className={valueClass}>{animatedValue}</span>;
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
            <div className={profileStyles.statsMetricGrid}>
              {group.metricIds.map((metricId) => {
                const metric = metricsById[metricId];
                if (!metric) return null;
                return (
                  <MetricCard
                    key={metric.id}
                    metric={metric}
                    animate={animate}
                    reducedMotion={reducedMotion}
                    variant={variant}
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

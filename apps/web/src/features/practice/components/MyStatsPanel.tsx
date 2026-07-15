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
import styles from "./leaderboard-panel.module.css";

type MyStatsPanelProps = {
  animate: boolean;
  reducedMotion: boolean;
  showReset?: boolean;
};

function AnimatedMetricValue({
  metric,
  animate,
  reducedMotion,
}: {
  metric: StatsMetric;
  animate: boolean;
  reducedMotion: boolean;
}) {
  const numericValue = metric.numericValue ?? 0;
  const animatedValue = useCountUpAnimation({
    target: numericValue,
    active: animate && metric.numericValue !== undefined,
    reducedMotion,
  });

  if (metric.numericValue === undefined) {
    return <span className={styles.metricValue}>{metric.value}</span>;
  }

  if (metric.id === "win-rate") {
    return <span className={styles.metricValue}>{`${animatedValue}%`}</span>;
  }

  return <span className={styles.metricValue}>{animatedValue}</span>;
}

export function MyStatsPanel({
  animate,
  reducedMotion,
  showReset = true,
}: MyStatsPanelProps) {
  const { stats, resetStats } = useSettings();
  const [confirmReset, setConfirmReset] = useState(false);
  const viewModel = useMemo(() => mapPracticeStatsToViewModel(stats), [stats]);
  const metrics = useMemo(() => buildStatsMetrics(viewModel), [viewModel]);

  return (
    <div className={styles.myStatsPanel} data-source={viewModel.source}>
      <div className={styles.myStatsHeader}>
        <p className={styles.myStatsKicker}>Practice local stats</p>
        <p className={styles.myStatsNote}>
          Saved on this device only. Account stats will appear here later.
        </p>
      </div>

      <div className={styles.metricGrid}>
        {metrics.map((metric) => (
          <article key={metric.id} className={styles.metricCard}>
            <span className={styles.metricIcon} aria-hidden="true">
              {metric.icon}
            </span>
            <div className={styles.metricCopy}>
              <p className={styles.metricLabel}>{metric.label}</p>
              <AnimatedMetricValue
                metric={metric}
                animate={animate}
                reducedMotion={reducedMotion}
              />
            </div>
          </article>
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

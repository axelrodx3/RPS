"use client";

import { useState } from "react";
import { Button } from "@/design-system/components";
import { MOVE_LABELS } from "@/features/practice/engine/practice-engine";
import { useSettings } from "@/providers/SettingsProvider";
import styles from "./practice-stats-panel.module.css";

type PracticeStatsPanelProps = {
  compact?: boolean;
};

export function PracticeStatsPanel({
  compact = false,
}: PracticeStatsPanelProps) {
  const { stats, resetStats } = useSettings();
  const [confirmReset, setConfirmReset] = useState(false);

  const mostUsed = stats.mostUsedMove
    ? MOVE_LABELS[stats.mostUsedMove]
    : "None yet";

  return (
    <section
      className={`${styles.panel} ${compact ? styles.compact : ""}`.trim()}
      aria-label="Practice statistics"
    >
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>Practice statistics</p>
          <h2>Local only performance</h2>
        </div>
        {!compact ? (
          <p className={styles.note}>
            These stats never touch wallets, backends, or wagered leaderboards.
          </p>
        ) : null}
      </div>

      <dl className={styles.grid}>
        <div>
          <dt>Matches played</dt>
          <dd>{stats.matchesPlayed}</dd>
        </div>
        <div>
          <dt>Wins</dt>
          <dd>{stats.wins}</dd>
        </div>
        <div>
          <dt>Losses</dt>
          <dd>{stats.losses}</dd>
        </div>
        <div>
          <dt>Win rate</dt>
          <dd>{stats.winPercentage}%</dd>
        </div>
        <div>
          <dt>Current streak</dt>
          <dd>{stats.currentWinStreak}</dd>
        </div>
        <div>
          <dt>Best streak</dt>
          <dd>{stats.bestWinStreak}</dd>
        </div>
        <div>
          <dt>Rounds won</dt>
          <dd>{stats.roundsWon}</dd>
        </div>
        <div>
          <dt>Rounds lost</dt>
          <dd>{stats.roundsLost}</dd>
        </div>
        <div>
          <dt>Tied rounds</dt>
          <dd>{stats.tiedRounds}</dd>
        </div>
        <div>
          <dt>Automatic moves</dt>
          <dd>{stats.automaticMoveCount}</dd>
        </div>
        <div>
          <dt>Rock selections</dt>
          <dd>{stats.rockSelections}</dd>
        </div>
        <div>
          <dt>Paper selections</dt>
          <dd>{stats.paperSelections}</dd>
        </div>
        <div>
          <dt>Scissors selections</dt>
          <dd>{stats.scissorsSelections}</dd>
        </div>
        <div className={styles.wide}>
          <dt>Most used move</dt>
          <dd>{mostUsed}</dd>
        </div>
      </dl>

      {!compact ? (
        <div className={styles.reset}>
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
    </section>
  );
}

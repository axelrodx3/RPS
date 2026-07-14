"use client";

import {
  MOVE_EMOJI,
  MOVE_LABELS,
  formatRoundHistoryAccessibleLabel,
  type RoundOutcome,
} from "@/features/practice/engine/practice-engine";
import type { PracticeMatchState } from "@/features/practice/engine/practice-engine";
import styles from "../practice-game.module.css";

function timelineBadgeClass(outcome: RoundOutcome): string {
  if (outcome === "player") return styles.timelineWin ?? "";
  if (outcome === "cpu") return styles.timelineLoss ?? "";
  return styles.timelineTie ?? "";
}

function timelineOutcomeShort(outcome: RoundOutcome): string {
  if (outcome === "player") return "WIN";
  if (outcome === "cpu") return "LOSS";
  return "TIE";
}

type RoundTimelineProps = {
  history: PracticeMatchState["history"];
};

export function RoundTimeline({ history }: RoundTimelineProps) {
  if (history.length === 0) {
    return (
      <div className={styles.roundTimeline}>
        <h2 className={styles.timelineTitle}>Match timeline</h2>
        <p className={styles.timelineEmpty}>No rounds yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.roundTimeline}>
      <h2 className={styles.timelineTitle}>Match timeline</h2>
      <ol className={styles.timelineList}>
        {history.map((round, index) => {
          const chronologicalRound = index + 1;

          return (
            <li
              key={`${chronologicalRound}-${round.playerMove}-${round.cpuMove}-${round.outcome}`}
              className={styles.timelineEntry}
              aria-label={formatRoundHistoryAccessibleLabel(round)}
            >
              <span className={styles.timelineRound}>
                R{chronologicalRound}
              </span>
              <span className={styles.timelineMoves} aria-hidden="true">
                {MOVE_EMOJI[round.playerMove]} VS {MOVE_EMOJI[round.cpuMove]}
              </span>
              <span
                className={`${styles.timelineBadge} ${timelineBadgeClass(round.outcome)}`.trim()}
              >
                {timelineOutcomeShort(round.outcome)}
              </span>
              {round.playerTimedOut ? (
                <span className={styles.timelineAuto}>AUTO</span>
              ) : null}
              <span className={styles.srOnly}>
                {MOVE_LABELS[round.playerMove]} versus{" "}
                {MOVE_LABELS[round.cpuMove]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

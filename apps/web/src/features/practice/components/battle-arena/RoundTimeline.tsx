"use client";

import { useEffect, useRef, useState } from "react";
import {
  MOVE_LABELS,
  formatRoundHistoryAccessibleLabel,
  type RoundOutcome,
} from "@/features/practice/engine/practice-engine";
import { MoveArt } from "@/features/practice/components/battle-arena/MoveArt";
import type { PracticeMatchState } from "@/features/practice/engine/practice-engine";
import styles from "../practice-game.module.css";

const TIMELINE_SCROLL_THRESHOLD = 3;

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
  reducedMotion?: boolean;
};

export function RoundTimeline({
  history,
  reducedMotion = false,
}: RoundTimelineProps) {
  const previousLengthRef = useRef(0);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const newestEntryRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (history.length <= previousLengthRef.current) {
      return undefined;
    }

    previousLengthRef.current = history.length;
    const newestIndex = history.length - 1;
    let endTimer: number | undefined;
    const startTimer = window.setTimeout(() => {
      setHighlightIndex(newestIndex);
      newestEntryRef.current?.scrollIntoView({
        block: "nearest",
        behavior: reducedMotion ? "auto" : "smooth",
      });
      endTimer = window.setTimeout(() => {
        setHighlightIndex(null);
      }, 520);
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
      if (endTimer) {
        window.clearTimeout(endTimer);
      }
      window.setTimeout(() => setHighlightIndex(null), 0);
    };
  }, [history.length, reducedMotion]);

  if (history.length === 0) {
    return (
      <div
        className={`${styles.roundTimeline} ${styles.roundTimelineEmpty}`.trim()}
        data-testid="match-timeline"
      >
        <h2 className={styles.timelineTitle}>Match timeline</h2>
        <div className={styles.timelineEmptyBody} role="status">
          <span className={styles.timelineEmptyIcon} aria-hidden="true" />
          <p className={styles.timelineEmpty}>No rounds yet.</p>
        </div>
      </div>
    );
  }

  const scrollable = history.length > TIMELINE_SCROLL_THRESHOLD;

  return (
    <div
      className={[
        styles.roundTimeline,
        styles.roundTimelineFilled,
        scrollable ? styles.roundTimelineScrollable : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="match-timeline"
      data-timeline-scrollable={scrollable ? "true" : "false"}
    >
      <h2 className={styles.timelineTitle}>Match timeline</h2>
      <ol ref={listRef} className={styles.timelineList}>
        {history.map((round, index) => {
          const chronologicalRound = index + 1;
          const isNewest = index === history.length - 1;
          const entryClass = [
            styles.timelineEntry,
            isNewest && highlightIndex === index && !reducedMotion
              ? styles.timelineEntryNew
              : "",
            timelineBadgeClass(round.outcome),
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li
              key={`${chronologicalRound}-${round.playerMove}-${round.cpuMove}-${round.outcome}`}
              ref={isNewest ? newestEntryRef : undefined}
              className={entryClass}
              aria-label={formatRoundHistoryAccessibleLabel(round)}
              data-testid={isNewest ? "timeline-entry-newest" : undefined}
            >
              <span className={styles.timelineRound}>
                R{chronologicalRound}
              </span>
              <span className={styles.timelineMoves} aria-hidden="true">
                <MoveArt move={round.playerMove} variant="timeline" />
                <span className={styles.timelineVs}>VS</span>
                <MoveArt move={round.cpuMove} variant="timeline" />
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

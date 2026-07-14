"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button, Card } from "@/design-system/components";
import {
  TIMER_WARNING_SECONDS,
  MOVE_EMOJI,
  MOVE_LABELS,
  countAutomaticMoves,
  countTiedRounds,
  formatRoundHistoryAccessibleLabel,
  isMoveSelectionLocked,
  type Move,
  type RoundOutcome,
} from "@/features/practice/engine/practice-engine";
import { MOVE_LIST } from "@/features/practice/moves/move-metadata";
import { usePracticeGame } from "@/features/practice/hooks/usePracticeGame";
import { PracticeStatsPanel } from "@/features/practice/components/PracticeStatsPanel";
import { VictoryConfetti } from "@/features/practice/components/VictoryConfetti";
import { useAudio } from "@/providers/AudioProvider";
import styles from "./practice-game.module.css";

function phaseLabel(
  phase: ReturnType<typeof usePracticeGame>["state"]["phase"],
  transitionMessage: string | null,
) {
  switch (phase) {
    case "countdown":
      return "Round starting";
    case "commit":
      return "Choose your move";
    case "move_locked":
      return "Move locked";
    case "waiting_cpu":
      return "Waiting on CPU";
    case "reveal_pause":
      return "Reveal incoming";
    case "reveal":
      return "Reveal";
    case "round_result":
      return transitionMessage ?? "Round result";
    case "match_complete":
      return "Match complete";
    default:
      return "Practice";
  }
}

function liveAnnouncement(
  state: ReturnType<typeof usePracticeGame>["state"],
): string {
  if (
    state.phase === "commit" &&
    state.timerSeconds === TIMER_WARNING_SECONDS
  ) {
    return `${state.timerSeconds} seconds remaining`;
  }
  if (
    (state.phase === "reveal" || state.phase === "round_result") &&
    state.roundOutcome
  ) {
    if (state.roundOutcome === "tie") return "Tie. Replay round.";
    if (state.roundOutcome === "player") return "You win the round.";
    return "CPU wins the round.";
  }
  if (state.phase === "round_result" && state.transitionMessage) {
    return state.transitionMessage;
  }
  if (state.phase === "match_complete" && state.matchWinner) {
    return state.matchWinner === "player" ? "Victory." : "Defeat.";
  }
  return "";
}

function revealCardClass(
  side: "player" | "cpu",
  outcome: RoundOutcome | null,
): string {
  const classes = [styles.revealCard];
  if (side === "player") classes.push(styles.revealCardPlayer);
  if (side === "cpu") classes.push(styles.revealCardCpu);

  if (!outcome) return classes.filter(Boolean).join(" ");

  if (outcome === "tie") {
    classes.push(styles.revealOutcomeTie);
    return classes.filter(Boolean).join(" ");
  }

  const playerWon = outcome === "player";
  const isWinner =
    (side === "player" && playerWon) || (side === "cpu" && outcome === "cpu");

  classes.push(isWinner ? styles.revealOutcomeWin : styles.revealOutcomeLoss);
  if (!isWinner) classes.push(styles.revealCardMuted);

  return classes.filter(Boolean).join(" ");
}

function historyBadgeClass(outcome: RoundOutcome): string {
  if (outcome === "player") return styles.historyBadgeWin ?? "";
  if (outcome === "cpu") return styles.historyBadgeLoss ?? "";
  return styles.historyBadgeTie ?? "";
}

function historyOutcomeLabel(outcome: RoundOutcome): string {
  if (outcome === "tie") return "Tie";
  if (outcome === "player") return "You won";
  return "CPU won";
}

function MoveButton({
  move,
  selected,
  locked,
  onSelect,
}: {
  move: (typeof MOVE_LIST)[number];
  selected: boolean;
  locked: boolean;
  onSelect: (move: Move) => void;
}) {
  const { unlock } = useAudio();
  const disabled = locked;

  return (
    <button
      type="button"
      className={[
        styles.moveButton,
        selected ? styles.moveSelected : "",
        locked ? styles.moveLocked : "",
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      aria-label={`Choose ${move.label}`}
      aria-pressed={selected}
      onClick={() => onSelect(move.id)}
      onFocus={() => {
        if (!disabled) unlock();
      }}
    >
      <span className={styles.moveIcon} aria-hidden="true">
        {move.icon}
      </span>
      <span className={styles.moveLabel}>{move.label}</span>
      <span className={styles.moveHint}>{move.description}</span>
    </button>
  );
}

function RoundHistory({
  history,
}: {
  history: ReturnType<typeof usePracticeGame>["state"]["history"];
}) {
  if (history.length === 0) {
    return (
      <p className={styles.historyEmpty}>Round history will appear here.</p>
    );
  }

  return (
    <ol className={styles.historyList}>
      {history.map((round) => (
        <li
          key={`${round.round}-${round.playerMove}-${round.cpuMove}-${round.outcome}`}
          className={styles.historyItem}
          aria-label={formatRoundHistoryAccessibleLabel(round)}
        >
          <span className={styles.historyRound}>Round {round.round}</span>
          <span aria-hidden="true" className={styles.historyMoves}>
            {MOVE_EMOJI[round.playerMove]} vs {MOVE_EMOJI[round.cpuMove]}
          </span>
          <span
            className={`${styles.historyBadge} ${historyBadgeClass(round.outcome)}`.trim()}
          >
            {historyOutcomeLabel(round.outcome)}
            {round.playerTimedOut ? (
              <span className={styles.autoBadge}>Automatic</span>
            ) : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

function useScorePulse(score: number) {
  const previousScore = useRef(score);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (score > previousScore.current) {
      setPulse(true);
      const timer = window.setTimeout(() => setPulse(false), 520);
      previousScore.current = score;
      return () => window.clearTimeout(timer);
    }
    previousScore.current = score;
    return undefined;
  }, [score]);

  return pulse;
}

export function PracticeGame() {
  const { state, startMatch, selectMove, rematch, winTarget, timerTotal } =
    usePracticeGame();
  const announcement = liveAnnouncement(state);
  const playerScorePulse = useScorePulse(state.playerScore);
  const cpuScorePulse = useScorePulse(state.cpuScore);

  if (state.phase === "idle") {
    return (
      <div className={styles.pageStack}>
        <Card padding="lg" className={styles.intro}>
          <span className={styles.kicker}>Practice · Local CPU</span>
          <h1>Best of 3 · First to 2</h1>
          <p>
            No wallet, no backend, no balances. This local mode mirrors the
            future 1v1 phase flow: countdown, private selection, reveal, and
            scoring.
          </p>
          <ul className={styles.rules}>
            <li>20 second move timer with automatic random fallback.</li>
            <li>Ties replay the round without changing the score.</li>
            <li>CPU plays fairly with equal random probability.</li>
          </ul>
          <Button size="lg" onClick={startMatch}>
            Start Practice Match
          </Button>
        </Card>
        <PracticeStatsPanel />
      </div>
    );
  }

  const locked = isMoveSelectionLocked(state.phase);
  const timerProgress = (state.timerSeconds / timerTotal) * 100;
  const timerWarning =
    state.phase === "commit" && state.timerSeconds <= TIMER_WARNING_SECONDS;
  const tiedRounds = countTiedRounds(state.history);
  const automaticMoves = countAutomaticMoves(state.history);
  const showRevealPanel =
    (state.phase === "reveal" || state.phase === "round_result") &&
    state.playerMove &&
    state.cpuMove;
  const showPlayerVictoryConfetti =
    state.phase === "match_complete" && state.matchWinner === "player";

  return (
    <div className={styles.pageStack}>
      <div className={styles.srOnly} aria-live="polite">
        {announcement}
      </div>

      <div className={styles.arenaShell}>
        <div className={styles.arenaBackdrop} aria-hidden="true" />
        <div className={styles.arenaParticles} aria-hidden="true" />
        <div className={styles.arenaVignette} aria-hidden="true" />

        <section className={styles.arena} aria-label="Practice match">
          <VictoryConfetti active={showPlayerVictoryConfetti} />

          <div className={styles.scoreRow}>
            <article
              className={`${styles.combatant} ${styles.combatantPlayer}`.trim()}
            >
              <div className={styles.avatar} aria-hidden="true">
                P
              </div>
              <span className={styles.combatantLabel}>You</span>
              <strong
                className={`${styles.combatantScore} ${playerScorePulse ? styles.scorePulse : ""}`.trim()}
              >
                {state.playerScore}
              </strong>
              <span className={styles.combatantMeta}>First to {winTarget}</span>
            </article>
            <div className={styles.roundBadge}>
              <span>Round</span>
              <strong>{state.round}</strong>
            </div>
            <article
              className={`${styles.combatant} ${styles.combatantCpu}`.trim()}
            >
              <div className={styles.avatar} aria-hidden="true">
                C
              </div>
              <span className={styles.combatantLabel}>CPU</span>
              <strong
                className={`${styles.combatantScore} ${cpuScorePulse ? styles.scorePulse : ""}`.trim()}
              >
                {state.cpuScore}
              </strong>
              <span className={styles.combatantMeta}>First to {winTarget}</span>
            </article>
          </div>

          <div className={styles.phaseBar}>
            <span className={styles.phaseLabel}>
              {phaseLabel(state.phase, state.transitionMessage)}
            </span>
          </div>

          {state.phase === "countdown" ? (
            <div className={styles.centerStage}>
              <p className={styles.kicker}>Opening round</p>
              <div className={styles.countdown} aria-live="assertive">
                {state.countdown || "Go"}
              </div>
            </div>
          ) : null}

          {state.phase === "commit" ? (
            <div className={styles.centerStage}>
              <div
                className={`${styles.heroTimer} ${timerWarning ? styles.heroTimerWarning : ""}`.trim()}
                role="timer"
                aria-label="Choose your move"
              >
                <span className={styles.heroTimerValue}>
                  {state.timerSeconds}s
                </span>
                <span className={styles.heroTimerLabel}>Choose your move</span>
                <div className={styles.heroTimerTrack} aria-hidden="true">
                  <div
                    className={styles.heroTimerFill}
                    style={{ width: `${timerProgress}%` }}
                  />
                </div>
              </div>
              <div
                className={styles.moveGrid}
                role="group"
                aria-label="Choose move"
              >
                {MOVE_LIST.map((move) => (
                  <MoveButton
                    key={move.id}
                    move={move}
                    selected={state.playerMove === move.id}
                    locked={locked}
                    onSelect={selectMove}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {state.phase === "move_locked" && state.playerMove ? (
            <div className={styles.centerStage}>
              <div className={styles.lockedPanel}>
                <div className={styles.lockIcon} aria-hidden="true">
                  🔒
                </div>
                <span className={styles.kicker}>Move locked</span>
                <strong
                  className={styles.lockedMoveLabel}
                  aria-label={MOVE_LABELS[state.playerMove]}
                >
                  <span aria-hidden="true">{MOVE_EMOJI[state.playerMove]}</span>
                </strong>
                {state.playerTimedOut ? (
                  <span className={styles.autoBadge}>Automatic selection</span>
                ) : null}
              </div>
            </div>
          ) : null}

          {state.phase === "waiting_cpu" && state.playerMove ? (
            <div className={styles.centerStage}>
              <div className={styles.waitingCpuPanel}>
                <span
                  className={`${styles.kicker} ${styles.waitingDots}`.trim()}
                >
                  Waiting on CPU
                </span>
                <strong
                  className={styles.lockedMoveLabel}
                  aria-label={MOVE_LABELS[state.playerMove]}
                >
                  <span aria-hidden="true">{MOVE_EMOJI[state.playerMove]}</span>
                </strong>
              </div>
            </div>
          ) : null}

          {state.phase === "reveal_pause" && state.playerMove ? (
            <div className={styles.centerStage}>
              <div className={styles.revealPausePanel}>
                <span className={styles.kicker}>Reveal incoming</span>
                <strong
                  className={styles.lockedMoveLabel}
                  aria-label={MOVE_LABELS[state.playerMove]}
                >
                  <span aria-hidden="true">{MOVE_EMOJI[state.playerMove]}</span>
                </strong>
              </div>
            </div>
          ) : null}

          {showRevealPanel ? (
            <div className={`${styles.centerStage} ${styles.revealStage}`}>
              <div className={styles.revealGrid}>
                <article
                  className={revealCardClass("player", state.roundOutcome)}
                >
                  <span>You</span>
                  <strong aria-label={MOVE_LABELS[state.playerMove!]}>
                    <span aria-hidden="true">
                      {MOVE_EMOJI[state.playerMove!]}
                    </span>
                  </strong>
                  {state.playerTimedOut ? (
                    <span className={styles.autoBadge}>Automatic</span>
                  ) : null}
                </article>
                <article className={revealCardClass("cpu", state.roundOutcome)}>
                  <span>CPU</span>
                  <strong aria-label={MOVE_LABELS[state.cpuMove!]}>
                    <span aria-hidden="true">{MOVE_EMOJI[state.cpuMove!]}</span>
                  </strong>
                </article>
              </div>
              {state.phase === "reveal" || state.phase === "round_result" ? (
                <p
                  className={`${styles.resultLine} ${
                    state.phase === "round_result"
                      ? styles.resultLineVisible
                      : ""
                  }`.trim()}
                >
                  {state.roundOutcome === "tie"
                    ? "Tie. Replay round."
                    : state.roundOutcome === "player"
                      ? "You win the round."
                      : "CPU wins the round."}
                </p>
              ) : null}
              {state.phase === "round_result" && state.transitionMessage ? (
                <p className={styles.transitionLine}>
                  {state.transitionMessage}
                </p>
              ) : null}
            </div>
          ) : null}

          {state.phase === "match_complete" ? (
            <div className={styles.centerStage}>
              <p className={styles.kicker}>Match complete</p>
              <h2
                className={`${styles.matchTitle} ${
                  state.matchWinner === "player"
                    ? styles.matchVictory
                    : styles.matchDefeat
                }`.trim()}
              >
                {state.matchWinner === "player" ? "Victory" : "Defeat"}
              </h2>
              <p
                className={`${styles.matchSummary} ${
                  state.matchWinner === "player"
                    ? styles.matchSummaryVictory
                    : state.matchWinner === "cpu"
                      ? styles.matchSummaryDefeat
                      : ""
                }`.trim()}
              >
                Final score {state.playerScore} to {state.cpuScore}. Tied rounds{" "}
                {tiedRounds}. Automatic moves {automaticMoves}.
              </p>
              <div className={styles.actions}>
                <Button onClick={rematch}>Rematch</Button>
                <Link href="/">
                  <Button variant="secondary">Return Home</Button>
                </Link>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <Card padding="md" className={styles.historyPanel}>
        <h2 className={styles.historyTitle}>Round history</h2>
        <RoundHistory history={state.history} />
      </Card>

      {state.phase === "match_complete" ? <PracticeStatsPanel compact /> : null}
    </div>
  );
}

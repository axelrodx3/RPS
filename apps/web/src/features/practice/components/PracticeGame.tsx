"use client";

import Link from "next/link";
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
    case "waiting_reveal":
      return "Move locked";
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
  if (state.phase === "reveal" && state.roundOutcome) {
    if (state.roundOutcome === "tie") return "Tie. Replaying this round.";
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
  const base = styles.revealCard ?? "";
  if (!outcome) return base;
  if (outcome === "tie") {
    return `${base} ${styles.revealOutcomeTie ?? ""}`.trim();
  }
  const playerWon = outcome === "player";
  const isWinner =
    (side === "player" && playerWon) || (side === "cpu" && outcome === "cpu");
  return `${base} ${
    isWinner ? styles.revealOutcomeWin : styles.revealOutcomeLoss
  }`.trim();
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
          aria-label={formatRoundHistoryAccessibleLabel(round)}
        >
          <span>Round {round.round}</span>
          <span aria-hidden="true" className={styles.historyMoves}>
            {MOVE_EMOJI[round.playerMove]} vs {MOVE_EMOJI[round.cpuMove]}
          </span>
          <span>
            {round.outcome === "tie"
              ? "Tie"
              : round.outcome === "player"
                ? "You won"
                : "CPU won"}
            {round.playerTimedOut ? (
              <span className={styles.autoBadge}>Automatic</span>
            ) : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function PracticeGame() {
  const { state, startMatch, selectMove, rematch, winTarget, timerTotal } =
    usePracticeGame();
  const announcement = liveAnnouncement(state);

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

  return (
    <div className={styles.pageStack}>
      <div className={styles.srOnly} aria-live="polite">
        {announcement}
      </div>

      <section className={styles.arena} aria-label="Practice match">
        <div className={styles.scoreRow}>
          <article className={styles.combatant}>
            <span className={styles.combatantLabel}>You</span>
            <strong className={styles.combatantScore}>
              {state.playerScore}
            </strong>
            <span className={styles.combatantMeta}>First to {winTarget}</span>
          </article>
          <div className={styles.roundBadge}>
            <span>Round</span>
            <strong>{state.round}</strong>
          </div>
          <article className={styles.combatant}>
            <span className={styles.combatantLabel}>CPU</span>
            <strong className={styles.combatantScore}>{state.cpuScore}</strong>
            <span className={styles.combatantMeta}>First to {winTarget}</span>
          </article>
        </div>

        <div className={styles.phaseBar}>
          <span className={styles.phaseLabel}>
            {phaseLabel(state.phase, state.transitionMessage)}
          </span>
          {state.phase === "waiting_reveal" ? (
            <span className={styles.cpuThinking}>CPU preparing move…</span>
          ) : null}
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

        {state.phase === "waiting_reveal" && state.playerMove ? (
          <div className={styles.centerStage}>
            <div className={styles.lockedPanel}>
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
            {state.phase === "reveal" ? (
              <p className={styles.resultLine}>
                {state.roundOutcome === "tie"
                  ? "Tie. Replaying this round."
                  : state.roundOutcome === "player"
                    ? "You win the round."
                    : "CPU wins the round."}
              </p>
            ) : null}
            {state.phase === "round_result" && state.transitionMessage ? (
              <p className={styles.transitionLine}>{state.transitionMessage}</p>
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
            <p className={styles.matchSummary}>
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

      <Card padding="md">
        <h2 className={styles.historyTitle}>Round history</h2>
        <RoundHistory history={state.history} />
      </Card>

      {state.phase === "match_complete" ? <PracticeStatsPanel compact /> : null}
    </div>
  );
}

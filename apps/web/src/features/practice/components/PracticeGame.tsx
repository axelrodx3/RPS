"use client";

import Link from "next/link";
import { Button, Card, Scoreboard, Timer } from "@/design-system/components";
import {
  MOVE_EMOJI,
  MOVE_LABELS,
  MOVES,
  type Move,
} from "@/features/practice/engine/practice-engine";
import { usePracticeGame } from "@/features/practice/hooks/usePracticeGame";
import styles from "./practice-game.module.css";

function MoveButton({
  move,
  onSelect,
  disabled,
}: {
  move: Move;
  onSelect: (move: Move) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={styles.moveButton}
      disabled={disabled}
      aria-label={`Choose ${MOVE_LABELS[move]}`}
      onClick={() => onSelect(move)}
    >
      <span className={styles.moveEmoji} aria-hidden="true">
        {MOVE_EMOJI[move]}
      </span>
      <span>{MOVE_LABELS[move]}</span>
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
        <li key={`${round.round}-${round.playerMove}-${round.cpuMove}`}>
          <span>Round {round.round}</span>
          <span>
            {MOVE_EMOJI[round.playerMove]} vs {MOVE_EMOJI[round.cpuMove]}
          </span>
          <span>
            {round.outcome === "tie"
              ? "Tie"
              : round.outcome === "player"
                ? "You won"
                : "CPU won"}
            {round.playerTimedOut ? " · auto" : ""}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function PracticeGame() {
  const { state, startMatch, selectMove, rematch, winTarget, timerTotal } =
    usePracticeGame();

  if (state.phase === "idle") {
    return (
      <Card padding="lg" className={styles.intro}>
        <span className={styles.kicker}>Practice · Local CPU</span>
        <h1>Best of 3 · First to 2</h1>
        <p>
          No wallet, no backend, no balances. This local mode mirrors the future
          1v1 phase flow: countdown, private selection, reveal, and scoring.
        </p>
        <ul className={styles.rules}>
          <li>20 second move timer — expired timers pick a random move.</li>
          <li>Ties replay the round without changing the score.</li>
          <li>CPU plays fairly with equal random probability.</li>
        </ul>
        <Button size="lg" onClick={startMatch}>
          Start Practice Match
        </Button>
      </Card>
    );
  }

  return (
    <div className={styles.game}>
      <Scoreboard
        playerScore={state.playerScore}
        opponentScore={state.cpuScore}
        winTarget={winTarget}
        round={state.round}
      />

      {state.phase === "countdown" ? (
        <Card padding="lg" className={styles.stage}>
          <p className={styles.kicker}>Get ready</p>
          <div className={styles.countdown} aria-live="assertive">
            {state.countdown || "Go"}
          </div>
        </Card>
      ) : null}

      {state.phase === "commit" ? (
        <Card padding="lg" className={styles.stage}>
          <Timer
            seconds={state.timerSeconds}
            totalSeconds={timerTotal}
            label="Choose your move"
          />
          <div
            className={styles.moveGrid}
            role="group"
            aria-label="Choose move"
          >
            {MOVES.map((move) => (
              <MoveButton
                key={move}
                move={move}
                onSelect={selectMove}
                disabled={Boolean(state.playerMove)}
              />
            ))}
          </div>
          <p className={styles.hint}>Your move stays hidden until reveal.</p>
        </Card>
      ) : null}

      {state.phase === "waiting_reveal" ? (
        <Card padding="lg" className={styles.stage}>
          <p className={styles.kicker}>Move locked</p>
          <div className={styles.lockedMove}>
            <span aria-hidden="true">{MOVE_EMOJI[state.playerMove!]}</span>
            <strong>{MOVE_LABELS[state.playerMove!]}</strong>
          </div>
          <p className={styles.hint}>Waiting for CPU reveal…</p>
        </Card>
      ) : null}

      {state.phase === "reveal" || state.phase === "round_result" ? (
        <Card padding="lg" className={`${styles.stage} ${styles.reveal}`}>
          <p className={styles.kicker}>Reveal</p>
          <div className={styles.revealGrid}>
            <div>
              <span>You</span>
              <strong aria-hidden="true">
                {MOVE_EMOJI[state.playerMove!]}
              </strong>
              <small>{MOVE_LABELS[state.playerMove!]}</small>
            </div>
            <div>
              <span>CPU</span>
              <strong aria-hidden="true">{MOVE_EMOJI[state.cpuMove!]}</strong>
              <small>{MOVE_LABELS[state.cpuMove!]}</small>
            </div>
          </div>
          <p className={styles.resultLine} aria-live="polite">
            {state.roundOutcome === "tie"
              ? "Tie — replaying this round."
              : state.roundOutcome === "player"
                ? "You win the round."
                : "CPU wins the round."}
          </p>
        </Card>
      ) : null}

      {state.phase === "match_complete" ? (
        <Card padding="lg" className={styles.stage}>
          <p className={styles.kicker}>Match complete</p>
          <h2 className={styles.matchTitle}>
            {state.matchWinner === "player" ? "Victory" : "Defeat"}
          </h2>
          <p className={styles.hint}>
            Final score {state.playerScore}–{state.cpuScore}. Practice stats are
            stored locally only.
          </p>
          <div className={styles.actions}>
            <Button onClick={rematch}>Rematch</Button>
            <Link href="/">
              <Button variant="secondary">Return Home</Button>
            </Link>
          </div>
        </Card>
      ) : null}

      <Card padding="md">
        <h2 className={styles.historyTitle}>Round history</h2>
        <RoundHistory history={state.history} />
      </Card>
    </div>
  );
}

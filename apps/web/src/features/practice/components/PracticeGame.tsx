"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card } from "@/design-system/components";
import { useHoverSound } from "@/lib/audio/use-hover-sound";
import {
  TIMER_WARNING_SECONDS,
  countAutomaticMoves,
  countTiedRounds,
  isMoveSelectionLocked,
} from "@/features/practice/engine/practice-engine";
import { usePracticeGame } from "@/features/practice/hooks/usePracticeGame";
import { PracticeStatsPanel } from "@/features/practice/components/PracticeStatsPanel";
import { VictoryConfetti } from "@/features/practice/components/VictoryConfetti";
import { BattleStage } from "@/features/practice/components/battle-arena/BattleStage";
import { MatchCompletePanel } from "@/features/practice/components/battle-arena/MatchCompletePanel";
import { MoveDock } from "@/features/practice/components/battle-arena/MoveDock";
import { PlayerStrip } from "@/features/practice/components/battle-arena/PlayerStrip";
import { RoundTimeline } from "@/features/practice/components/battle-arena/RoundTimeline";
import styles from "./practice-game.module.css";

function phaseLabel(
  phase: ReturnType<typeof usePracticeGame>["state"]["phase"],
  transitionMessage: string | null,
): string {
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
  const playPracticeHover = useHoverSound(false);
  const announcement = liveAnnouncement(state);
  const playerScorePulse = useScorePulse(state.playerScore);
  const cpuScorePulse = useScorePulse(state.cpuScore);

  if (state.phase === "idle") {
    return (
      <div className={styles.pageStack}>
        <Card padding="lg" className={styles.intro}>
          <span className={styles.kicker}>Practice · Local CPU</span>
          <h1>Best of 3</h1>
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
          <Button
            size="lg"
            onClick={startMatch}
            onPointerEnter={playPracticeHover}
          >
            Start Practice Match
          </Button>
        </Card>
        <PracticeStatsPanel />
      </div>
    );
  }

  const locked = isMoveSelectionLocked(state.phase);
  const tiedRounds = countTiedRounds(state.history);
  const automaticMoves = countAutomaticMoves(state.history);
  const label = phaseLabel(state.phase, state.transitionMessage);
  const showPlayerVictoryConfetti =
    state.phase === "match_complete" && state.matchWinner === "player";
  const victoryMatchKey = `win-${state.playerScore}-${state.cpuScore}-${state.history.length}`;
  const resultMatchKey = `${state.matchWinner ?? "none"}-${state.playerScore}-${state.cpuScore}-${state.history.length}`;

  return (
    <div className={styles.pageStack}>
      <div className={styles.srOnly} aria-live="polite">
        {announcement}
      </div>

      <div className={styles.battleArena}>
        <div className={styles.arenaEnvironment} aria-hidden="true">
          <div className={styles.arenaGlow} />
          <div className={styles.arenaBeams} />
          <div className={styles.arenaGrid} />
          <div className={styles.arenaVignette} />
          <div className={styles.arenaParticles} />
        </div>

        <section className={styles.battleShell} aria-label="Practice match">
          <VictoryConfetti
            active={showPlayerVictoryConfetti}
            matchKey={victoryMatchKey}
          />

          <PlayerStrip
            playerScore={state.playerScore}
            cpuScore={state.cpuScore}
            round={state.round}
            winTarget={winTarget}
            phaseLabel={label}
            playerScorePulse={playerScorePulse}
            cpuScorePulse={cpuScorePulse}
          />

          {state.phase === "match_complete" && state.matchWinner ? (
            <MatchCompletePanel
              matchWinner={state.matchWinner}
              playerScore={state.playerScore}
              cpuScore={state.cpuScore}
              tiedRounds={tiedRounds}
              automaticMoves={automaticMoves}
              matchKey={resultMatchKey}
              onRematch={rematch}
            />
          ) : (
            <>
              <BattleStage
                phase={state.phase}
                countdown={state.countdown}
                timerSeconds={state.timerSeconds}
                timerTotal={timerTotal}
                playerMove={state.playerMove}
                cpuMove={state.cpuMove}
                roundOutcome={state.roundOutcome}
                playerTimedOut={state.playerTimedOut}
                transitionMessage={state.transitionMessage}
                phaseLabel={label}
              />
              {state.phase === "commit" ? (
                <MoveDock
                  selectedMove={state.playerMove}
                  locked={locked}
                  onSelect={selectMove}
                />
              ) : null}
            </>
          )}
        </section>

        <aside className={styles.timelineAside}>
          <RoundTimeline history={state.history} />
        </aside>
      </div>

      {state.phase === "match_complete" ? <PracticeStatsPanel compact /> : null}
    </div>
  );
}

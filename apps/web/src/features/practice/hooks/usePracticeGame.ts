"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  PRACTICE_COUNTDOWN_SECONDS,
  PRACTICE_TIMER_SECONDS,
  PRACTICE_WIN_TARGET,
  practiceReducer,
  createInitialMatchState,
  pickRandomMove,
  randomCpuRevealDelayMs,
  type Move,
  type PracticeMatchState,
} from "@/features/practice/engine/practice-engine";
import { useAudio } from "@/providers/AudioProvider";
import { useSettings } from "@/providers/SettingsProvider";

export function usePracticeGame() {
  const [state, dispatch] = useReducer(
    practiceReducer,
    null,
    createInitialMatchState,
  );
  const { play, unlock } = useAudio();
  const { recordMatch, settings } = useSettings();
  const cpuTimeoutRef = useRef<number | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);
  const matchRecordedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (cpuTimeoutRef.current) {
      window.clearTimeout(cpuTimeoutRef.current);
      cpuTimeoutRef.current = null;
    }
    if (revealTimeoutRef.current) {
      window.clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
  }, []);

  const startMatch = useCallback(() => {
    unlock();
    matchRecordedRef.current = false;
    clearTimers();
    dispatch({ type: "START_MATCH" });
    play("button");
  }, [clearTimers, play, unlock]);

  const selectMove = useCallback(
    (move: Move) => {
      unlock();
      dispatch({ type: "SELECT_MOVE", move });
      play("button");
    },
    [play, unlock],
  );

  const rematch = useCallback(() => {
    matchRecordedRef.current = false;
    clearTimers();
    dispatch({ type: "REMATCH" });
    play("button");
  }, [clearTimers, play]);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    if (state.phase !== "countdown") return;
    if (state.countdown === PRACTICE_COUNTDOWN_SECONDS) {
      play("countdown");
    }
    const id = window.setInterval(
      () => dispatch({ type: "TICK_COUNTDOWN" }),
      1000,
    );
    return () => window.clearInterval(id);
  }, [state.phase, state.countdown, play]);

  useEffect(() => {
    if (state.phase !== "commit") return;
    const id = window.setInterval(() => {
      dispatch({ type: "TICK_TIMER" });
    }, 1000);
    return () => window.clearInterval(id);
  }, [state.phase, state.round]);

  useEffect(() => {
    if (state.phase !== "commit") return;
    if (state.timerSeconds === 0 && !state.playerMove) {
      dispatch({ type: "TIMEOUT_PLAYER" });
    }
  }, [state.phase, state.timerSeconds, state.playerMove]);

  useEffect(() => {
    if (state.phase !== "waiting_reveal" || !state.playerMove) return;
    const delay = randomCpuRevealDelayMs();
    cpuTimeoutRef.current = window.setTimeout(() => {
      dispatch({ type: "CPU_REVEAL", move: pickRandomMove() });
    }, delay);
    return () => {
      if (cpuTimeoutRef.current) {
        window.clearTimeout(cpuTimeoutRef.current);
        cpuTimeoutRef.current = null;
      }
    };
  }, [state.phase, state.playerMove, state.round]);

  useEffect(() => {
    if (state.phase !== "reveal") return;
    play("reveal");
    if (state.roundOutcome === "player") play("round_win");
    if (state.roundOutcome === "cpu") play("round_loss");
    if (state.roundOutcome === "tie") play("round_tie");

    const duration = settings.reducedMotion ? 600 : 1800;
    revealTimeoutRef.current = window.setTimeout(() => {
      dispatch({ type: "ADVANCE_FROM_REVEAL" });
    }, duration);
    return () => {
      if (revealTimeoutRef.current) {
        window.clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
    };
  }, [
    state.phase,
    state.roundOutcome,
    state.round,
    play,
    settings.reducedMotion,
  ]);

  useEffect(() => {
    if (state.phase !== "round_result") return;
    const id = window.setTimeout(
      () => {
        dispatch({ type: "ADVANCE_FROM_ROUND_RESULT" });
      },
      settings.reducedMotion ? 500 : 1200,
    );
    return () => window.clearTimeout(id);
  }, [state.phase, settings.reducedMotion]);

  useEffect(() => {
    if (state.phase !== "match_complete" || !state.matchWinner) return;
    if (matchRecordedRef.current) return;
    matchRecordedRef.current = true;
    play(state.matchWinner === "player" ? "match_win" : "match_loss");
    recordMatch(state.matchWinner, state.history);
  }, [state.phase, state.matchWinner, state.history, play, recordMatch]);

  return {
    state,
    startMatch,
    selectMove,
    rematch,
    winTarget: PRACTICE_WIN_TARGET,
    timerTotal: PRACTICE_TIMER_SECONDS,
  };
}

export type PracticeGameController = ReturnType<typeof usePracticeGame>;
export type { PracticeMatchState, Move };

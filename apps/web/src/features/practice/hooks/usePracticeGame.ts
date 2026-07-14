"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  MOVE_LOCKED_MS,
  MOVE_LOCKED_REDUCED_MS,
  PRACTICE_COUNTDOWN_SECONDS,
  PRACTICE_TIMER_SECONDS,
  PRACTICE_WIN_TARGET,
  REVEAL_DISPLAY_MS,
  REVEAL_DISPLAY_REDUCED_MS,
  REVEAL_PAUSE_MS,
  REVEAL_PAUSE_REDUCED_MS,
  ROUND_RESULT_DISPLAY_MS,
  ROUND_RESULT_DISPLAY_REDUCED_MS,
  TIMER_WARNING_SECONDS,
  WAITING_CPU_MS,
  WAITING_CPU_REDUCED_MS,
  practiceReducer,
  createInitialMatchState,
  pickRandomMove,
  type Move,
  type PracticeMatchState,
} from "@/features/practice/engine/practice-engine";
import { computeRemainingSeconds } from "@/lib/storage/local-storage";
import { useAudio } from "@/providers/AudioProvider";
import { useSettings } from "@/providers/SettingsProvider";

type RandomSource = {
  move: () => Move;
};

const defaultRandom: RandomSource = {
  move: () => pickRandomMove(),
};

export function usePracticeGame(random: RandomSource = defaultRandom) {
  const [state, dispatch] = useReducer(
    practiceReducer,
    null,
    createInitialMatchState,
  );
  const { play, unlock, stopAll } = useAudio();
  const { recordMatch, settings } = useSettings();
  const pathname = usePathname();
  const moveLockedTimeoutRef = useRef<number | null>(null);
  const waitingCpuTimeoutRef = useRef<number | null>(null);
  const revealPauseTimeoutRef = useRef<number | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);
  const roundResultTimeoutRef = useRef<number | null>(null);
  const matchRecordedRef = useRef(false);
  const timerWarningPlayedRef = useRef(false);
  const timeoutHandledRef = useRef(false);
  const moveLockedPlayedRef = useRef(false);
  const countdownAudioTickRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    for (const ref of [
      moveLockedTimeoutRef,
      waitingCpuTimeoutRef,
      revealPauseTimeoutRef,
      revealTimeoutRef,
      roundResultTimeoutRef,
    ]) {
      if (ref.current) {
        window.clearTimeout(ref.current);
        ref.current = null;
      }
    }
  }, []);

  useEffect(() => {
    if (pathname !== "/practice") {
      clearTimers();
      stopAll();
      dispatch({ type: "ABORT" });
    }
  }, [pathname, clearTimers, stopAll]);

  useEffect(
    () => () => {
      clearTimers();
      stopAll();
    },
    [clearTimers, stopAll],
  );

  const startMatch = useCallback(() => {
    unlock();
    matchRecordedRef.current = false;
    timerWarningPlayedRef.current = false;
    timeoutHandledRef.current = false;
    moveLockedPlayedRef.current = false;
    countdownAudioTickRef.current = null;
    clearTimers();
    dispatch({ type: "START_MATCH" });
    play("button");
  }, [clearTimers, play, unlock]);

  const selectMove = useCallback(
    (move: Move) => {
      if (state.phase !== "commit" || state.playerMove || state.roundResolved) {
        return;
      }
      unlock();
      moveLockedPlayedRef.current = true;
      dispatch({ type: "SELECT_MOVE", move });
      play("move_locked");
    },
    [play, unlock, state.phase, state.playerMove, state.roundResolved],
  );

  const rematch = useCallback(() => {
    matchRecordedRef.current = false;
    timerWarningPlayedRef.current = false;
    timeoutHandledRef.current = false;
    moveLockedPlayedRef.current = false;
    countdownAudioTickRef.current = null;
    clearTimers();
    dispatch({ type: "REMATCH" });
    play("button");
  }, [clearTimers, play]);

  useEffect(() => {
    if (state.phase !== "countdown") {
      countdownAudioTickRef.current = null;
      return;
    }

    if (
      state.countdown >= 1 &&
      state.countdown <= PRACTICE_COUNTDOWN_SECONDS &&
      countdownAudioTickRef.current !== state.countdown
    ) {
      countdownAudioTickRef.current = state.countdown;
      play("countdown");
    }
  }, [state.phase, state.countdown, play]);

  useEffect(() => {
    if (state.phase !== "countdown") return;

    const id = window.setInterval(
      () => dispatch({ type: "TICK_COUNTDOWN" }),
      1000,
    );
    return () => window.clearInterval(id);
  }, [state.phase]);

  useEffect(() => {
    if (
      state.phase !== "commit" ||
      !state.commitStartedAt ||
      state.playerMove
    ) {
      return;
    }

    const sync = () => {
      const remaining = computeRemainingSeconds(
        state.commitStartedAt!,
        PRACTICE_TIMER_SECONDS,
        Date.now(),
      );
      dispatch({ type: "SYNC_TIMER", seconds: remaining });

      if (
        remaining <= TIMER_WARNING_SECONDS &&
        remaining > 0 &&
        !timerWarningPlayedRef.current
      ) {
        timerWarningPlayedRef.current = true;
        play("countdown_warning");
      }

      if (remaining === 0 && !timeoutHandledRef.current && !state.playerMove) {
        timeoutHandledRef.current = true;
        if (!moveLockedPlayedRef.current) {
          moveLockedPlayedRef.current = true;
          play("move_locked");
        }
        dispatch({ type: "TIMEOUT_PLAYER", move: random.move() });
      }
    };

    sync();
    const id = window.setInterval(sync, 250);
    const onVisibility = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [
    state.phase,
    state.commitStartedAt,
    state.playerMove,
    state.round,
    play,
    random,
  ]);

  useEffect(() => {
    if (state.phase !== "move_locked" || !state.playerMove) return;

    const duration = settings.reducedMotion
      ? MOVE_LOCKED_REDUCED_MS
      : MOVE_LOCKED_MS;
    moveLockedTimeoutRef.current = window.setTimeout(() => {
      dispatch({ type: "ADVANCE_FROM_MOVE_LOCKED" });
    }, duration);
    return () => {
      if (moveLockedTimeoutRef.current) {
        window.clearTimeout(moveLockedTimeoutRef.current);
        moveLockedTimeoutRef.current = null;
      }
    };
  }, [state.phase, state.playerMove, state.round, settings.reducedMotion]);

  useEffect(() => {
    if (state.phase !== "waiting_cpu" || !state.playerMove) return;

    const duration = settings.reducedMotion
      ? WAITING_CPU_REDUCED_MS
      : WAITING_CPU_MS;
    waitingCpuTimeoutRef.current = window.setTimeout(() => {
      dispatch({ type: "CPU_REVEAL", move: random.move() });
    }, duration);
    return () => {
      if (waitingCpuTimeoutRef.current) {
        window.clearTimeout(waitingCpuTimeoutRef.current);
        waitingCpuTimeoutRef.current = null;
      }
    };
  }, [
    state.phase,
    state.playerMove,
    state.round,
    random,
    settings.reducedMotion,
  ]);

  useEffect(() => {
    if (state.phase !== "reveal_pause") return;

    const duration = settings.reducedMotion
      ? REVEAL_PAUSE_REDUCED_MS
      : REVEAL_PAUSE_MS;
    revealPauseTimeoutRef.current = window.setTimeout(() => {
      dispatch({ type: "ADVANCE_FROM_REVEAL_PAUSE" });
    }, duration);
    return () => {
      if (revealPauseTimeoutRef.current) {
        window.clearTimeout(revealPauseTimeoutRef.current);
        revealPauseTimeoutRef.current = null;
      }
    };
  }, [state.phase, state.round, settings.reducedMotion]);

  useEffect(() => {
    if (state.phase !== "reveal") return;

    const duration = settings.reducedMotion
      ? REVEAL_DISPLAY_REDUCED_MS
      : REVEAL_DISPLAY_MS;
    revealTimeoutRef.current = window.setTimeout(() => {
      dispatch({ type: "ADVANCE_FROM_REVEAL" });
    }, duration);
    return () => {
      if (revealTimeoutRef.current) {
        window.clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
    };
  }, [state.phase, state.round, settings.reducedMotion]);

  useEffect(() => {
    if (state.phase !== "round_result") return;
    moveLockedPlayedRef.current = false;
    const duration = settings.reducedMotion
      ? ROUND_RESULT_DISPLAY_REDUCED_MS
      : ROUND_RESULT_DISPLAY_MS;
    roundResultTimeoutRef.current = window.setTimeout(() => {
      timerWarningPlayedRef.current = false;
      timeoutHandledRef.current = false;
      dispatch({ type: "ADVANCE_FROM_ROUND_RESULT" });
    }, duration);
    return () => {
      if (roundResultTimeoutRef.current) {
        window.clearTimeout(roundResultTimeoutRef.current);
        roundResultTimeoutRef.current = null;
      }
    };
  }, [
    state.phase,
    state.round,
    state.transitionMessage,
    settings.reducedMotion,
  ]);

  useEffect(() => {
    if (state.phase !== "match_complete" || !state.matchWinner) return;
    if (matchRecordedRef.current) return;
    matchRecordedRef.current = true;
    play(state.matchWinner === "player" ? "match_win" : "match_loss");
    recordMatch(
      state.matchWinner,
      state.history.map((round) => ({
        outcome: round.outcome,
        playerTimedOut: round.playerTimedOut,
        playerMove: round.playerMove,
      })),
    );
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

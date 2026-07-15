"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  CPU_REVEAL_DELAY_MS,
  CPU_REVEAL_DELAY_REDUCED_MS,
  MOVE_LOCKED_MS,
  MOVE_LOCKED_REDUCED_MS,
  PRACTICE_COUNTDOWN_SECONDS,
  PRACTICE_TIMER_SECONDS,
  PRACTICE_WIN_TARGET,
  REVEAL_DISPLAY_MS,
  REVEAL_DISPLAY_REDUCED_MS,
  REVEAL_PAUSE_MS,
  REVEAL_PAUSE_REDUCED_MS,
  ROUND_DISPLAY_COMMIT_DELAY_MS,
  ROUND_INTRO_MS,
  ROUND_INTRO_REDUCED_MS,
  ROUND_RESULT_DISPLAY_MS,
  ROUND_RESULT_DISPLAY_REDUCED_MS,
  SELECTION_COUNTDOWN_SECONDS,
  WAITING_CPU_MS,
  WAITING_CPU_REDUCED_MS,
  practiceReducer,
  createInitialMatchState,
  pickRandomMove,
  type Move,
  type PracticeMatchState,
  type PracticePhase,
} from "@/features/practice/engine/practice-engine";
import { computeRemainingSeconds } from "@/lib/storage/local-storage";
import { MOVE_LOCK_SOUND, type SoundId } from "@/lib/audio/sound-registry";
import { useAudio } from "@/providers/AudioProvider";
import { useSettings } from "@/providers/SettingsProvider";

type RandomSource = {
  move: () => Move;
};

const defaultRandom: RandomSource = {
  move: () => pickRandomMove(),
};

const PHASE_SOUND: Partial<Record<PracticePhase, SoundId>> = {
  waiting_cpu: "waiting_cpu",
  reveal_pause: "reveal_incoming",
};

export function usePracticeGame(random: RandomSource = defaultRandom) {
  const [state, dispatch] = useReducer(
    practiceReducer,
    null,
    createInitialMatchState,
  );
  const { play, unlock, stopAll, stopSelectionCountdown, stopPhaseCues } =
    useAudio();
  const { recordMatch, settings } = useSettings();
  const pathname = usePathname();
  const moveLockedTimeoutRef = useRef<number | null>(null);
  const waitingCpuTimeoutRef = useRef<number | null>(null);
  const revealPauseTimeoutRef = useRef<number | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);
  const roundResultTimeoutRef = useRef<number | null>(null);
  const roundDisplayCommitTimeoutRef = useRef<number | null>(null);
  const matchRecordedRef = useRef(false);
  const timeoutHandledRef = useRef(false);
  const roundIntroTimeoutRef = useRef<number | null>(null);
  const countdownAudioTickRef = useRef<number | null>(null);
  const selectionCountdownTickRef = useRef<number | null>(null);
  const moveLockAudioPlayedRef = useRef<string | null>(null);
  const phaseAudioPlayedRef = useRef<PracticePhase | null>(null);
  const revealImpactAudioPlayedRef = useRef(false);
  const roundOutcomeAudioPlayedRef = useRef(false);
  const roundKeyRef = useRef<string>("");

  const clearTimers = useCallback(() => {
    for (const ref of [
      moveLockedTimeoutRef,
      waitingCpuTimeoutRef,
      revealPauseTimeoutRef,
      revealTimeoutRef,
      roundResultTimeoutRef,
      roundIntroTimeoutRef,
      roundDisplayCommitTimeoutRef,
    ]) {
      if (ref.current) {
        window.clearTimeout(ref.current);
        ref.current = null;
      }
    }
  }, []);

  const resetAudioGuards = useCallback(() => {
    countdownAudioTickRef.current = null;
    selectionCountdownTickRef.current = null;
    moveLockAudioPlayedRef.current = null;
    phaseAudioPlayedRef.current = null;
    revealImpactAudioPlayedRef.current = false;
    roundOutcomeAudioPlayedRef.current = false;
  }, []);

  useEffect(() => {
    if (pathname !== "/practice") {
      clearTimers();
      stopAll();
      resetAudioGuards();
      dispatch({ type: "ABORT" });
    }
  }, [pathname, clearTimers, stopAll, resetAudioGuards]);

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
    timeoutHandledRef.current = false;
    resetAudioGuards();
    clearTimers();
    stopAll();
    dispatch({ type: "START_MATCH" });
  }, [clearTimers, resetAudioGuards, stopAll, unlock]);

  const selectMove = useCallback(
    (move: Move) => {
      if (state.phase !== "commit" || state.playerMove || state.roundResolved) {
        return;
      }
      unlock();
      stopSelectionCountdown();
      selectionCountdownTickRef.current = null;
      dispatch({ type: "SELECT_MOVE", move });
    },
    [
      stopSelectionCountdown,
      unlock,
      state.phase,
      state.playerMove,
      state.roundResolved,
    ],
  );

  const rematch = useCallback(() => {
    matchRecordedRef.current = false;
    timeoutHandledRef.current = false;
    resetAudioGuards();
    clearTimers();
    stopAll();
    dispatch({ type: "REMATCH" });
  }, [clearTimers, resetAudioGuards, stopAll]);

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
    if (state.phase !== "round_intro") return;

    const duration = settings.reducedMotion
      ? ROUND_INTRO_REDUCED_MS
      : ROUND_INTRO_MS;
    roundIntroTimeoutRef.current = window.setTimeout(() => {
      dispatch({ type: "ADVANCE_FROM_ROUND_INTRO" });
    }, duration);
    return () => {
      if (roundIntroTimeoutRef.current) {
        window.clearTimeout(roundIntroTimeoutRef.current);
        roundIntroTimeoutRef.current = null;
      }
    };
  }, [state.phase, state.round, settings.reducedMotion]);

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
        remaining <= SELECTION_COUNTDOWN_SECONDS &&
        remaining > 0 &&
        selectionCountdownTickRef.current !== remaining
      ) {
        selectionCountdownTickRef.current = remaining;
        play("selection_countdown_tick");
      }

      if (remaining > SELECTION_COUNTDOWN_SECONDS) {
        selectionCountdownTickRef.current = null;
      }

      if (remaining === 0 && !timeoutHandledRef.current && !state.playerMove) {
        timeoutHandledRef.current = true;
        stopSelectionCountdown();
        selectionCountdownTickRef.current = null;
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
    stopSelectionCountdown,
  ]);

  useEffect(() => {
    const roundKey = `${state.round}-${state.playerMove ?? "none"}`;
    if (roundKeyRef.current !== roundKey) {
      roundKeyRef.current = roundKey;
      phaseAudioPlayedRef.current = null;
      revealImpactAudioPlayedRef.current = false;
      roundOutcomeAudioPlayedRef.current = false;
    }

    if (state.phase === "move_locked" && state.playerMove) {
      const lockKey = `${state.round}-${state.playerMove}`;
      if (moveLockAudioPlayedRef.current !== lockKey) {
        stopSelectionCountdown();
        stopPhaseCues();
        moveLockAudioPlayedRef.current = lockKey;
        play(MOVE_LOCK_SOUND[state.playerMove]);
      }
      return;
    }

    const soundId = PHASE_SOUND[state.phase];
    if (!soundId || phaseAudioPlayedRef.current === state.phase) {
      return;
    }

    stopPhaseCues();
    phaseAudioPlayedRef.current = state.phase;
    play(soundId);
  }, [
    state.phase,
    state.round,
    state.playerMove,
    play,
    stopPhaseCues,
    stopSelectionCountdown,
  ]);

  const onBothMovesRevealed = useCallback(() => {
    if (revealImpactAudioPlayedRef.current) return;
    revealImpactAudioPlayedRef.current = true;
    stopPhaseCues();
    play("reveal");
  }, [play, stopPhaseCues]);

  useEffect(() => {
    if (state.phase !== "reveal") {
      if (roundDisplayCommitTimeoutRef.current) {
        window.clearTimeout(roundDisplayCommitTimeoutRef.current);
        roundDisplayCommitTimeoutRef.current = null;
      }
      return;
    }

    if (!state.pendingRound) {
      return;
    }

    const revealDelay = settings.reducedMotion
      ? CPU_REVEAL_DELAY_REDUCED_MS
      : CPU_REVEAL_DELAY_MS;

    roundDisplayCommitTimeoutRef.current = window.setTimeout(() => {
      dispatch({ type: "COMMIT_ROUND_DISPLAY" });
    }, revealDelay + ROUND_DISPLAY_COMMIT_DELAY_MS);

    return () => {
      if (roundDisplayCommitTimeoutRef.current) {
        window.clearTimeout(roundDisplayCommitTimeoutRef.current);
        roundDisplayCommitTimeoutRef.current = null;
      }
    };
  }, [state.phase, state.round, state.pendingRound, settings.reducedMotion]);

  useEffect(() => {
    if (state.phase !== "reveal" || !state.roundOutcome) return;
    if (roundOutcomeAudioPlayedRef.current) return;

    const revealDelay = settings.reducedMotion
      ? CPU_REVEAL_DELAY_REDUCED_MS
      : CPU_REVEAL_DELAY_MS;

    roundOutcomeAudioPlayedRef.current = true;
    window.setTimeout(
      () => {
        if (state.roundOutcome === "tie") {
          play("round_tie");
        } else if (state.roundOutcome === "player") {
          play("round_win");
        } else if (state.roundOutcome === "cpu") {
          play("round_loss");
        }
      },
      revealDelay + ROUND_DISPLAY_COMMIT_DELAY_MS + 120,
    );
  }, [
    state.phase,
    state.round,
    state.roundOutcome,
    play,
    settings.reducedMotion,
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
    const duration = settings.reducedMotion
      ? ROUND_RESULT_DISPLAY_REDUCED_MS
      : ROUND_RESULT_DISPLAY_MS;
    roundResultTimeoutRef.current = window.setTimeout(() => {
      timeoutHandledRef.current = false;
      selectionCountdownTickRef.current = null;
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
    onBothMovesRevealed,
    winTarget: PRACTICE_WIN_TARGET,
    timerTotal: PRACTICE_TIMER_SECONDS,
  };
}

export type PracticeGameController = ReturnType<typeof usePracticeGame>;
export type { PracticeMatchState, Move };

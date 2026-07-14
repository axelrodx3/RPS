/** @vitest-environment happy-dom */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  MOVES,
  practiceReducer,
  createInitialMatchState,
} from "@/features/practice/engine/practice-engine";
import { usePracticeGame } from "@/features/practice/hooks/usePracticeGame";
import { AppProviders } from "@/providers/AppProviders";

function wrapper({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}

const deterministicRandom = {
  move: (() => {
    let index = 0;
    return () => MOVES[index++ % MOVES.length]!;
  })(),
  cpuDelayMs: () => 500,
};

describe("usePracticeGame", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    deterministicRandom.move = (() => {
      let index = 0;
      return () => MOVES[index++ % MOVES.length]!;
    })();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("enters countdown after startMatch", () => {
    const { result } = renderHook(() => usePracticeGame(deterministicRandom), {
      wrapper,
    });
    expect(result.current.state.phase).toBe("idle");

    act(() => {
      result.current.startMatch();
    });

    expect(result.current.state.phase).toBe("countdown");
    expect(result.current.state.countdown).toBe(3);
  });

  it("selects rock and resolves a scored round", () => {
    const { result } = renderHook(() => usePracticeGame(deterministicRandom), {
      wrapper,
    });

    act(() => {
      result.current.startMatch();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.state.phase).toBe("commit");

    act(() => {
      result.current.selectMove("rock");
    });
    expect(result.current.state.playerMove).toBe("rock");

    act(() => {
      vi.advanceTimersByTime(500);
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.state.phase).toBe("reveal");
    expect(result.current.state.cpuMove).not.toBeNull();
    expect(MOVES).toContain(result.current.state.cpuMove!);
  });

  it("does not change score on ties", () => {
    let state = createInitialMatchState();
    state = {
      ...state,
      phase: "reveal_countdown",
      playerMove: "rock",
      round: 1,
    };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "rock" });
    expect(state.roundOutcome).toBe("tie");
    expect(state.playerScore).toBe(0);
    expect(state.cpuScore).toBe(0);
  });

  it("ends the match at two player wins", () => {
    let state = createInitialMatchState();
    state = {
      ...state,
      phase: "reveal_countdown",
      playerMove: "rock",
      playerScore: 1,
      round: 2,
    };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "scissors" });
    expect(state.playerScore).toBe(2);
    expect(state.matchWinner).toBe("player");
  });

  it("rematch resets to countdown", () => {
    const { result } = renderHook(() => usePracticeGame(deterministicRandom), {
      wrapper,
    });
    act(() => {
      result.current.startMatch();
    });
    act(() => {
      result.current.rematch();
    });
    expect(result.current.state.phase).toBe("countdown");
    expect(result.current.state.playerScore).toBe(0);
  });

  it("timeouts choose a valid automatic move once", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "commit", timerSeconds: 0 };
    state = practiceReducer(state, {
      type: "TIMEOUT_PLAYER",
      move: "scissors",
    });
    expect(state.playerMove).toBe("scissors");
    expect(state.playerTimedOut).toBe(true);
  });

  it("ignores duplicate move selection in the reducer", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "commit" };
    state = practiceReducer(state, { type: "SELECT_MOVE", move: "rock" });
    state = practiceReducer(state, { type: "SELECT_MOVE", move: "paper" });
    expect(state.playerMove).toBe("rock");
  });
});

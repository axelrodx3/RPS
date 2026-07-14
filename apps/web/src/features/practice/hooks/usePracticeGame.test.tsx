/** @vitest-environment happy-dom */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  MOVES,
  REVEAL_DISPLAY_MS,
  REVEAL_PAUSE_MS,
  ROUND_RESULT_DISPLAY_MS,
  practiceReducer,
  createInitialMatchState,
} from "@/features/practice/engine/practice-engine";
import { usePracticeGame } from "@/features/practice/hooks/usePracticeGame";
import { audioEngine } from "@/lib/audio/audio-engine";
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
    vi.spyOn(audioEngine, "play").mockImplementation(() => {});
    deterministicRandom.move = (() => {
      let index = 0;
      return () => MOVES[index++ % MOVES.length]!;
    })();
  });

  afterEach(() => {
    audioEngine.stopAll();
    vi.restoreAllMocks();
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

  it("plays opening countdown ticks on 3, 2, and 1 without duplicates", () => {
    const playSpy = vi.mocked(audioEngine.play);
    const { result } = renderHook(() => usePracticeGame(deterministicRandom), {
      wrapper,
    });

    act(() => {
      result.current.startMatch();
    });
    expect(playSpy.mock.calls.filter(([id]) => id === "countdown").length).toBe(
      1,
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(playSpy.mock.calls.filter(([id]) => id === "countdown").length).toBe(
      2,
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(playSpy.mock.calls.filter(([id]) => id === "countdown").length).toBe(
      3,
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.state.phase).toBe("commit");
    expect(playSpy.mock.calls.filter(([id]) => id === "countdown").length).toBe(
      3,
    );
  });

  it("selects rock and passes through reveal pause before reveal", () => {
    const playSpy = vi.mocked(audioEngine.play);
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
    expect(playSpy.mock.calls.some(([id]) => id === "move_locked")).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.state.phase).toBe("reveal_pause");
    expect(result.current.state.cpuMove).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(REVEAL_PAUSE_MS);
    });
    expect(result.current.state.phase).toBe("reveal");
  });

  it("advances from round result directly into commit without another countdown", () => {
    const { result } = renderHook(() => usePracticeGame(deterministicRandom), {
      wrapper,
    });

    act(() => {
      result.current.startMatch();
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    act(() => {
      result.current.selectMove("rock");
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    act(() => {
      vi.advanceTimersByTime(REVEAL_PAUSE_MS);
    });
    act(() => {
      vi.advanceTimersByTime(REVEAL_DISPLAY_MS);
    });
    expect(result.current.state.phase).toBe("round_result");
    act(() => {
      vi.advanceTimersByTime(ROUND_RESULT_DISPLAY_MS - 100);
    });
    expect(result.current.state.phase).toBe("round_result");
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.state.phase).toBe("commit");
    expect(result.current.state.countdown).toBe(0);
  });

  it("does not change score on ties", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "waiting_reveal", playerMove: "rock", round: 1 };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "rock" });
    expect(state.roundOutcome).toBe("tie");
    expect(state.playerScore).toBe(0);
    expect(state.cpuScore).toBe(0);
  });

  it("ends the match at two player wins", () => {
    let state = createInitialMatchState();
    state = {
      ...state,
      phase: "waiting_reveal",
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

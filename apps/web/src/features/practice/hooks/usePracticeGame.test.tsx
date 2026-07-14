/** @vitest-environment happy-dom */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  MOVES,
  MOVE_LOCKED_MS,
  REVEAL_DISPLAY_MS,
  REVEAL_PAUSE_MS,
  ROUND_INTRO_MS,
  ROUND_RESULT_DISPLAY_MS,
  WAITING_CPU_MS,
  practiceReducer,
  createInitialMatchState,
} from "@/features/practice/engine/practice-engine";
import { usePracticeGame } from "@/features/practice/hooks/usePracticeGame";
import { audioEngine } from "@/lib/audio/audio-engine";
import { AppProviders } from "@/providers/AppProviders";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/practice"),
}));

import { usePathname } from "next/navigation";

function wrapper({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}

const deterministicRandom = {
  move: (() => {
    let index = 0;
    return () => MOVES[index++ % MOVES.length]!;
  })(),
};

function reachCommitPhase(result: {
  current: ReturnType<typeof usePracticeGame>;
}) {
  act(() => {
    result.current.startMatch();
  });
  act(() => {
    vi.advanceTimersByTime(3000);
  });
  act(() => {
    vi.advanceTimersByTime(ROUND_INTRO_MS);
  });
}

describe("usePracticeGame", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(usePathname).mockReturnValue("/practice");
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
    act(() => {
      result.current.startMatch();
    });
    expect(result.current.state.phase).toBe("countdown");
  });

  it("walks through the post lock phase order with configured durations", () => {
    const { result } = renderHook(() => usePracticeGame(deterministicRandom), {
      wrapper,
    });

    reachCommitPhase(result);

    act(() => {
      result.current.selectMove("rock");
    });
    expect(result.current.state.phase).toBe("move_locked");

    act(() => {
      vi.advanceTimersByTime(MOVE_LOCKED_MS - 100);
    });
    expect(result.current.state.phase).toBe("move_locked");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.state.phase).toBe("waiting_cpu");

    act(() => {
      vi.advanceTimersByTime(WAITING_CPU_MS);
    });
    expect(result.current.state.phase).toBe("reveal_pause");

    act(() => {
      vi.advanceTimersByTime(REVEAL_PAUSE_MS);
    });
    expect(result.current.state.phase).toBe("reveal");

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
    expect(result.current.state.phase).toBe("round_intro");

    act(() => {
      vi.advanceTimersByTime(ROUND_INTRO_MS);
    });
    expect(result.current.state.phase).toBe("commit");
    expect(result.current.state.countdown).toBe(0);
  });

  it("clears pending timers on rematch", () => {
    const { result } = renderHook(() => usePracticeGame(deterministicRandom), {
      wrapper,
    });

    reachCommitPhase(result);
    act(() => {
      result.current.selectMove("rock");
    });
    act(() => {
      result.current.rematch();
    });
    expect(result.current.state.phase).toBe("countdown");

    act(() => {
      vi.advanceTimersByTime(MOVE_LOCKED_MS + WAITING_CPU_MS);
    });
    expect(result.current.state.phase).toBe("countdown");
  });

  it("clears pending timers when navigation aborts the match", () => {
    const { result, rerender } = renderHook(
      () => usePracticeGame(deterministicRandom),
      {
        wrapper,
      },
    );

    reachCommitPhase(result);
    act(() => {
      result.current.selectMove("rock");
    });

    vi.mocked(usePathname).mockReturnValue("/guide");
    rerender();

    expect(result.current.state.phase).toBe("idle");

    act(() => {
      vi.advanceTimersByTime(
        MOVE_LOCKED_MS + WAITING_CPU_MS + REVEAL_PAUSE_MS + REVEAL_DISPLAY_MS,
      );
    });
    expect(result.current.state.phase).toBe("idle");
  });

  it("does not change score on ties", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "waiting_cpu", playerMove: "rock", round: 1 };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "rock" });
    expect(state.roundOutcome).toBe("tie");
    expect(state.playerScore).toBe(0);
    expect(state.cpuScore).toBe(0);
  });

  it("ignores duplicate move selection in the reducer", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "commit" };
    state = practiceReducer(state, { type: "SELECT_MOVE", move: "rock" });
    state = practiceReducer(state, { type: "SELECT_MOVE", move: "paper" });
    expect(state.playerMove).toBe("rock");
  });
});

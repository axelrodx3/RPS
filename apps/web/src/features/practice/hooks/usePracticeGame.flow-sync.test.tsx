/** @vitest-environment happy-dom */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  CPU_REVEAL_DELAY_MS,
  MOVES,
  MOVE_LOCKED_MS,
  PRACTICE_TIMER_SECONDS,
  REVEAL_DISPLAY_MS,
  REVEAL_PAUSE_MS,
  ROUND_DISPLAY_COMMIT_DELAY_MS,
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

describe("usePracticeGame flow synchronization", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(usePathname).mockReturnValue("/practice");
    vi.spyOn(audioEngine, "play").mockImplementation(() => {});
    vi.spyOn(audioEngine, "stopAll").mockImplementation(() => {});
    vi.spyOn(audioEngine, "stopSelectionCountdown").mockImplementation(
      () => {},
    );
    vi.spyOn(audioEngine, "stopPhaseCues").mockImplementation(() => {});
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

  it("walks through post lock phases with configured durations", () => {
    const { result } = renderHook(() => usePracticeGame(deterministicRandom), {
      wrapper,
    });

    reachCommitPhase(result);

    act(() => {
      result.current.selectMove("rock");
    });
    expect(result.current.state.phase).toBe("move_locked");
    expect(result.current.state.history).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(MOVE_LOCKED_MS);
    });
    expect(result.current.state.phase).toBe("waiting_cpu");
    expect(result.current.state.history).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(WAITING_CPU_MS);
    });
    expect(result.current.state.phase).toBe("reveal_pause");
    expect(result.current.state.history).toHaveLength(0);
    expect(result.current.state.cpuMove).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(REVEAL_PAUSE_MS);
    });
    expect(result.current.state.phase).toBe("reveal");
    expect(result.current.state.history).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(
        CPU_REVEAL_DELAY_MS + ROUND_DISPLAY_COMMIT_DELAY_MS,
      );
    });
    expect(result.current.state.history).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(
        REVEAL_DISPLAY_MS -
          (CPU_REVEAL_DELAY_MS + ROUND_DISPLAY_COMMIT_DELAY_MS),
      );
    });
    expect(result.current.state.phase).toBe("round_result");

    act(() => {
      vi.advanceTimersByTime(ROUND_RESULT_DISPLAY_MS);
    });
    expect(result.current.state.phase).toBe("round_intro");
  });

  it("plays opening countdown exactly three times without button overlap", () => {
    const { result } = renderHook(() => usePracticeGame(deterministicRandom), {
      wrapper,
    });

    act(() => {
      result.current.startMatch();
    });

    expect(audioEngine.play).toHaveBeenCalledWith(
      "countdown",
      expect.any(Object),
    );
    expect(audioEngine.play).not.toHaveBeenCalledWith(
      "button",
      expect.any(Object),
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const countdownCalls = vi
      .mocked(audioEngine.play)
      .mock.calls.filter(([id]) => id === "countdown");
    expect(countdownCalls).toHaveLength(3);
  });

  it("plays selection countdown ticks at 3, 2, and 1 only", () => {
    const { result } = renderHook(() => usePracticeGame(deterministicRandom), {
      wrapper,
    });

    reachCommitPhase(result);

    act(() => {
      vi.advanceTimersByTime((PRACTICE_TIMER_SECONDS - 4) * 1000);
    });

    const ticksBeforeWarning = vi
      .mocked(audioEngine.play)
      .mock.calls.filter(([id]) => id === "selection_countdown_tick");
    expect(ticksBeforeWarning).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      vi
        .mocked(audioEngine.play)
        .mock.calls.filter(([id]) => id === "selection_countdown_tick"),
    ).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      vi
        .mocked(audioEngine.play)
        .mock.calls.filter(([id]) => id === "selection_countdown_tick"),
    ).toHaveLength(2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      vi
        .mocked(audioEngine.play)
        .mock.calls.filter(([id]) => id === "selection_countdown_tick"),
    ).toHaveLength(3);
    expect(
      vi
        .mocked(audioEngine.play)
        .mock.calls.some(([id]) => id === "countdown_warning"),
    ).toBe(false);
  });

  it("stops selection countdown when the player chooses during final three seconds", () => {
    const { result } = renderHook(() => usePracticeGame(deterministicRandom), {
      wrapper,
    });

    reachCommitPhase(result);

    act(() => {
      vi.advanceTimersByTime((PRACTICE_TIMER_SECONDS - 3) * 1000 + 100);
    });

    act(() => {
      result.current.selectMove("paper");
    });

    expect(audioEngine.stopSelectionCountdown).toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(
      vi
        .mocked(audioEngine.play)
        .mock.calls.filter(([id]) => id === "selection_countdown_tick").length,
    ).toBeLessThanOrEqual(1);
  });

  it("plays phase transition sounds once per phase", () => {
    const { result } = renderHook(() => usePracticeGame(deterministicRandom), {
      wrapper,
    });

    reachCommitPhase(result);
    act(() => {
      result.current.selectMove("scissors");
    });
    act(() => {
      vi.advanceTimersByTime(MOVE_LOCKED_MS);
    });
    act(() => {
      vi.advanceTimersByTime(WAITING_CPU_MS);
    });
    act(() => {
      vi.advanceTimersByTime(REVEAL_PAUSE_MS);
    });

    expect(
      vi
        .mocked(audioEngine.play)
        .mock.calls.filter(([id]) => id === "move_locked"),
    ).toHaveLength(1);
    expect(
      vi
        .mocked(audioEngine.play)
        .mock.calls.filter(([id]) => id === "waiting_cpu"),
    ).toHaveLength(1);
    expect(
      vi
        .mocked(audioEngine.play)
        .mock.calls.filter(([id]) => id === "reveal_incoming"),
    ).toHaveLength(1);
  });

  it("clears pending timers and audio on rematch", () => {
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

    expect(audioEngine.stopAll).toHaveBeenCalled();
    expect(result.current.state.phase).toBe("countdown");

    act(() => {
      vi.advanceTimersByTime(MOVE_LOCKED_MS + WAITING_CPU_MS);
    });
    expect(result.current.state.phase).toBe("countdown");
  });

  it("clears pending timers when navigation aborts the match", () => {
    const { result, rerender } = renderHook(
      () => usePracticeGame(deterministicRandom),
      { wrapper },
    );

    reachCommitPhase(result);
    act(() => {
      result.current.selectMove("rock");
    });

    vi.mocked(usePathname).mockReturnValue("/guide");
    rerender();

    expect(result.current.state.phase).toBe("idle");
    expect(audioEngine.stopAll).toHaveBeenCalled();
  });

  it("does not change score on ties before display commit", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "waiting_cpu", playerMove: "rock", round: 1 };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "rock" });
    expect(state.roundOutcome).toBe("tie");
    expect(state.playerScore).toBe(0);
    expect(state.cpuScore).toBe(0);
  });
});

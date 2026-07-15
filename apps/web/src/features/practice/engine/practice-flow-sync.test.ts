import { describe, expect, it } from "vitest";
import {
  CPU_REVEAL_DELAY_MS,
  MOVE_LOCKED_MS,
  REVEAL_DISPLAY_MS,
  REVEAL_PAUSE_MS,
  RESULT_VISIBLE_TOTAL_MS,
  ROUND_DISPLAY_COMMIT_DELAY_MS,
  ROUND_RESULT_DISPLAY_MS,
  SELECTION_COUNTDOWN_SECONDS,
  TIMER_WARNING_SECONDS,
  WAITING_CPU_MS,
  practiceReducer,
  createInitialMatchState,
} from "@/features/practice/engine/practice-engine";

describe("practice phase pacing targets", () => {
  it("uses deliberate premium presentation durations", () => {
    expect(MOVE_LOCKED_MS).toBeGreaterThanOrEqual(900);
    expect(WAITING_CPU_MS).toBeGreaterThanOrEqual(1200);
    expect(REVEAL_PAUSE_MS).toBeGreaterThanOrEqual(1000);
    expect(REVEAL_DISPLAY_MS).toBeGreaterThanOrEqual(800);
    expect(ROUND_RESULT_DISPLAY_MS).toBeGreaterThanOrEqual(3000);
  });

  it("keeps combined reveal and result readable", () => {
    expect(RESULT_VISIBLE_TOTAL_MS).toBeGreaterThanOrEqual(3800);
  });

  it("starts selection countdown warning at three seconds", () => {
    expect(TIMER_WARNING_SECONDS).toBe(3);
    expect(SELECTION_COUNTDOWN_SECONDS).toBe(3);
  });

  it("commits arena display before reveal phase ends", () => {
    expect(
      CPU_REVEAL_DELAY_MS + ROUND_DISPLAY_COMMIT_DELAY_MS,
    ).toBeLessThanOrEqual(REVEAL_DISPLAY_MS);
  });
});

describe("timeline privacy in reducer", () => {
  it("does not append history or scores at CPU reveal", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "waiting_cpu", playerMove: "rock" };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "scissors" });

    expect(state.phase).toBe("reveal_pause");
    expect(state.cpuMove).toBe("scissors");
    expect(state.roundOutcome).toBe("player");
    expect(state.history).toHaveLength(0);
    expect(state.playerScore).toBe(0);
    expect(state.pendingRound).toMatchObject({
      playerMove: "rock",
      cpuMove: "scissors",
      outcome: "player",
    });
    expect(state.pendingPlayerScore).toBe(1);
  });

  it("commits timeline and scores only through COMMIT_ROUND_DISPLAY", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "waiting_cpu", playerMove: "paper" };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "rock" });
    state = practiceReducer(state, { type: "ADVANCE_FROM_REVEAL_PAUSE" });
    expect(state.phase).toBe("reveal");
    expect(state.history).toHaveLength(0);

    state = practiceReducer(state, { type: "COMMIT_ROUND_DISPLAY" });
    expect(state.history).toHaveLength(1);
    expect(state.playerScore).toBe(1);
    expect(state.pendingRound).toBeNull();
  });

  it("auto-commits pending round when advancing from reveal", () => {
    let state = createInitialMatchState();
    state = {
      ...state,
      phase: "reveal",
      playerMove: "rock",
      cpuMove: "scissors",
      roundOutcome: "player",
      pendingRound: {
        round: 1,
        playerMove: "rock",
        cpuMove: "scissors",
        outcome: "player",
        playerTimedOut: false,
        cpuTimedOut: false,
      },
      pendingPlayerScore: 1,
      pendingCpuScore: 0,
    };

    state = practiceReducer(state, { type: "ADVANCE_FROM_REVEAL" });
    expect(state.history).toHaveLength(1);
    expect(state.playerScore).toBe(1);
    expect(state.phase).toBe("round_result");
  });
});

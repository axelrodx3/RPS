import { describe, expect, it } from "vitest";
import {
  MOVES,
  PRACTICE_WIN_TARGET,
  createInitialMatchState,
  pickRandomMove,
  practiceReducer,
  randomCpuRevealDelayMs,
  resolveRound,
} from "@/features/practice/engine/practice-engine";

describe("resolveRound", () => {
  it.each([
    ["rock", "scissors", "player"],
    ["scissors", "paper", "player"],
    ["paper", "rock", "player"],
    ["scissors", "rock", "cpu"],
    ["paper", "scissors", "cpu"],
    ["rock", "paper", "cpu"],
    ["rock", "rock", "tie"],
    ["paper", "paper", "tie"],
    ["scissors", "scissors", "tie"],
  ] as const)("resolves %s vs %s as %s", (player, cpu, expected) => {
    expect(resolveRound(player, cpu)).toBe(expected);
  });
});

describe("pickRandomMove", () => {
  it("returns only valid moves", () => {
    for (let i = 0; i < 50; i += 1) {
      expect(MOVES).toContain(pickRandomMove(() => i / 50));
    }
  });
});

describe("randomCpuRevealDelayMs", () => {
  it("stays within the natural delay window", () => {
    for (let i = 0; i < 20; i += 1) {
      const delay = randomCpuRevealDelayMs(() => i / 20);
      expect(delay).toBeGreaterThanOrEqual(500);
      expect(delay).toBeLessThanOrEqual(1200);
    }
  });
});

describe("practiceReducer", () => {
  it("starts in idle and moves into countdown", () => {
    const next = practiceReducer(createInitialMatchState(), {
      type: "START_MATCH",
    });
    expect(next.phase).toBe("countdown");
  });

  it("awards no score on ties and replays the same round number", () => {
    let state = practiceReducer(createInitialMatchState(), {
      type: "START_MATCH",
    });
    state = { ...state, phase: "waiting_reveal", playerMove: "rock" };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "rock" });
    expect(state.roundOutcome).toBe("tie");
    expect(state.playerScore).toBe(0);
    expect(state.cpuScore).toBe(0);
    state = practiceReducer(state, { type: "ADVANCE_FROM_REVEAL" });
    state = practiceReducer(state, { type: "ADVANCE_FROM_ROUND_RESULT" });
    expect(state.round).toBe(1);
  });

  it("declares a player match win at the target score", () => {
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

  it("uses a random move when the player times out", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "commit", timerSeconds: 0 };
    state = practiceReducer(state, { type: "TIMEOUT_PLAYER" });
    expect(state.playerMove).not.toBeNull();
    expect(state.playerTimedOut).toBe(true);
    expect(state.phase).toBe("waiting_reveal");
  });

  it("rematch resets the match state", () => {
    const rematched = practiceReducer(
      {
        ...createInitialMatchState(),
        phase: "match_complete",
        playerScore: 2,
        matchWinner: "player",
      },
      { type: "REMATCH" },
    );
    expect(rematched.phase).toBe("countdown");
    expect(rematched.playerScore).toBe(0);
    expect(rematched.matchWinner).toBeNull();
  });

  it("uses first-to-two target", () => {
    expect(PRACTICE_WIN_TARGET).toBe(2);
  });
});

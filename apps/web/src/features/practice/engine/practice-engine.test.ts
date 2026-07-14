import { describe, expect, it } from "vitest";
import {
  MOVES,
  MOVE_EMOJI,
  MOVE_LOCKED_MS,
  PRACTICE_POST_LOCK_PHASES,
  PRACTICE_WIN_TARGET,
  REVEAL_PAUSE_MS,
  RESULT_VISIBLE_TOTAL_MS,
  WAITING_CPU_MS,
  createInitialMatchState,
  formatRoundHistoryAccessibleLabel,
  getTransitionMessage,
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
  it("matches the configured waiting CPU duration", () => {
    expect(randomCpuRevealDelayMs()).toBe(WAITING_CPU_MS);
  });
});

describe("round history helpers", () => {
  it("formats accessible labels with move names and outcomes", () => {
    expect(
      formatRoundHistoryAccessibleLabel({
        round: 1,
        playerMove: "paper",
        cpuMove: "rock",
        outcome: "player",
        playerTimedOut: false,
        cpuTimedOut: false,
      }),
    ).toBe("Player chose Paper. CPU chose Rock. Player won the round.");
  });

  it("exposes emoji mapping for history display", () => {
    expect(MOVE_EMOJI.paper).toBe("✋");
    expect(MOVE_EMOJI.rock).toBe("✊");
    expect(MOVE_EMOJI.scissors).toBe("✌️");
  });
});

describe("transition messages", () => {
  it("returns tie replay copy for tied rounds", () => {
    const state = {
      ...createInitialMatchState(),
      roundOutcome: "tie" as const,
      playerScore: 0,
      cpuScore: 0,
    };
    expect(getTransitionMessage(state)).toBe("Tie. Replay round.");
  });
});

describe("practice phase pacing", () => {
  it("uses the approved post lock phase order", () => {
    expect(PRACTICE_POST_LOCK_PHASES).toEqual([
      "move_locked",
      "waiting_cpu",
      "reveal_pause",
      "reveal",
      "round_result",
    ]);
  });

  it("keeps move locked, waiting CPU, and reveal pause within target ranges", () => {
    expect(MOVE_LOCKED_MS).toBeGreaterThanOrEqual(500);
    expect(MOVE_LOCKED_MS).toBeLessThanOrEqual(800);
    expect(WAITING_CPU_MS).toBeGreaterThanOrEqual(900);
    expect(WAITING_CPU_MS).toBeLessThanOrEqual(1300);
    expect(REVEAL_PAUSE_MS).toBeGreaterThanOrEqual(700);
    expect(REVEAL_PAUSE_MS).toBeLessThanOrEqual(1000);
  });

  it("keeps revealed result visible within the target total duration", () => {
    expect(RESULT_VISIBLE_TOTAL_MS).toBeGreaterThanOrEqual(2000);
    expect(RESULT_VISIBLE_TOTAL_MS).toBeLessThanOrEqual(2600);
  });
});

describe("practiceReducer", () => {
  it("starts in idle and moves into countdown", () => {
    const next = practiceReducer(createInitialMatchState(), {
      type: "START_MATCH",
    });
    expect(next.phase).toBe("countdown");
  });

  it("moves from commit into move locked before waiting on CPU", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "commit" };
    state = practiceReducer(state, { type: "SELECT_MOVE", move: "rock" });
    expect(state.phase).toBe("move_locked");
    state = practiceReducer(state, { type: "ADVANCE_FROM_MOVE_LOCKED" });
    expect(state.phase).toBe("waiting_cpu");
  });

  it("awards no score on ties and replays the same round number", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "waiting_cpu", playerMove: "rock" };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "rock" });
    expect(state.roundOutcome).toBe("tie");
    expect(state.phase).toBe("reveal_pause");
    state = practiceReducer(state, { type: "ADVANCE_FROM_REVEAL_PAUSE" });
    state = practiceReducer(state, { type: "ADVANCE_FROM_REVEAL" });
    expect(state.transitionMessage).toBe("Tie. Replay round.");
    state = practiceReducer(state, { type: "ADVANCE_FROM_ROUND_RESULT" });
    expect(state.phase).toBe("commit");
    expect(state.round).toBe(1);
  });

  it("opens the next commit phase directly after round result", () => {
    let state = createInitialMatchState();
    state = {
      ...state,
      phase: "round_result",
      roundOutcome: "player",
      round: 1,
      playerScore: 1,
      cpuScore: 0,
    };
    state = practiceReducer(state, { type: "ADVANCE_FROM_ROUND_RESULT" });
    expect(state.phase).toBe("commit");
    expect(state.round).toBe(2);
    expect(state.countdown).toBe(0);
  });

  it("declares a player match win at the target score", () => {
    let state = createInitialMatchState();
    state = {
      ...state,
      phase: "waiting_cpu",
      playerMove: "rock",
      playerScore: 1,
      round: 2,
    };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "scissors" });
    expect(state.playerScore).toBe(2);
    expect(state.matchWinner).toBe("player");
  });

  it("uses a provided move when the player times out", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "commit", timerSeconds: 0 };
    state = practiceReducer(state, { type: "TIMEOUT_PLAYER", move: "paper" });
    expect(state.playerMove).toBe("paper");
    expect(state.playerTimedOut).toBe(true);
    expect(state.phase).toBe("move_locked");
  });

  it("enters reveal pause before showing moves", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "waiting_cpu", playerMove: "rock" };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "scissors" });
    expect(state.phase).toBe("reveal_pause");
    state = practiceReducer(state, { type: "ADVANCE_FROM_REVEAL_PAUSE" });
    expect(state.phase).toBe("reveal");
  });

  it("uses first-to-two target", () => {
    expect(PRACTICE_WIN_TARGET).toBe(2);
  });
});

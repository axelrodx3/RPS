import { describe, expect, it } from "vitest";
import {
  MOVES,
  MOVE_EMOJI,
  PRACTICE_POST_LOCK_PHASES,
  PRACTICE_WIN_TARGET,
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
    expect(state.phase).toBe("round_intro");
    expect(state.round).toBe(1);
    state = practiceReducer(state, { type: "ADVANCE_FROM_ROUND_INTRO" });
    expect(state.phase).toBe("commit");
  });

  it("opens round intro after round result before the next commit phase", () => {
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
    expect(state.phase).toBe("round_intro");
    expect(state.round).toBe(2);
    expect(state.countdown).toBe(0);
    state = practiceReducer(state, { type: "ADVANCE_FROM_ROUND_INTRO" });
    expect(state.phase).toBe("commit");
    expect(state.commitStartedAt).toBeTruthy();
  });

  it("enters round intro after opening countdown", () => {
    let state = createInitialMatchState();
    state = practiceReducer(state, { type: "START_MATCH" });
    while (state.phase === "countdown" && state.countdown > 1) {
      state = practiceReducer(state, { type: "TICK_COUNTDOWN" });
    }
    state = practiceReducer(state, { type: "TICK_COUNTDOWN" });
    expect(state.phase).toBe("round_intro");
    state = practiceReducer(state, { type: "ADVANCE_FROM_ROUND_INTRO" });
    expect(state.phase).toBe("commit");
    expect(state.timerSeconds).toBe(20);
  });

  it("declares a player match win at the target score after display commit", () => {
    let state = createInitialMatchState();
    state = {
      ...state,
      phase: "waiting_cpu",
      playerMove: "rock",
      playerScore: 1,
      round: 2,
    };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "scissors" });
    expect(state.pendingPlayerScore).toBe(2);
    expect(state.matchWinner).toBe("player");
    expect(state.playerScore).toBe(1);
    state = practiceReducer(state, { type: "COMMIT_ROUND_DISPLAY" });
    expect(state.playerScore).toBe(2);
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

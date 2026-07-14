import { describe, expect, it } from "vitest";
import {
  MOVES,
  MOVE_EMOJI,
  PRACTICE_WIN_TARGET,
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
  it("stays within the natural delay window", () => {
    for (let i = 0; i < 20; i += 1) {
      const delay = randomCpuRevealDelayMs(() => i / 20);
      expect(delay).toBeGreaterThanOrEqual(500);
      expect(delay).toBeLessThanOrEqual(1200);
    }
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

    expect(
      formatRoundHistoryAccessibleLabel({
        round: 2,
        playerMove: "rock",
        cpuMove: "rock",
        outcome: "tie",
        playerTimedOut: true,
        cpuTimedOut: false,
      }),
    ).toBe(
      "Player chose Rock. CPU chose Rock. Round tied. Player move was automatic.",
    );
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

  it("returns match point when either side has one win", () => {
    const state = {
      ...createInitialMatchState(),
      roundOutcome: "player" as const,
      playerScore: 1,
      cpuScore: 0,
    };
    expect(getTransitionMessage(state)).toBe("Match point");
  });

  it("returns next round for ordinary progress", () => {
    const state = {
      ...createInitialMatchState(),
      roundOutcome: "player" as const,
      playerScore: 0,
      cpuScore: 0,
    };
    expect(getTransitionMessage(state)).toBe("Next round");
  });
});

describe("practiceReducer", () => {
  it("starts in idle and moves into countdown", () => {
    const next = practiceReducer(createInitialMatchState(), {
      type: "START_MATCH",
    });
    expect(next.phase).toBe("countdown");
  });

  it("ignores duplicate move selection", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "commit", playerMove: "rock" };
    state = practiceReducer(state, { type: "SELECT_MOVE", move: "paper" });
    expect(state.playerMove).toBe("rock");
  });

  it("awards no score on ties and replays the same round number", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "waiting_reveal", playerMove: "rock" };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "rock" });
    expect(state.roundOutcome).toBe("tie");
    expect(state.playerScore).toBe(0);
    expect(state.cpuScore).toBe(0);
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
      phase: "waiting_reveal",
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

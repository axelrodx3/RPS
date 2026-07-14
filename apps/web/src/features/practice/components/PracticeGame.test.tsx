/** @vitest-environment happy-dom */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { PracticeGame } from "@/features/practice/components/PracticeGame";
import {
  MOVES,
  practiceReducer,
  createInitialMatchState,
} from "@/features/practice/engine/practice-engine";
import { renderWithProviders } from "@/test/render";

async function startCommitPhase(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole("button", { name: "Start Practice Match" }),
  );
  await vi.advanceTimersByTimeAsync(3000);
}

describe("PracticeGame", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts a playable match from the intro card", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<PracticeGame />);

    await user.click(
      screen.getByRole("button", { name: "Start Practice Match" }),
    );

    expect(screen.getByText("Get ready")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("CPU")).toBeInTheDocument();
  });

  it.each(["Rock", "Paper", "Scissors"] as const)(
    "selects %s during commit phase",
    async (label) => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<PracticeGame />);
      await startCommitPhase(user);

      await user.click(screen.getByRole("button", { name: `Choose ${label}` }));
      expect(screen.getAllByText("CPU preparing move…").length).toBeGreaterThan(
        0,
      );
    },
  );

  it("locks move controls after selection", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<PracticeGame />);
    await startCommitPhase(user);

    const rock = screen.getByRole("button", { name: "Choose Rock" });
    await user.click(rock);
    expect(
      screen.queryByRole("button", { name: "Choose Rock" }),
    ).not.toBeInTheDocument();
  });

  it("updates the score after a resolved round", () => {
    let state = createInitialMatchState();
    state = practiceReducer(state, { type: "START_MATCH" });
    state = { ...state, phase: "reveal_countdown", playerMove: "rock" };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "scissors" });
    expect(state.playerScore).toBe(1);
    expect(state.cpuScore).toBe(0);
  });

  it("does not change the score on a tie", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "reveal_countdown", playerMove: "paper" };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "paper" });
    expect(state.playerScore).toBe(0);
    expect(state.cpuScore).toBe(0);
    expect(state.roundOutcome).toBe("tie");
  });

  it("ends the match when either side reaches two wins", () => {
    let state = createInitialMatchState();
    state = {
      ...state,
      phase: "reveal_countdown",
      playerMove: "scissors",
      playerScore: 1,
    };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "paper" });
    expect(state.playerScore).toBe(2);
    expect(state.matchWinner).toBe("player");
  });

  it("shows move buttons during commit phase", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<PracticeGame />);

    await user.click(
      screen.getByRole("button", { name: "Start Practice Match" }),
    );
    await vi.advanceTimersByTimeAsync(3000);

    expect(screen.getByRole("button", { name: "Choose Rock" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Choose Paper" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Choose Scissors" }),
    ).toBeEnabled();
  });

  it("uses a valid automatic move when the timer expires", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "commit", timerSeconds: 0 };
    state = practiceReducer(state, { type: "TIMEOUT_PLAYER", move: "rock" });
    expect(MOVES).toContain(state.playerMove!);
    expect(state.playerTimedOut).toBe(true);
  });

  it("never calls wallet or real SOL code paths", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}"));
    renderWithProviders(<PracticeGame />);

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

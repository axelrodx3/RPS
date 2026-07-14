/** @vitest-environment happy-dom */

import { readFileSync } from "node:fs";
import path from "node:path";
import { act, cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { PracticeGame } from "@/features/practice/components/PracticeGame";
import {
  MOVES,
  practiceReducer,
  createInitialMatchState,
} from "@/features/practice/engine/practice-engine";
import * as usePracticeGameModule from "@/features/practice/hooks/usePracticeGame";
import { renderWithProviders } from "@/test/render";
import styles from "@/features/practice/components/practice-game.module.css";

async function startCommitPhase(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole("button", { name: "Start Practice Match" }),
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(3000);
  });
}

describe("PracticeGame", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("starts a playable match from the intro card", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<PracticeGame />);

    await user.click(
      screen.getByRole("button", { name: "Start Practice Match" }),
    );

    expect(screen.getByText("Opening round")).toBeInTheDocument();
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

  it("does not show Get ready between ordinary rounds", () => {
    let state = createInitialMatchState();
    state = {
      ...state,
      phase: "round_result",
      roundOutcome: "player",
      playerScore: 1,
      transitionMessage: "Next round",
    };
    state = practiceReducer(state, { type: "ADVANCE_FROM_ROUND_RESULT" });
    expect(state.phase).toBe("commit");
    expect(state.countdown).toBe(0);
  });

  it("updates the score after a resolved round", () => {
    let state = createInitialMatchState();
    state = practiceReducer(state, { type: "START_MATCH" });
    state = { ...state, phase: "waiting_reveal", playerMove: "rock" };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "scissors" });
    expect(state.playerScore).toBe(1);
    expect(state.cpuScore).toBe(0);
  });

  it("does not change the score on a tie", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "waiting_reveal", playerMove: "paper" };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "paper" });
    expect(state.playerScore).toBe(0);
    expect(state.cpuScore).toBe(0);
    expect(state.roundOutcome).toBe("tie");
  });

  it("ends the match when either side reaches two wins", () => {
    let state = createInitialMatchState();
    state = {
      ...state,
      phase: "waiting_reveal",
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
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

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

describe("round history presentation", () => {
  it("renders emoji move pairs with accessible round labels", () => {
    const state = {
      ...createInitialMatchState(),
      phase: "round_result" as const,
      history: [
        {
          round: 1,
          playerMove: "paper" as const,
          cpuMove: "rock" as const,
          outcome: "player" as const,
          playerTimedOut: false,
          cpuTimedOut: false as const,
        },
      ],
    };

    const hook = vi
      .spyOn(usePracticeGameModule, "usePracticeGame")
      .mockReturnValue({
        state,
        startMatch: vi.fn(),
        selectMove: vi.fn(),
        rematch: vi.fn(),
        winTarget: 2,
        timerTotal: 20,
      });

    renderWithProviders(<PracticeGame />);

    const historyItem = screen.getByRole("listitem");
    expect(historyItem).toHaveAttribute("aria-label");
    expect(historyItem.getAttribute("aria-label")).toContain(
      "Player chose Paper",
    );
    expect(screen.getByText(/✋ vs ✊/)).toBeInTheDocument();
    hook.mockRestore();
  });
});

describe("reveal outcome styles", () => {
  it("defines win, loss, and tie outline classes", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/features/practice/components/practice-game.module.css",
    );
    const css = readFileSync(cssPath, "utf8");
    expect(css).toContain("revealOutcomeWin");
    expect(css).toContain("revealOutcomeLoss");
    expect(css).toContain("revealOutcomeTie");
    expect(css).toContain("matchVictory");
    expect(css).toContain("color-outcome-win");
    expect(css).toContain("color-outcome-loss");
    expect(styles.revealOutcomeWin).toBeTruthy();
    expect(styles.revealOutcomeLoss).toBeTruthy();
    expect(styles.revealOutcomeTie).toBeTruthy();
    expect(styles.matchVictory).toBeTruthy();
    expect(styles.matchDefeat).toBeTruthy();
  });
});

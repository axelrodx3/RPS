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
import * as settingsModule from "@/providers/SettingsProvider";
import {
  DEFAULT_PRACTICE_STATS,
  DEFAULT_SETTINGS,
} from "@/lib/storage/local-storage";
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

function mockActiveMatch(
  state: ReturnType<typeof createInitialMatchState>,
  overrides: Partial<ReturnType<typeof createInitialMatchState>> = {},
) {
  return vi.spyOn(usePracticeGameModule, "usePracticeGame").mockReturnValue({
    state: { ...state, ...overrides },
    startMatch: vi.fn(),
    selectMove: vi.fn(),
    rematch: vi.fn(),
    winTarget: 2,
    timerTotal: 20,
  });
}

describe("PracticeGame", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts a playable match from the intro card", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<PracticeGame />);

    await user.click(
      screen.getByRole("button", { name: "Start Practice Match" }),
    );

    expect(screen.getByText("Opening round")).toBeInTheDocument();
    expect(screen.getByLabelText("Match scoreboard")).toBeInTheDocument();
    expect(screen.getAllByText("YOU").length).toBeGreaterThan(0);
    expect(screen.getAllByText("CPU").length).toBeGreaterThan(0);
  });

  it.each(["Rock", "Paper", "Scissors"] as const)(
    "selects %s during commit phase",
    async (label) => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<PracticeGame />);
      await startCommitPhase(user);

      await user.click(
        screen.getByRole("button", {
          name: new RegExp(`Choose ${label}`, "i"),
        }),
      );
      expect(screen.getAllByText("Move locked").length).toBeGreaterThan(0);
    },
  );

  it("locks move controls after selection", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<PracticeGame />);
    await startCommitPhase(user);

    const rock = screen.getByRole("button", { name: /Choose Rock/i });
    await user.click(rock);
    expect(screen.queryByRole("button", { name: /Choose Rock/i })).toBeNull();
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
    state = { ...state, phase: "waiting_cpu", playerMove: "rock" };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "scissors" });
    expect(state.playerScore).toBe(1);
    expect(state.cpuScore).toBe(0);
  });

  it("does not change the score on a tie", () => {
    let state = createInitialMatchState();
    state = { ...state, phase: "waiting_cpu", playerMove: "paper" };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "paper" });
    expect(state.playerScore).toBe(0);
    expect(state.cpuScore).toBe(0);
    expect(state.roundOutcome).toBe("tie");
  });

  it("ends the match when either side reaches two wins", () => {
    let state = createInitialMatchState();
    state = {
      ...state,
      phase: "waiting_cpu",
      playerMove: "scissors",
      playerScore: 1,
    };
    state = practiceReducer(state, { type: "CPU_REVEAL", move: "paper" });
    expect(state.playerScore).toBe(2);
    expect(state.matchWinner).toBe("player");
  });

  it("shows move dock controls during commit phase", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<PracticeGame />);

    await user.click(
      screen.getByRole("button", { name: "Start Practice Match" }),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(screen.getByRole("group", { name: "Choose move" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Choose Rock/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Choose Paper/i })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: /Choose Scissors/i }),
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

describe("battle arena presentation", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders the battle stage, player strip, and move dock during commit", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "commit",
      round: 1,
      timerSeconds: 18,
      commitStartedAt: Date.now(),
    });

    const { container } = renderWithProviders(<PracticeGame />);
    expect(container.querySelector(`.${styles.battleStage}`)).toBeTruthy();
    expect(container.querySelector(`.${styles.playerStrip}`)).toBeTruthy();
    expect(container.querySelector(`.${styles.moveDock}`)).toBeTruthy();
    hook.mockRestore();
  });

  it("updates round win markers when the player leads", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "commit",
      playerScore: 1,
      cpuScore: 0,
      round: 2,
      timerSeconds: 15,
      commitStartedAt: Date.now(),
    });

    const { container } = renderWithProviders(<PracticeGame />);
    const filled = container.querySelectorAll(`.${styles.winMarkerFilled}`);
    expect(filled.length).toBe(1);
    hook.mockRestore();
  });

  it("renders reveal stage with both moves and outcome styling", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "reveal",
      playerMove: "rock",
      cpuMove: "scissors",
      roundOutcome: "player",
    });

    const { container } = renderWithProviders(<PracticeGame />);
    expect(container.querySelector(`.${styles.battlePodWin}`)).toBeTruthy();
    expect(container.querySelector(`.${styles.battlePodLoss}`)).toBeTruthy();
    expect(container.querySelector(`.${styles.vsImpact}`)).toBeTruthy();
    hook.mockRestore();
  });

  it("renders compact timeline entries with outcome badges", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "round_result",
      history: [
        {
          round: 1,
          playerMove: "paper",
          cpuMove: "rock",
          outcome: "player",
          playerTimedOut: false,
          cpuTimedOut: false,
        },
      ],
    });

    renderWithProviders(<PracticeGame />);
    const historyItem = screen.getByRole("listitem");
    expect(historyItem).toHaveAttribute("aria-label");
    expect(historyItem.getAttribute("aria-label")).toContain(
      "Player chose Paper",
    );
    expect(screen.getByText(/✋ VS ✊/)).toBeInTheDocument();
    expect(screen.getByText("WIN")).toBeInTheDocument();
    hook.mockRestore();
  });

  it("keeps move dock available on mobile widths", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "commit",
      timerSeconds: 12,
      commitStartedAt: Date.now(),
    });

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { container } = renderWithProviders(<PracticeGame />);
    expect(container.querySelector(`.${styles.moveDock}`)).toBeTruthy();
    hook.mockRestore();
  });
});

describe("reveal outcome styles", () => {
  it("defines battle arena and outcome classes", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/features/practice/components/practice-game.module.css",
    );
    const css = readFileSync(cssPath, "utf8");
    expect(css).toContain("battleStage");
    expect(css).toContain("playerStrip");
    expect(css).toContain("moveDock");
    expect(css).toContain("revealOutcomeWin");
    expect(css).toContain("color-outcome-win");
    expect(styles.battleStage).toBeTruthy();
    expect(styles.playerStrip).toBeTruthy();
    expect(styles.moveDock).toBeTruthy();
    expect(styles.matchVictory).toBeTruthy();
    expect(styles.matchDefeat).toBeTruthy();
  });
});

describe("victory confetti", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows confetti only on player match victory", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "match_complete",
      matchWinner: "player",
      playerScore: 2,
      cpuScore: 0,
    });

    const { container } = renderWithProviders(<PracticeGame />);
    expect(
      container.querySelector(
        `object[data="/assets/animations/confetti-victory.svg"]`,
      ),
    ).toBeTruthy();
    hook.mockRestore();
  });

  it("does not show confetti on CPU match victory", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "match_complete",
      matchWinner: "cpu",
      playerScore: 0,
      cpuScore: 2,
    });

    const { container } = renderWithProviders(<PracticeGame />);
    expect(
      container.querySelector(
        `object[data="/assets/animations/confetti-victory.svg"]`,
      ),
    ).toBeNull();
    hook.mockRestore();
  });

  it("disables confetti when reduced motion is enabled", () => {
    vi.spyOn(settingsModule, "useSettings").mockReturnValue({
      ready: true,
      settings: { ...DEFAULT_SETTINGS, reducedMotion: true },
      stats: { ...DEFAULT_PRACTICE_STATS },
      updateSettings: vi.fn(),
      completeTutorial: vi.fn(),
      recordMatch: vi.fn(),
      resetStats: vi.fn(),
    });

    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "match_complete",
      matchWinner: "player",
      playerScore: 2,
      cpuScore: 0,
    });

    const { container } = renderWithProviders(<PracticeGame />);
    expect(
      container.querySelector(
        `object[data="/assets/animations/confetti-victory.svg"]`,
      ),
    ).toBeNull();
    hook.mockRestore();
  });
});

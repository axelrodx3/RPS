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
  await act(async () => {
    await vi.advanceTimersByTimeAsync(700);
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

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Best of 3",
    );

    await user.click(
      screen.getByRole("button", { name: "Start Practice Match" }),
    );

    expect(screen.getByText("Round starting")).toBeInTheDocument();
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
    expect(rock).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Choose Paper/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Choose Scissors/i }),
    ).toBeDisabled();
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
    expect(state.phase).toBe("round_intro");
    expect(state.countdown).toBe(0);
    state = practiceReducer(state, { type: "ADVANCE_FROM_ROUND_INTRO" });
    expect(state.phase).toBe("commit");
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

  it("renders PNG artwork in move dock controls during commit phase", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<PracticeGame />);

    await user.click(
      screen.getByRole("button", { name: "Start Practice Match" }),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(700);
    });

    const rockImage = screen
      .getByRole("button", { name: /Choose Rock/i })
      .querySelector('img[src="/assets/moves/skins/rock/tier-1.png"]');
    expect(rockImage).toBeTruthy();
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
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
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

  it("renders reveal stage with both moves and outcome styling", async () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "reveal",
      playerMove: "rock",
      cpuMove: "scissors",
      roundOutcome: "player",
    });

    const { container } = renderWithProviders(<PracticeGame />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(container.querySelector(`.${styles.battlePodWin}`)).toBeTruthy();
    expect(container.querySelector(`.${styles.battlePodLoss}`)).toBeTruthy();
    expect(container.querySelector(`.${styles.arenaCoreVs}`)).toBeTruthy();
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

    const { container } = renderWithProviders(<PracticeGame />);
    const historyItem = screen.getByRole("listitem");
    expect(historyItem).toHaveAttribute("aria-label");
    expect(historyItem.getAttribute("aria-label")).toContain(
      "Player chose Paper",
    );
    expect(
      container.querySelector(
        'img[src="/assets/moves/skins/paper/tier-1.png"]',
      ),
    ).toBeTruthy();
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

  it.each([
    ["move_locked", "LOCKED IN"],
    ["waiting_cpu", "Your move is ready"],
    ["reveal_pause", "Your move is ready"],
  ] as const)(
    "shows the selected player move during %s",
    (phase, statusText) => {
      const hook = mockActiveMatch(createInitialMatchState(), {
        phase,
        playerMove: "rock",
      });

      renderWithProviders(<PracticeGame />);
      expect(screen.getAllByText(statusText).length).toBeGreaterThan(0);
      expect(screen.getByTestId(`move-art-rock-reveal`)).toBeInTheDocument();
      expect(
        screen.getByTestId(`move-art-rock-reveal`).querySelector("img"),
      ).toHaveAttribute("src", "/assets/moves/skins/rock/tier-1.png");
      hook.mockRestore();
    },
  );

  it.each(["move_locked", "waiting_cpu", "reveal_pause"] as const)(
    "keeps the CPU move concealed during %s",
    (phase) => {
      const hook = mockActiveMatch(createInitialMatchState(), {
        phase,
        playerMove: "paper",
      });

      const { container } = renderWithProviders(<PracticeGame />);
      const cpuPod = container.querySelector(`.${styles.battlePodCpu}`);
      expect(cpuPod?.querySelector(`.${styles.concealedMark}`)).toBeTruthy();
      expect(screen.getByTestId("move-art-paper-reveal")).toBeInTheDocument();
      hook.mockRestore();
    },
  );

  it("clears the player move at the start of the next commit round", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "commit",
      round: 2,
      timerSeconds: 18,
      commitStartedAt: Date.now(),
      playerMove: null,
      cpuMove: null,
    });

    const { container } = renderWithProviders(<PracticeGame />);
    expect(screen.queryByLabelText("Rock")).toBeNull();
    expect(container.querySelectorAll(`.${styles.concealedMark}`).length).toBe(
      2,
    );
    hook.mockRestore();
  });

  it("renders contextual round intro labels", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "round_intro",
      round: 1,
      playerScore: 0,
      cpuScore: 0,
    });

    renderWithProviders(<PracticeGame />);
    const overlay = screen.getByTestId("round-intro-overlay");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveTextContent("ROUND 1");
    hook.mockRestore();
  });

  it("begins move timer only after round intro completes", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<PracticeGame />);
    await user.click(
      screen.getByRole("button", { name: "Start Practice Match" }),
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(screen.getByTestId("round-intro-overlay")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Choose move" })).toBeNull();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(700);
    });
    expect(screen.getByRole("group", { name: "Choose move" })).toBeTruthy();
  });

  it("highlights the newest timeline entry once", async () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "round_result",
      history: [
        {
          round: 1,
          playerMove: "rock",
          cpuMove: "scissors",
          outcome: "player",
          playerTimedOut: false,
          cpuTimedOut: false,
        },
      ],
    });

    const { container } = renderWithProviders(<PracticeGame />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByTestId("timeline-entry-newest")).toBeInTheDocument();
    expect(container.querySelector(`.${styles.timelineEntryNew}`)).toBeTruthy();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });
    expect(container.querySelector(`.${styles.timelineEntryNew}`)).toBeNull();
    hook.mockRestore();
  });

  it("renders contextual match point labels", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "commit",
      playerScore: 1,
      cpuScore: 0,
      timerSeconds: 12,
      commitStartedAt: Date.now(),
    });

    renderWithProviders(<PracticeGame />);
    expect(screen.getByText("YOUR MATCH POINT")).toBeInTheDocument();
    hook.mockRestore();
  });

  it("increments timeline round numbers chronologically through ties", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "round_result",
      history: [
        {
          round: 1,
          playerMove: "rock",
          cpuMove: "rock",
          outcome: "tie",
          playerTimedOut: false,
          cpuTimedOut: false,
        },
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
    expect(screen.getByText("R1")).toBeInTheDocument();
    expect(screen.getByText("R2")).toBeInTheDocument();
    hook.mockRestore();
  });

  it("renders player robot and CPU R icon avatars", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "commit",
      timerSeconds: 10,
      commitStartedAt: Date.now(),
    });

    renderWithProviders(<PracticeGame />);
    expect(screen.getByAltText("Robot avatar")).toBeInTheDocument();
    expect(screen.getByAltText("CPU opponent")).toBeInTheDocument();
    hook.mockRestore();
  });

  it("renders match complete actions in a shared container", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "match_complete",
      matchWinner: "player",
      playerScore: 2,
      cpuScore: 1,
    });

    const { container } = renderWithProviders(<PracticeGame />);
    expect(
      container.querySelector(`.${styles.matchCompleteActions}`),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Rematch" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Return Home" }),
    ).toBeInTheDocument();
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
    expect(css).toContain("matchVictoryImpact");
    expect(css).toContain("cinematicResult");
    expect(css).toContain("cinematicResultBackdrop");
    expect(css).toContain("aspect-ratio: 16 / 10");
    expect(css).toContain("battleArenaResult");
    expect(css).toContain("cinematicResultDetails");
    expect(css).toContain("cinematicResultActions");
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

describe("match result presentation", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("uses a wider main result column than the timeline on desktop layouts", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/features/practice/components/practice-game.module.css",
    );
    const css = readFileSync(cssPath, "utf8");
    expect(css).toContain(
      "grid-template-columns: minmax(0, 1fr) clamp(180px, 20%, 260px)",
    );
    expect(css).toContain(".battleArenaResult");
  });

  it("shows victory cinematic background only on full match victory", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "match_complete",
      matchWinner: "player",
      playerScore: 2,
      cpuScore: 0,
    });

    const { container } = renderWithProviders(<PracticeGame />);
    expect(
      container.querySelector(
        `source[srcset="/assets/result-backgrounds/victory-result-bg.webp"]`,
      ),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-result-variant="victory"]'),
    ).toBeTruthy();
    expect(
      container.querySelector(`.${styles.cinematicResultEnter}`),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-result-variant="defeat"]'),
    ).toBeNull();
    hook.mockRestore();
  });

  it("shows defeat cinematic background only on full match defeat", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "match_complete",
      matchWinner: "cpu",
      playerScore: 0,
      cpuScore: 2,
    });

    const { container } = renderWithProviders(<PracticeGame />);
    expect(
      container.querySelector(
        `source[srcset="/assets/result-backgrounds/defeat-result-bg.webp"]`,
      ),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-result-variant="defeat"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-result-variant="victory"]'),
    ).toBeNull();
    hook.mockRestore();
  });

  it("does not show cinematic backgrounds during round loss", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "round_result",
      roundOutcome: "cpu",
      playerScore: 0,
      cpuScore: 1,
      transitionMessage: "CPU wins the round",
    });

    const { container } = renderWithProviders(<PracticeGame />);
    expect(
      container.querySelector(
        `source[srcset="/assets/result-backgrounds/defeat-result-bg.webp"]`,
      ),
    ).toBeNull();
    expect(
      container.querySelector(
        `source[srcset="/assets/result-backgrounds/victory-result-bg.webp"]`,
      ),
    ).toBeNull();
    hook.mockRestore();
  });

  it("does not render legacy result SVG object placeholders", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "match_complete",
      matchWinner: "player",
      playerScore: 2,
      cpuScore: 0,
    });

    const { container } = renderWithProviders(<PracticeGame />);
    expect(
      container.querySelector(
        `object[data="/assets/animations/victory-money.svg"]`,
      ),
    ).toBeNull();
    expect(
      container.querySelector(
        `object[data="/assets/animations/defeat-fall.svg"]`,
      ),
    ).toBeNull();
    hook.mockRestore();
  });

  it("applies defeat impact styling when motion is allowed", () => {
    const hook = mockActiveMatch(createInitialMatchState(), {
      phase: "match_complete",
      matchWinner: "cpu",
      playerScore: 0,
      cpuScore: 2,
    });

    const { container } = renderWithProviders(<PracticeGame />);
    expect(
      container.querySelector(`.${styles.matchDefeatImpact}`),
    ).toBeTruthy();
    expect(
      container.querySelector(`.${styles.cinematicResultDetails}`),
    ).toBeTruthy();
    expect(
      container.querySelector(`.${styles.cinematicResultActions}`),
    ).toBeTruthy();
    hook.mockRestore();
  });

  it("omits defeat impact styling under reduced motion", () => {
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
      matchWinner: "cpu",
      playerScore: 0,
      cpuScore: 2,
    });

    const { container } = renderWithProviders(<PracticeGame />);
    expect(container.querySelector(`.${styles.matchDefeatImpact}`)).toBeNull();
    expect(
      screen.getByRole("heading", { level: 2, name: "DEFEAT" }),
    ).toBeInTheDocument();
    hook.mockRestore();
  });

  it("clears result screen when rematch starts", async () => {
    let state: ReturnType<typeof createInitialMatchState> = {
      ...createInitialMatchState(),
      phase: "match_complete",
      matchWinner: "player",
      playerScore: 2,
      cpuScore: 0,
    };

    const rematch = vi.fn(() => {
      state = {
        ...createInitialMatchState(),
        phase: "countdown",
        countdown: 3,
      };
    });

    const hook = vi
      .spyOn(usePracticeGameModule, "usePracticeGame")
      .mockImplementation(() => ({
        state,
        startMatch: vi.fn(),
        selectMove: vi.fn(),
        rematch,
        winTarget: 2,
        timerTotal: 20,
      }));

    const user = userEvent.setup();
    const view = renderWithProviders(<PracticeGame />);
    expect(
      view.container.querySelector('[data-result-variant="victory"]'),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Rematch" }));
    expect(rematch).toHaveBeenCalled();
    view.rerender(<PracticeGame />);
    expect(
      view.container.querySelector('[data-result-variant="victory"]'),
    ).toBeNull();
    hook.mockRestore();
  });
});

/** @vitest-environment happy-dom */

import { readFileSync } from "node:fs";
import path from "node:path";
import { cleanup, screen } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { RoundTimeline } from "@/features/practice/components/battle-arena/RoundTimeline";
import { renderWithProviders } from "@/test/render";
import styles from "@/features/practice/components/practice-game.module.css";

const sampleRound = {
  round: 1,
  playerMove: "rock" as const,
  cpuMove: "scissors" as const,
  outcome: "player" as const,
  playerTimedOut: false as const,
  cpuTimedOut: false as const,
};

function buildHistory(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    ...sampleRound,
    round: index + 1,
    outcome:
      index % 3 === 0
        ? ("player" as const)
        : index % 3 === 1
          ? ("cpu" as const)
          : ("tie" as const),
  }));
}

describe("RoundTimeline", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a compact centered empty timeline state", () => {
    const { container } = renderWithProviders(
      <RoundTimeline history={[]} reducedMotion />,
    );
    expect(screen.getByTestId("match-timeline")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("No rounds yet.");
    expect(
      container.querySelector(`.${styles.roundTimelineEmpty}`),
    ).toBeTruthy();
    expect(
      container.querySelector(`.${styles.timelineEmptyBody}`),
    ).toBeTruthy();
    expect(
      container.querySelector(`.${styles.timelineEmptyIcon}`),
    ).toBeTruthy();
    expect(
      container.querySelector(`.${styles.roundTimelineScrollable}`),
    ).toBeNull();
  });

  it("does not stretch the empty timeline to a scrollable filled panel", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/features/practice/components/practice-game.module.css",
    );
    const css = readFileSync(cssPath, "utf8");
    expect(css).toContain(".roundTimelineEmpty");
    expect(css).toContain(".timelineEmptyBody");
    expect(css).not.toMatch(
      /\.roundTimelineEmpty[\s\S]*max-height:\s*min\(56vh/,
    );
  });

  it("renders compact horizontal timeline entries with badges", () => {
    const { container } = renderWithProviders(
      <RoundTimeline history={[sampleRound]} reducedMotion />,
    );

    expect(
      container.querySelector(`.${styles.roundTimelineFilled}`),
    ).toBeTruthy();
    const entry = screen.getByRole("listitem");
    expect(entry).toHaveAttribute("aria-label");
    expect(screen.getByText("WIN")).toBeInTheDocument();
    expect(
      container.querySelector('img[src="/assets/moves/skins/rock/tier-1.png"]'),
    ).toBeTruthy();
    expect(screen.getByTestId("match-timeline")).toHaveAttribute(
      "data-timeline-scrollable",
      "false",
    );
  });

  it("uses a stable grid layout for timeline entries", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/features/practice/components/practice-game.module.css",
    );
    const css = readFileSync(cssPath, "utf8");
    expect(css).toContain(
      "grid-template-columns: 28px 32px 18px 32px minmax(44px, auto)",
    );
    expect(css).toContain(".timelineMoveSlot");
    expect(css).toContain(".timelineOutcome");
    expect(css).not.toContain(".timelineMoves");
  });

  it("uses compact row structure without horizontal scrolling styles", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/features/practice/components/practice-game.module.css",
    );
    const css = readFileSync(cssPath, "utf8");
    expect(css).toContain("min-height: 54px");
    expect(css).toContain("overflow-x: hidden");
    expect(css).not.toContain("overflow-x: auto");
    expect(css).not.toMatch(/\.timelineEntry[\s\S]*overflow:\s*hidden/);
  });

  it("renders scissors vs rock LOSS with both move thumbnails visible", () => {
    const { container } = renderWithProviders(
      <RoundTimeline
        history={[
          {
            round: 1,
            playerMove: "scissors",
            cpuMove: "rock",
            outcome: "cpu",
            playerTimedOut: false,
            cpuTimedOut: false,
          },
        ]}
        reducedMotion
      />,
    );

    const entry = screen.getByRole("listitem");
    expect(entry).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Player chose Scissors"),
    );
    expect(entry).toHaveAttribute(
      "aria-label",
      expect.stringContaining("CPU chose Rock"),
    );
    expect(screen.getByText("LOSS")).toBeInTheDocument();
    expect(
      container.querySelector(
        'img[src="/assets/moves/skins/scissors/tier-1.png"]',
      ),
    ).toBeTruthy();
    expect(
      container.querySelector('img[src="/assets/moves/skins/rock/tier-1.png"]'),
    ).toBeTruthy();
    expect(
      container.querySelectorAll(`.${styles.timelineMoveSlot}`),
    ).toHaveLength(2);
  });

  it.each([
    {
      label: "WIN",
      playerMove: "rock" as const,
      cpuMove: "scissors" as const,
      outcome: "player" as const,
    },
    {
      label: "LOSS",
      playerMove: "paper" as const,
      cpuMove: "scissors" as const,
      outcome: "cpu" as const,
    },
    {
      label: "TIE",
      playerMove: "scissors" as const,
      cpuMove: "scissors" as const,
      outcome: "tie" as const,
    },
  ])(
    "renders both move thumbnails for $label entries",
    ({ playerMove, cpuMove, outcome, label }) => {
      const { container } = renderWithProviders(
        <RoundTimeline
          history={[
            {
              round: 1,
              playerMove,
              cpuMove,
              outcome,
              playerTimedOut: false,
              cpuTimedOut: false,
            },
          ]}
          reducedMotion
        />,
      );

      expect(screen.getByText(label)).toBeInTheDocument();
      expect(container.querySelectorAll("img")).toHaveLength(2);
      expect(
        container.querySelectorAll(`.${styles.timelineMoveSlot}`),
      ).toHaveLength(2);
    },
  );

  it("uses consistent outcome badge sizing across WIN, LOSS, and TIE", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/features/practice/components/practice-game.module.css",
    );
    const css = readFileSync(cssPath, "utf8");
    expect(css).toMatch(/\.timelineBadge[\s\S]*min-width:\s*40px/);
    expect(css).toMatch(/\.timelineBadge[\s\S]*height:\s*16px/);
    expect(css).toMatch(/\.timelineBadge[\s\S]*white-space:\s*nowrap/);
  });

  it("keeps AUTO beneath the outcome badge without extra grid columns", () => {
    const { container } = renderWithProviders(
      <RoundTimeline
        history={[
          {
            round: 1,
            playerMove: "scissors",
            cpuMove: "rock",
            outcome: "cpu",
            playerTimedOut: true,
            cpuTimedOut: false,
          },
        ]}
        reducedMotion
      />,
    );

    expect(screen.getByText("AUTO")).toBeInTheDocument();
    expect(screen.getByText("LOSS")).toBeInTheDocument();
    expect(
      container.querySelectorAll(
        'img[src="/assets/moves/skins/scissors/tier-1.png"]',
      ),
    ).toHaveLength(1);
    expect(
      container.querySelectorAll(
        'img[src="/assets/moves/skins/rock/tier-1.png"]',
      ),
    ).toHaveLength(1);
    expect(container.querySelector(`.${styles.timelineOutcome}`)).toBeTruthy();
  });

  it("shows one to three entries without enabling timeline scrolling", () => {
    const { container } = renderWithProviders(
      <RoundTimeline history={buildHistory(3)} reducedMotion />,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(
      container.querySelector(`.${styles.roundTimelineScrollable}`),
    ).toBeNull();
    expect(screen.getByTestId("match-timeline")).toHaveAttribute(
      "data-timeline-scrollable",
      "false",
    );
  });

  it("enables vertical scrolling only when the timeline exceeds three entries", () => {
    const { container } = renderWithProviders(
      <RoundTimeline history={buildHistory(5)} reducedMotion />,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(
      container.querySelector(`.${styles.roundTimelineScrollable}`),
    ).toBeTruthy();
    expect(screen.getByTestId("match-timeline")).toHaveAttribute(
      "data-timeline-scrollable",
      "true",
    );
  });

  it("keeps outcome badge treatments for win, loss, and tie entries", () => {
    const { container } = renderWithProviders(
      <RoundTimeline
        history={[
          {
            round: 1,
            playerMove: "rock",
            cpuMove: "scissors",
            outcome: "player",
            playerTimedOut: false,
            cpuTimedOut: false,
          },
          {
            round: 2,
            playerMove: "paper",
            cpuMove: "rock",
            outcome: "cpu",
            playerTimedOut: false,
            cpuTimedOut: false,
          },
          {
            round: 3,
            playerMove: "scissors",
            cpuMove: "scissors",
            outcome: "tie",
            playerTimedOut: false,
            cpuTimedOut: false,
          },
        ]}
        reducedMotion
      />,
    );

    expect(container.querySelector(`.${styles.timelineWin}`)).toBeTruthy();
    expect(container.querySelector(`.${styles.timelineLoss}`)).toBeTruthy();
    expect(container.querySelector(`.${styles.timelineTie}`)).toBeTruthy();
  });

  it("stacks beneath the arena on mobile layouts", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/features/practice/components/practice-game.module.css",
    );
    const css = readFileSync(cssPath, "utf8");
    expect(css).toMatch(
      /@media \(max-width: 960px\)[\s\S]*\.timelineAside[\s\S]*order:\s*3/,
    );
  });
});

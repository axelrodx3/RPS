/** @vitest-environment happy-dom */

import { cleanup, screen } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { RoundTimeline } from "@/features/practice/components/battle-arena/RoundTimeline";
import { renderWithProviders } from "@/test/render";
import styles from "@/features/practice/components/practice-game.module.css";

describe("RoundTimeline", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a compact empty timeline state", () => {
    const { container } = renderWithProviders(
      <RoundTimeline history={[]} reducedMotion />,
    );
    expect(screen.getByTestId("match-timeline")).toBeInTheDocument();
    expect(screen.getByText("No rounds yet.")).toBeInTheDocument();
    expect(
      container.querySelector(`.${styles.roundTimelineEmpty}`),
    ).toBeTruthy();
  });

  it("renders compact horizontal timeline entries with badges", () => {
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
        ]}
        reducedMotion
      />,
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
  });

  it("shows AUTO badge for timed out player moves", () => {
    renderWithProviders(
      <RoundTimeline
        history={[
          {
            round: 1,
            playerMove: "paper",
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
  });
});

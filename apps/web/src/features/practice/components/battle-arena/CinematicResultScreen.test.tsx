/** @vitest-environment happy-dom */

import { readFileSync } from "node:fs";
import path from "node:path";
import { act, cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CinematicResultScreen } from "@/features/practice/components/battle-arena/CinematicResultScreen";
import {
  MATCH_RESULT_ASPECT_RATIO,
  MATCH_RESULT_BACKGROUNDS,
} from "@/features/practice/assets/match-result-backgrounds";
import styles from "@/features/practice/components/practice-game.module.css";
import { renderWithProviders } from "@/test/render";

describe("CinematicResultScreen", () => {
  afterEach(() => {
    cleanup();
  });

  const baseProps = {
    playerScore: 2,
    cpuScore: 1,
    tiedRounds: 0,
    automaticMoves: 0,
    matchKey: "test-match",
    onRematch: vi.fn(),
  };

  it("renders layered victory background assets for player victory", () => {
    const { container } = renderWithProviders(
      <CinematicResultScreen
        {...baseProps}
        variant="victory"
        reducedMotion={false}
      />,
    );

    expect(
      container.querySelector(
        `source[srcset="${MATCH_RESULT_BACKGROUNDS.victory.webp}"]`,
      ),
    ).toBeTruthy();
    expect(
      container.querySelectorAll(`.${styles.cinematicResultBleedImage}`).length,
    ).toBe(1);
    expect(
      container.querySelectorAll(`.${styles.cinematicResultSharpImage}`).length,
    ).toBe(1);
    expect(
      container.querySelector('[data-result-variant="victory"]'),
    ).toBeTruthy();
  });

  it("renders layered defeat background assets for player defeat", () => {
    const { container } = renderWithProviders(
      <CinematicResultScreen
        {...baseProps}
        variant="defeat"
        reducedMotion={false}
      />,
    );

    expect(
      container.querySelector(
        `source[srcset="${MATCH_RESULT_BACKGROUNDS.defeat.webp}"]`,
      ),
    ).toBeTruthy();
    expect(
      container.querySelectorAll(`.${styles.cinematicResultBleedImage}`).length,
    ).toBe(1);
    expect(
      container.querySelectorAll(`.${styles.cinematicResultSharpImage}`).length,
    ).toBe(1);
    expect(
      container.querySelector('[data-result-variant="defeat"]'),
    ).toBeTruthy();
  });

  it("uses wide cinematic layout and focal positioning configuration", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/features/practice/components/practice-game.module.css",
    );
    const css = readFileSync(cssPath, "utf8");

    expect(MATCH_RESULT_ASPECT_RATIO).toBe("16 / 10");
    expect(css).toContain("aspect-ratio: 16 / 10");
    expect(MATCH_RESULT_BACKGROUNDS.victory.bleedPosition).toBe("center 62%");
    expect(MATCH_RESULT_BACKGROUNDS.defeat.bleedPosition).toBe("center 60%");
    expect(css).toContain(".cinematicResultBleedImage");
    expect(css).toContain(".cinematicResultSharpImage");
    expect(css).toContain("object-fit: contain");
  });

  it("keeps victory and defeat headings as real HTML", () => {
    const victory = renderWithProviders(
      <CinematicResultScreen
        {...baseProps}
        variant="victory"
        reducedMotion={false}
      />,
    );
    expect(
      victory.getByRole("heading", { level: 2, name: "VICTORY" }),
    ).toBeInTheDocument();

    victory.unmount();

    renderWithProviders(
      <CinematicResultScreen
        {...baseProps}
        variant="defeat"
        reducedMotion={false}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "DEFEAT" }),
    ).toBeInTheDocument();
  });

  it("applies sequenced entrance classes when motion is allowed", () => {
    const { container } = renderWithProviders(
      <CinematicResultScreen
        {...baseProps}
        variant="victory"
        reducedMotion={false}
      />,
    );

    expect(
      container.querySelector(`.${styles.cinematicResultEnter}`),
    ).toBeTruthy();
    expect(
      container.querySelector(`.${styles.matchVictoryImpact}`),
    ).toBeTruthy();
    expect(
      container.querySelector(`.${styles.cinematicResultDetails}`),
    ).toBeTruthy();
    expect(
      container.querySelector(`.${styles.cinematicResultActions}`),
    ).toBeTruthy();
  });

  it("does not render broken object placeholders", () => {
    const { container } = renderWithProviders(
      <CinematicResultScreen
        {...baseProps}
        variant="victory"
        reducedMotion={false}
      />,
    );

    expect(container.querySelector("object")).toBeNull();
  });

  it("marks decorative layers as pointer-events none in CSS", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/features/practice/components/practice-game.module.css",
    );
    const css = readFileSync(cssPath, "utf8");
    expect(css).toContain(".cinematicResultBackdrop");
    expect(css).toContain("pointer-events: none");
  });

  it("shows accessible action controls", () => {
    renderWithProviders(
      <CinematicResultScreen
        {...baseProps}
        variant="victory"
        reducedMotion={false}
      />,
    );

    expect(screen.getByRole("button", { name: "Rematch" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Return Home" }),
    ).toBeInTheDocument();
  });

  it("uses static reduced motion presentation without impact classes", () => {
    const { container } = renderWithProviders(
      <CinematicResultScreen {...baseProps} variant="defeat" reducedMotion />,
    );

    expect(
      container.querySelector(`.${styles.cinematicResultReduced}`),
    ).toBeTruthy();
    expect(
      container.querySelector(`.${styles.cinematicResultBackdropStatic}`),
    ).toBeTruthy();
    expect(container.querySelector(`.${styles.matchDefeatImpact}`)).toBeNull();
    expect(
      screen.getByRole("heading", { level: 2, name: "DEFEAT" }),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-testid="victory-persistent-effects"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="defeat-persistent-effects"]'),
    ).toBeNull();
  });

  it("renders readable match summary pills", () => {
    renderWithProviders(
      <CinematicResultScreen
        {...baseProps}
        tiedRounds={1}
        automaticMoves={2}
        variant="victory"
        reducedMotion={false}
      />,
    );

    expect(screen.getByTestId("match-summary-row")).toBeInTheDocument();
    expect(screen.getByTestId("match-summary-tied-rounds")).toBeInTheDocument();
    expect(
      screen.getByTestId("match-summary-automatic-moves"),
    ).toBeInTheDocument();
    expect(screen.getByText("TIED ROUNDS")).toBeInTheDocument();
    expect(screen.getByText("AUTOMATIC MOVES")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders victory persistent effects after entrance when motion is allowed", () => {
    vi.useFakeTimers();
    const { container } = renderWithProviders(
      <CinematicResultScreen
        {...baseProps}
        variant="victory"
        reducedMotion={false}
      />,
    );

    expect(
      container.querySelector('[data-testid="victory-persistent-effects"]'),
    ).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(
      container.querySelector('[data-testid="victory-persistent-effects"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="defeat-persistent-effects"]'),
    ).toBeNull();
    vi.useRealTimers();
  });

  it("renders defeat persistent effects after entrance when motion is allowed", () => {
    vi.useFakeTimers();
    const { container } = renderWithProviders(
      <CinematicResultScreen
        {...baseProps}
        variant="defeat"
        reducedMotion={false}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(
      container.querySelector('[data-testid="defeat-persistent-effects"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="victory-persistent-effects"]'),
    ).toBeNull();
    vi.useRealTimers();
  });
});

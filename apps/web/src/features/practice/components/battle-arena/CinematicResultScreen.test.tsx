/** @vitest-environment happy-dom */

import { readFileSync } from "node:fs";
import path from "node:path";
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CinematicResultScreen } from "@/features/practice/components/battle-arena/CinematicResultScreen";
import { MATCH_RESULT_BACKGROUNDS } from "@/features/practice/assets/match-result-backgrounds";
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

  it("renders victory background asset for player victory", () => {
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
      container.querySelector(
        `img[src="${MATCH_RESULT_BACKGROUNDS.victory.png}"]`,
      ),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-result-variant="victory"]'),
    ).toBeTruthy();
  });

  it("renders defeat background asset for player defeat", () => {
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
      container.querySelector(
        `img[src="${MATCH_RESULT_BACKGROUNDS.defeat.png}"]`,
      ),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-result-variant="defeat"]'),
    ).toBeTruthy();
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

  it("centers the result composition", () => {
    const { container } = renderWithProviders(
      <CinematicResultScreen
        {...baseProps}
        variant="victory"
        reducedMotion={false}
      />,
    );

    expect(container.querySelector(`.${styles.cinematicResult}`)).toBeTruthy();
    expect(
      container.querySelector(`.${styles.cinematicResultContent}`),
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

  it("uses static backdrop styling under reduced motion", () => {
    const { container } = renderWithProviders(
      <CinematicResultScreen {...baseProps} variant="defeat" reducedMotion />,
    );

    expect(
      container.querySelector(`.${styles.cinematicResultBackdropStatic}`),
    ).toBeTruthy();
    expect(container.querySelector(`.${styles.matchDefeatImpact}`)).toBeNull();
    expect(
      screen.getByRole("heading", { level: 2, name: "DEFEAT" }),
    ).toBeInTheDocument();
  });
});

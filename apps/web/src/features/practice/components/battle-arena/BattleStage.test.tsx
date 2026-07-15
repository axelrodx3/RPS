/** @vitest-environment happy-dom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BattleStage } from "@/features/practice/components/battle-arena/BattleStage";
import styles from "@/features/practice/components/practice-game.module.css";

const baseProps = {
  phase: "reveal" as const,
  countdown: 0,
  timerSeconds: 20,
  timerTotal: 20,
  playerMove: "rock" as const,
  cpuMove: "scissors" as const,
  playerTimedOut: false,
  playerScore: 1,
  cpuScore: 0,
  phaseLabel: "Reveal",
  round: 2,
  reducedMotion: false,
};

describe("BattleStage round result feedback", () => {
  it("shows player round win check state without duplicate panel copy", () => {
    const { container } = render(
      <BattleStage {...baseProps} roundOutcome="player" phase="round_result" />,
    );

    expect(
      container.querySelector('[data-visual-state="player_round_win"]'),
    ).toBeTruthy();
    expect(screen.getByText("ROUND WON")).toBeInTheDocument();
    expect(screen.getByText("YOUR MATCH POINT")).toBeInTheDocument();
    expect(screen.queryByText("You win the round.")).not.toBeInTheDocument();
    expect(container.querySelector(`.${styles.roundResultPanel}`)).toBeNull();
    expect(container.querySelector(`.${styles.arenaCoreCheck}`)).toBeTruthy();
  });

  it("shows cpu round loss state", () => {
    const { container } = render(
      <BattleStage
        {...baseProps}
        roundOutcome="cpu"
        playerScore={0}
        cpuScore={1}
        phase="round_result"
      />,
    );

    expect(
      container.querySelector('[data-visual-state="cpu_round_win"]'),
    ).toBeTruthy();
    expect(screen.getByText("ROUND LOST")).toBeInTheDocument();
    expect(screen.getByText("CPU MATCH POINT")).toBeInTheDocument();
    expect(
      container.querySelector(`.${styles.arenaCoreLossMark}`),
    ).toBeTruthy();
    expect(container.querySelector(`.${styles.arenaCoreCheck}`)).toBeNull();
  });

  it("shows tie state without win or loss marks", () => {
    const { container } = render(
      <BattleStage
        {...baseProps}
        roundOutcome="tie"
        playerScore={0}
        cpuScore={0}
        phase="round_result"
      />,
    );

    expect(container.querySelector('[data-visual-state="tie"]')).toBeTruthy();
    expect(screen.getByText("TIE")).toBeInTheDocument();
    expect(screen.getByText("REPLAY ROUND")).toBeInTheDocument();
    expect(screen.queryByText("Tie. Replay round.")).not.toBeInTheDocument();
    expect(container.querySelector(`.${styles.arenaCoreCheck}`)).toBeNull();
    expect(container.querySelector(`.${styles.arenaCoreLossMark}`)).toBeNull();
    expect(container.querySelector(`.${styles.arenaCoreTieMark}`)).toBeTruthy();
  });

  it("uses static outcome styling when reduced motion is enabled", () => {
    const { container } = render(
      <BattleStage
        {...baseProps}
        roundOutcome="player"
        phase="round_result"
        reducedMotion
      />,
    );

    expect(
      container.querySelector(`.${styles.arenaCoreCheckStatic}`),
    ).toBeTruthy();
    expect(container.querySelector(`.${styles.arenaCoreCheckDraw}`)).toBeNull();
  });
});

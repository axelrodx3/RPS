/** @vitest-environment happy-dom */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MoveArt } from "@/features/practice/components/battle-arena/MoveArt";

describe("MoveArt", () => {
  it("renders PNG artwork for selection controls", () => {
    render(<MoveArt move="rock" variant="selection" />);

    const image = screen
      .getByTestId("move-art-rock-selection")
      .querySelector("img");
    expect(image).toBeTruthy();
    expect(image).toHaveAttribute("src", "/assets/moves/skins/rock/tier-1.png");
  });

  it("falls back to emoji when image loading fails", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<MoveArt move="paper" variant="reveal" />);
    const image = screen
      .getByTestId("move-art-paper-reveal")
      .querySelector("img");
    expect(image).toBeTruthy();

    fireEvent.error(image!);

    expect(screen.getByTestId("move-art-fallback-paper")).toBeInTheDocument();
    expect(screen.getByText("✋")).toBeInTheDocument();
    warnSpy.mockRestore();
  });
});

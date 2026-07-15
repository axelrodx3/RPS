/** @vitest-environment happy-dom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RoundIntroOverlay } from "@/features/practice/components/battle-arena/RoundIntroOverlay";

describe("RoundIntroOverlay", () => {
  it("uses a single enter animation lifecycle per round", () => {
    render(
      <RoundIntroOverlay
        label="CPU MATCH POINT"
        reducedMotion={false}
        round={2}
      />,
    );

    const overlay = screen.getByTestId("round-intro-overlay");
    expect(overlay).toHaveAttribute("data-round", "2");
    expect(overlay.className).toContain("roundIntroEnter");
  });
});

import { describe, expect, it } from "vitest";
import { getRoundIntroLabel } from "@/features/practice/utils/round-intro-label";

describe("getRoundIntroLabel", () => {
  it("returns ROUND 1 for the opening round", () => {
    expect(getRoundIntroLabel(1, 0, 0)).toBe("ROUND 1");
  });

  it("returns ROUND 2 when no side is on match point", () => {
    expect(getRoundIntroLabel(2, 0, 0)).toBe("ROUND 2");
  });

  it("prioritizes YOUR MATCH POINT when only the player is one away", () => {
    expect(getRoundIntroLabel(2, 1, 0, 2)).toBe("YOUR MATCH POINT");
  });

  it("prioritizes CPU MATCH POINT when only the CPU is one away", () => {
    expect(getRoundIntroLabel(2, 0, 1, 2)).toBe("CPU MATCH POINT");
  });

  it("prioritizes DOUBLE MATCH POINT when both are one away", () => {
    expect(getRoundIntroLabel(3, 1, 1, 2)).toBe("DOUBLE MATCH POINT");
  });

  it("returns FINAL ROUND only in the late tied-score context", () => {
    expect(getRoundIntroLabel(3, 1, 0, 2)).toBe("YOUR MATCH POINT");
    expect(getRoundIntroLabel(3, 0, 1, 2)).toBe("CPU MATCH POINT");
    expect(getRoundIntroLabel(3, 0, 0, 2)).toBe("FINAL ROUND");
  });
});

import { describe, expect, it } from "vitest";
import { getMatchPointLabel } from "@/features/practice/utils/match-point-label";

describe("getMatchPointLabel", () => {
  it.each([
    [0, 0, null],
    [1, 0, "YOUR MATCH POINT"],
    [0, 1, "CPU MATCH POINT"],
    [1, 1, "DOUBLE MATCH POINT"],
    [2, 0, null],
    [0, 2, null],
  ] as const)(
    "returns the correct label for player %i and cpu %i",
    (playerScore, cpuScore, expected) => {
      expect(getMatchPointLabel(playerScore, cpuScore, 2)).toBe(expected);
    },
  );
});

import { describe, expect, it } from "vitest";
import {
  formatRoundResultAnnouncement,
  getRoundResultPrimaryLabel,
  getRoundResultSecondaryLabel,
  resolveArenaCoreVisualState,
} from "@/features/practice/utils/arena-core-state";

describe("resolveArenaCoreVisualState", () => {
  it("maps gameplay phases to core visual states", () => {
    expect(resolveArenaCoreVisualState("countdown", null, false)).toBe(
      "countdown",
    );
    expect(resolveArenaCoreVisualState("commit", null, false)).toBe(
      "selecting",
    );
    expect(resolveArenaCoreVisualState("move_locked", null, false)).toBe(
      "phase",
    );
    expect(resolveArenaCoreVisualState("reveal", null, false)).toBe(
      "vs_reveal",
    );
  });

  it("shows outcome states once both moves are revealed", () => {
    expect(resolveArenaCoreVisualState("reveal", "player", true)).toBe(
      "player_round_win",
    );
    expect(resolveArenaCoreVisualState("round_result", "cpu", true)).toBe(
      "cpu_round_win",
    );
    expect(resolveArenaCoreVisualState("round_result", "tie", true)).toBe(
      "tie",
    );
  });
});

describe("round result labels", () => {
  it("uses concise primary labels", () => {
    expect(getRoundResultPrimaryLabel("player")).toBe("ROUND WON");
    expect(getRoundResultPrimaryLabel("cpu")).toBe("ROUND LOST");
    expect(getRoundResultPrimaryLabel("tie")).toBe("TIE");
  });

  it("returns contextual secondary labels", () => {
    expect(getRoundResultSecondaryLabel("tie", 0, 0)).toBe("REPLAY ROUND");
    expect(getRoundResultSecondaryLabel("player", 1, 0)).toBe(
      "YOUR MATCH POINT",
    );
    expect(getRoundResultSecondaryLabel("cpu", 0, 1)).toBe("CPU MATCH POINT");
    expect(getRoundResultSecondaryLabel("player", 1, 1)).toBe(
      "DOUBLE MATCH POINT",
    );
    expect(getRoundResultSecondaryLabel("player", 0, 0)).toBeNull();
  });

  it("formats a single accessible announcement", () => {
    expect(formatRoundResultAnnouncement("tie", 0, 0)).toBe(
      "Tie. Replay round.",
    );
    expect(formatRoundResultAnnouncement("player", 1, 0)).toBe(
      "You won the round. Your match point.",
    );
  });
});

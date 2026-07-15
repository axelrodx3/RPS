import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ALL_MOVE_SKINS,
  MOVE_ASSET_SETS,
  MOVE_TIMELINE_PRESENTATION_SCALE,
  TIER_ONE_SOURCE_FILENAMES,
  getActiveMoveSkins,
  getDefaultMoveSkin,
  getFutureMoveSkins,
  getMoveArtPath,
  getMoveTimelinePresentationScale,
} from "@/features/practice/moves/move-asset-registry";

describe("move asset registry", () => {
  it("registers seven variants for each move", () => {
    expect(MOVE_ASSET_SETS.rock.skins).toHaveLength(7);
    expect(MOVE_ASSET_SETS.paper.skins).toHaveLength(7);
    expect(MOVE_ASSET_SETS.scissors.skins).toHaveLength(7);
    expect(ALL_MOVE_SKINS).toHaveLength(21);
  });

  it("selects Tier 1 source filenames for Practice defaults", () => {
    expect(TIER_ONE_SOURCE_FILENAMES.rock).toBe("stone block tier 1.png");
    expect(TIER_ONE_SOURCE_FILENAMES.paper).toBe("blank paper tier 1.png");
    expect(TIER_ONE_SOURCE_FILENAMES.scissors).toBe("1.png");
  });

  it("uses Tier 1 PNG paths as defaults for all moves", () => {
    expect(getDefaultMoveSkin("rock").paths.png).toBe(
      "/assets/moves/skins/rock/tier-1.png",
    );
    expect(getDefaultMoveSkin("paper").paths.png).toBe(
      "/assets/moves/skins/paper/tier-1.png",
    );
    expect(getDefaultMoveSkin("scissors").paths.png).toBe(
      "/assets/moves/skins/scissors/tier-1.png",
    );
  });

  it("marks Tier 1 as active defaults and tiers 2 through 7 as inactive", () => {
    for (const move of ["rock", "paper", "scissors"] as const) {
      const active = getActiveMoveSkins(move);
      const future = getFutureMoveSkins(move);

      expect(active).toHaveLength(1);
      expect(active[0]?.tier).toBe(1);
      expect(active[0]?.defaultSkin).toBe(true);
      expect(future).toHaveLength(6);
      expect(future.every((skin) => !skin.active)).toBe(true);
      expect(
        future.every((skin) => skin.futureUnlockRequirement.type === "reward"),
      ).toBe(true);
    }
  });

  it("resolves selection, reveal, and timeline paths through the registry", () => {
    expect(getMoveArtPath("rock", "selection")).toContain("/rock/tier-1.png");
    expect(getMoveArtPath("paper", "reveal")).toContain("/paper/tier-1.png");
    expect(getMoveArtPath("scissors", "timeline")).toContain(
      "/scissors/tier-1.png",
    );
  });

  it("ships Tier 1 runtime PNG files for all moves", () => {
    for (const move of ["rock", "paper", "scissors"] as const) {
      const filePath = path.resolve(
        process.cwd(),
        `public/assets/moves/skins/${move}/tier-1.png`,
      );
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });

  it("exposes centralized timeline presentation scale tokens", () => {
    expect(MOVE_TIMELINE_PRESENTATION_SCALE.rock).toBe(0.92);
    expect(MOVE_TIMELINE_PRESENTATION_SCALE.paper).toBe(0.86);
    expect(MOVE_TIMELINE_PRESENTATION_SCALE.scissors).toBe(0.92);
    expect(getMoveTimelinePresentationScale("rock")).toBe(0.92);
  });
});

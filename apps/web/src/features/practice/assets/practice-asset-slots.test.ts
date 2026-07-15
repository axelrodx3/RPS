/** @vitest-environment happy-dom */

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PRACTICE_ASSET_SLOTS,
  PRACTICE_ASSET_SPECS,
  getMoveRevealAsset,
  getMoveSelectionAsset,
} from "@/features/practice/assets/practice-asset-slots";

describe("practice asset slots", () => {
  it("defines all replaceable battle arena slots", () => {
    expect(PRACTICE_ASSET_SLOTS.rockSelection.path).toBe(
      "/assets/moves/skins/rock/tier-1.png",
    );
    expect(PRACTICE_ASSET_SLOTS.rockSelection.fallback).toBe("✊");
    expect(PRACTICE_ASSET_SLOTS.confetti.path).toBe(
      "/assets/animations/confetti-victory.svg",
    );
    expect(PRACTICE_ASSET_SLOTS.victoryEffect.path).toBe(
      "/assets/result-backgrounds/victory-result-bg.webp",
    );
    expect(PRACTICE_ASSET_SLOTS.defeatEffect.path).toBe(
      "/assets/result-backgrounds/defeat-result-bg.webp",
    );
    expect(PRACTICE_ASSET_SPECS.moveReveal.width).toBe(128);
  });

  it("resolves move-specific selection and reveal slots", () => {
    expect(getMoveSelectionAsset("paper").path).toContain("/paper/tier-1.png");
    expect(getMoveRevealAsset("scissors").path).toContain(
      "/scissors/tier-1.png",
    );
    expect(getMoveRevealAsset("scissors").fallback).toBe("✌️");
  });

  it("documents asset slot guidance for motion designers", () => {
    const doc = readFileSync(
      path.resolve(
        process.cwd(),
        "../../docs/practice-animation-asset-slots.md",
      ),
      "utf8",
    );
    expect(doc).toContain("Practice Battle Arena");
    expect(doc).toContain("confetti-victory.svg");
  });
});

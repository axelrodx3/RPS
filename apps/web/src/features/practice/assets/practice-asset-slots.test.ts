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
    expect(PRACTICE_ASSET_SLOTS.rockSelection.fallback).toBe("✊");
    expect(PRACTICE_ASSET_SLOTS.confetti.path).toBe(
      "/assets/animations/confetti-victory.svg",
    );
    expect(PRACTICE_ASSET_SPECS.moveReveal.width).toBe(128);
  });

  it("resolves move-specific selection and reveal slots", () => {
    expect(getMoveSelectionAsset("paper").label).toContain("Paper");
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

import { describe, expect, it } from "vitest";
import { DEFAULT_PLAYER_AVATAR_ID } from "@/features/identity/avatar-registry";
import {
  DEFAULT_LOCAL_PROFILE,
  getProfileRankName,
  getProfileXpProgress,
} from "@/features/profile/profile-model";

describe("profile model", () => {
  it("defaults to tier 1 unlocks only", () => {
    expect(DEFAULT_LOCAL_PROFILE.unlockedAvatarIds).toEqual([
      DEFAULT_PLAYER_AVATAR_ID,
    ]);
    expect(DEFAULT_LOCAL_PROFILE.unlockedRockSkinIds).toEqual(["rock-tier-1"]);
    expect(DEFAULT_LOCAL_PROFILE.unlockedPaperSkinIds).toEqual([
      "paper-tier-1",
    ]);
    expect(DEFAULT_LOCAL_PROFILE.unlockedScissorsSkinIds).toEqual([
      "scissors-tier-1",
    ]);
  });

  it("exposes placeholder progression values", () => {
    expect(DEFAULT_LOCAL_PROFILE.level).toBeGreaterThan(0);
    expect(DEFAULT_LOCAL_PROFILE.xp).toBeGreaterThan(0);
    expect(getProfileRankName(DEFAULT_LOCAL_PROFILE)).toBe("Bronze");
    expect(getProfileXpProgress(DEFAULT_LOCAL_PROFILE)).toBeGreaterThan(0);
  });
});

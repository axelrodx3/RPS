/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest";
import {
  DEFAULT_STORED_LOCAL_PROFILE,
  mergeStoredProfileWithDefaults,
  parseStoredLocalProfile,
} from "@/lib/storage/local-profile-storage";

describe("local profile storage", () => {
  it("falls back to tier 1 when saved equipped ids are invalid", () => {
    const parsed = parseStoredLocalProfile(
      JSON.stringify({
        schemaVersion: 1,
        equippedAvatarId: "avatar-tier-5",
        equippedRockSkinId: "rock-tier-4",
        equippedPaperSkinId: "paper-tier-3",
        equippedScissorsSkinId: "scissors-tier-2",
        unlockedAvatarIds: ["avatar-tier-1"],
        unlockedRockSkinIds: ["rock-tier-1"],
        unlockedPaperSkinIds: ["paper-tier-1"],
        unlockedScissorsSkinIds: ["scissors-tier-1"],
      }),
    );

    const profile = mergeStoredProfileWithDefaults(parsed);
    expect(profile.equipped.avatarId).toBe("avatar-tier-1");
    expect(profile.equipped.rockSkinId).toBe("rock-tier-1");
    expect(profile.equipped.paperSkinId).toBe("paper-tier-1");
    expect(profile.equipped.scissorsSkinId).toBe("scissors-tier-1");
  });

  it("preserves valid equipped ids from storage", () => {
    const stored = {
      ...DEFAULT_STORED_LOCAL_PROFILE,
      equippedAvatarId: "avatar-tier-1",
      equippedRockSkinId: "rock-tier-1",
    };
    const profile = mergeStoredProfileWithDefaults(stored);
    expect(profile.equipped.avatarId).toBe("avatar-tier-1");
    expect(profile.equipped.rockSkinId).toBe("rock-tier-1");
  });
});

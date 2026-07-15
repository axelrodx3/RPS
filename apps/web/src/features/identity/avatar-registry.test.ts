import { describe, expect, it } from "vitest";
import {
  AVATAR_TIERS,
  DEFAULT_PLAYER_AVATAR_ID,
  getPlayerAvatar,
} from "@/features/identity/avatar-registry";

describe("avatar registry", () => {
  it("registers seven avatar tiers with tier 1 unlocked", () => {
    expect(AVATAR_TIERS).toHaveLength(7);
    expect(DEFAULT_PLAYER_AVATAR_ID).toBe("avatar-tier-1");
    expect(AVATAR_TIERS[0]?.previewPath).toBe("/assets/avatars/robot-head.svg");
    expect(
      AVATAR_TIERS.filter((avatar) => avatar.unlockedByDefault),
    ).toHaveLength(1);
  });

  it("resolves the default robot avatar", () => {
    const avatar = getPlayerAvatar();
    expect(avatar.accessibleName).toBe("Robot avatar");
    expect(avatar.tier).toBe(1);
  });
});

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  AVATAR_FANART_SOURCE_FILES,
  AVATAR_TIERS,
  DEFAULT_PLAYER_AVATAR_ID,
  getAvatarPreviewPresentation,
  getPlayerAvatar,
  PLAYER_AVATAR_REGISTRY,
} from "@/features/identity/avatar-registry";

describe("avatar registry", () => {
  it("registers exactly seven avatar tiers", () => {
    expect(AVATAR_TIERS).toHaveLength(7);
    expect(Object.keys(PLAYER_AVATAR_REGISTRY)).toHaveLength(7);
  });

  it("maps robot to tier 1 and fan art files to tiers 2 through 7 in order", () => {
    expect(DEFAULT_PLAYER_AVATAR_ID).toBe("avatar-tier-1");
    expect(AVATAR_TIERS[0]?.tier).toBe(1);
    expect(AVATAR_TIERS[0]?.displayName).toBe("Robot");
    expect(AVATAR_TIERS[0]?.sourceFilename).toBe("robot-head.svg");
    expect(AVATAR_TIERS[0]?.unlockedByDefault).toBe(true);

    AVATAR_FANART_SOURCE_FILES.forEach((sourceFilename, index) => {
      const avatar = AVATAR_TIERS[index + 1];
      expect(avatar?.tier).toBe(index + 2);
      expect(avatar?.sourceFilename).toBe(sourceFilename);
      expect(avatar?.displayName).toBe(`Avatar Tier ${index + 2}`);
      expect(avatar?.unlockedByDefault).toBe(false);
    });
  });

  it("ships runtime assets for all approved fan art avatars", () => {
    for (let tier = 2; tier <= 7; tier += 1) {
      const avatar = AVATAR_TIERS[tier - 1]!;
      const pngPath = path.resolve(
        process.cwd(),
        `public${avatar.profilePreviewPath}`,
      );
      const webpPath = path.resolve(
        process.cwd(),
        `public${avatar.profilePreviewWebpPath}`,
      );
      expect(fs.existsSync(pngPath)).toBe(true);
      expect(fs.existsSync(webpPath)).toBe(true);
      expect(avatar.previewPath).toContain(`tier-${tier}.webp`);
    }
  });

  it("uses contain-based presentation metadata for every avatar tier", () => {
    for (const avatar of AVATAR_TIERS) {
      const presentation = getAvatarPreviewPresentation(avatar.tier);
      expect(presentation.maxWidth).toBeTruthy();
      expect(presentation.maxHeight).toBeTruthy();
      expect(presentation.objectPosition).toBeTruthy();
    }
  });

  it("resolves the default robot avatar", () => {
    const avatar = getPlayerAvatar();
    expect(avatar.accessibleName).toBe("Robot avatar");
    expect(avatar.tier).toBe(1);
    expect(avatar.assetPath).toBe("/assets/avatars/robot-head.svg");
  });
});

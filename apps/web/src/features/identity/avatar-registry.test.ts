import { describe, expect, it } from "vitest";
import { brand } from "@/config/brand";
import {
  AVATAR_CONTAINER_SIZE_PX,
  BOT_IDENTITY,
  DEFAULT_PLAYER_AVATAR_ID,
  getBotAvatar,
  getPlayerAvatar,
  PLAYER_AVATAR_REGISTRY,
} from "@/features/identity/avatar-registry";

describe("avatar registry", () => {
  it("exposes a default player avatar id", () => {
    expect(DEFAULT_PLAYER_AVATAR_ID).toBe("robot-default");
    expect(PLAYER_AVATAR_REGISTRY[DEFAULT_PLAYER_AVATAR_ID]?.assetPath).toBe(
      "/assets/avatars/robot-head.svg",
    );
  });

  it("resolves the default robot avatar", () => {
    const avatar = getPlayerAvatar();
    expect(avatar.accessibleName).toBe("Robot avatar");
    expect(avatar.previewPath).toContain("robot-head.svg");
  });

  it("uses the approved R icon for bot opponents", () => {
    const bot = getBotAvatar();
    expect(bot.assetPath).toBe(brand.assets.icon);
    expect(BOT_IDENTITY.assetPath).toBe("/brand/rps-icon-header.png");
  });

  it("uses equal avatar container dimensions", () => {
    expect(AVATAR_CONTAINER_SIZE_PX).toBe(44);
  });
});

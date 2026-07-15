import { brand } from "@/config/brand";

export type AvatarDefinition = {
  id: string;
  tier: number;
  displayName: string;
  assetPath: string;
  accessibleName: string;
  previewPath: string;
  unlockedByDefault: boolean;
};

export const DEFAULT_PLAYER_AVATAR_ID = "avatar-tier-1";

export const AVATAR_TIERS: AvatarDefinition[] = Array.from(
  { length: 7 },
  (_, index) => {
    const tier = index + 1;
    const isTierOne = tier === 1;

    return {
      id: `avatar-tier-${tier}`,
      tier,
      displayName: isTierOne ? "Robot" : `Avatar Tier ${tier}`,
      assetPath: isTierOne ? "/assets/avatars/robot-head.svg" : "",
      previewPath: isTierOne ? "/assets/avatars/robot-head.svg" : "",
      accessibleName: isTierOne
        ? "Robot avatar"
        : `Avatar tier ${tier} (locked)`,
      unlockedByDefault: isTierOne,
    };
  },
);

export const PLAYER_AVATAR_REGISTRY: Record<string, AvatarDefinition> =
  Object.fromEntries(AVATAR_TIERS.map((avatar) => [avatar.id, avatar]));

/** @deprecated Use DEFAULT_PLAYER_AVATAR_ID */
export const LEGACY_ROBOT_AVATAR_ID = "robot-default";

export const BOT_IDENTITY: AvatarDefinition = {
  id: "rps-brand-cpu",
  tier: 0,
  displayName: "CPU",
  assetPath: brand.assets.icon,
  accessibleName: "CPU opponent",
  previewPath: brand.assets.icon,
  unlockedByDefault: true,
};

export function getPlayerAvatar(
  avatarId: string = DEFAULT_PLAYER_AVATAR_ID,
): AvatarDefinition {
  const avatar = PLAYER_AVATAR_REGISTRY[avatarId];
  if (avatar) return avatar;
  return PLAYER_AVATAR_REGISTRY[DEFAULT_PLAYER_AVATAR_ID]!;
}

export function getBotAvatar(): AvatarDefinition {
  return BOT_IDENTITY;
}

export function getAvatarTier(tier: number): AvatarDefinition | undefined {
  return AVATAR_TIERS.find((avatar) => avatar.tier === tier);
}

/** Shared outer dimensions for player and bot strip avatars. */
export const AVATAR_CONTAINER_SIZE_PX = 44;

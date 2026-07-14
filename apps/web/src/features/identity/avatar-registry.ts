import { brand } from "@/config/brand";

export type AvatarDefinition = {
  id: string;
  assetPath: string;
  accessibleName: string;
  previewPath: string;
  locked?: boolean;
};

export const DEFAULT_PLAYER_AVATAR_ID = "robot-default";

export const PLAYER_AVATAR_REGISTRY: Record<string, AvatarDefinition> = {
  [DEFAULT_PLAYER_AVATAR_ID]: {
    id: DEFAULT_PLAYER_AVATAR_ID,
    assetPath: "/assets/avatars/robot-head.svg",
    accessibleName: "Robot avatar",
    previewPath: "/assets/avatars/robot-head.svg",
    locked: false,
  },
};

export const BOT_IDENTITY: AvatarDefinition = {
  id: "rps-brand-cpu",
  assetPath: brand.assets.icon,
  accessibleName: "CPU opponent",
  previewPath: brand.assets.icon,
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

/** Shared outer dimensions for player and bot strip avatars. */
export const AVATAR_CONTAINER_SIZE_PX = 44;

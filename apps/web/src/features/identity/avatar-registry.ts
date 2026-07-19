import { brand } from "@/config/brand";

export type AvatarApprovalStatus = "approved" | "approved-preview";
export type AvatarLicenseStatus = "pending-verification" | "project-generated";

export type AvatarProfilePreviewPresentation = {
  previewScale: number;
  objectPosition: string;
  maxWidth: string;
  maxHeight: string;
  internalPadding: string;
};

export type AvatarDefinition = {
  id: string;
  tier: number;
  displayName: string;
  sourceFilename: string;
  sourceFolder: string;
  assetPath: string;
  previewPath: string;
  thumbnailPath: string;
  profilePreviewPath: string;
  profilePreviewWebpPath: string | null;
  accessibleName: string;
  unlockedByDefault: boolean;
  unlockRequirement: string | null;
  approvalStatus: AvatarApprovalStatus;
  licenseStatus: AvatarLicenseStatus;
  presentation: AvatarProfilePreviewPresentation;
};

export const DEFAULT_PLAYER_AVATAR_ID = "avatar-tier-1";

export const AVATAR_SOURCE_FOLDER = "animations/AvatarSixFanArt";

export const AVATAR_FANART_SOURCE_FILES = [
  "1.png",
  "2.png",
  "3.png",
  "4.png",
  "5.png",
  "6.png",
] as const;

const ROBOT_SOURCE = {
  sourceFilename: "robot-head.svg",
  sourceFolder: "apps/web/public/assets/avatars",
} as const;

const DEFAULT_PRESENTATION: AvatarProfilePreviewPresentation = {
  previewScale: 1,
  objectPosition: "center",
  maxWidth: "78%",
  maxHeight: "78%",
  internalPadding: "8%",
};

export const AVATAR_PROFILE_PREVIEW_PRESENTATION: Record<
  number,
  AvatarProfilePreviewPresentation
> = {
  1: {
    previewScale: 1,
    objectPosition: "center",
    maxWidth: "72%",
    maxHeight: "72%",
    internalPadding: "12%",
  },
  2: { ...DEFAULT_PRESENTATION },
  3: { ...DEFAULT_PRESENTATION },
  4: {
    ...DEFAULT_PRESENTATION,
    previewScale: 0.96,
    maxHeight: "82%",
  },
  5: { ...DEFAULT_PRESENTATION },
  6: {
    ...DEFAULT_PRESENTATION,
    previewScale: 1.08,
    maxWidth: "84%",
  },
  7: { ...DEFAULT_PRESENTATION },
};

export const PROFILE_PREVIEW_CONTAINER_PX = 88;

function avatarRuntimePaths(tier: number) {
  if (tier === 1) {
    const svg = "/assets/avatars/robot-head.svg";
    return {
      assetPath: svg,
      previewPath: svg,
      thumbnailPath: svg,
      profilePreviewPath: svg,
      profilePreviewWebpPath: null,
    };
  }

  const base = `/assets/avatars/tier-${tier}`;
  return {
    assetPath: `${base}.png`,
    previewPath: `${base}.webp`,
    thumbnailPath: `${base}.png`,
    profilePreviewPath: `${base}.png`,
    profilePreviewWebpPath: `${base}.webp`,
  };
}

function createAvatarTier(tier: number): AvatarDefinition {
  const isTierOne = tier === 1;
  const paths = avatarRuntimePaths(tier);
  const fanArtIndex = tier - 2;

  return {
    id: `avatar-tier-${tier}`,
    tier,
    displayName: isTierOne ? "Robot" : `Avatar Tier ${tier}`,
    sourceFilename: isTierOne
      ? ROBOT_SOURCE.sourceFilename
      : AVATAR_FANART_SOURCE_FILES[fanArtIndex]!,
    sourceFolder: isTierOne ? ROBOT_SOURCE.sourceFolder : AVATAR_SOURCE_FOLDER,
    ...paths,
    accessibleName: isTierOne
      ? "Robot avatar"
      : `Avatar tier ${tier} fan art preview`,
    unlockedByDefault: isTierOne,
    unlockRequirement: isTierOne ? null : `Reach Level ${tier + 2}`,
    approvalStatus: isTierOne ? "approved" : "approved-preview",
    licenseStatus: isTierOne ? "project-generated" : "pending-verification",
    presentation: AVATAR_PROFILE_PREVIEW_PRESENTATION[tier]!,
  };
}

export const AVATAR_TIERS: AvatarDefinition[] = Array.from(
  { length: 7 },
  (_, index) => createAvatarTier(index + 1),
);

export const PLAYER_AVATAR_REGISTRY: Record<string, AvatarDefinition> =
  Object.fromEntries(AVATAR_TIERS.map((avatar) => [avatar.id, avatar]));

/** @deprecated Use DEFAULT_PLAYER_AVATAR_ID */
export const LEGACY_ROBOT_AVATAR_ID = "robot-default";

export const BOT_IDENTITY: AvatarDefinition = {
  id: "rps-brand-cpu",
  tier: 0,
  displayName: "CPU",
  sourceFilename: "rps-icon-header.png",
  sourceFolder: "apps/web/public/brand",
  assetPath: brand.assets.icon,
  previewPath: brand.assets.icon,
  thumbnailPath: brand.assets.icon,
  profilePreviewPath: brand.assets.icon,
  profilePreviewWebpPath: null,
  accessibleName: "CPU opponent",
  unlockedByDefault: true,
  unlockRequirement: null,
  approvalStatus: "approved",
  licenseStatus: "project-generated",
  presentation: DEFAULT_PRESENTATION,
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

export function getAvatarPreviewPresentation(
  tier: number,
): AvatarProfilePreviewPresentation {
  return AVATAR_PROFILE_PREVIEW_PRESENTATION[tier] ?? DEFAULT_PRESENTATION;
}

/** Shared outer dimensions for player and bot strip avatars. */
export const AVATAR_CONTAINER_SIZE_PX = 44;

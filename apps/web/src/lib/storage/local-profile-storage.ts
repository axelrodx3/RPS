import { DEFAULT_PLAYER_AVATAR_ID } from "@/features/identity/avatar-registry";
import { getDefaultMoveSkin } from "@/features/practice/moves/move-asset-registry";
import {
  DEFAULT_LOCAL_PROFILE,
  type LocalProfile,
} from "@/features/profile/profile-model";

export const LOCAL_PROFILE_STORAGE_KEY = "rps.local-profile.v1";

export type StoredLocalProfile = {
  schemaVersion: 1;
  equippedAvatarId: string;
  equippedRockSkinId: string;
  equippedPaperSkinId: string;
  equippedScissorsSkinId: string;
  unlockedAvatarIds: string[];
  unlockedRockSkinIds: string[];
  unlockedPaperSkinIds: string[];
  unlockedScissorsSkinIds: string[];
};

export const DEFAULT_STORED_LOCAL_PROFILE: StoredLocalProfile = {
  schemaVersion: 1,
  equippedAvatarId: DEFAULT_PLAYER_AVATAR_ID,
  equippedRockSkinId: getDefaultMoveSkin("rock").skinId,
  equippedPaperSkinId: getDefaultMoveSkin("paper").skinId,
  equippedScissorsSkinId: getDefaultMoveSkin("scissors").skinId,
  unlockedAvatarIds: [DEFAULT_PLAYER_AVATAR_ID],
  unlockedRockSkinIds: [getDefaultMoveSkin("rock").skinId],
  unlockedPaperSkinIds: [getDefaultMoveSkin("paper").skinId],
  unlockedScissorsSkinIds: [getDefaultMoveSkin("scissors").skinId],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sanitizeStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return [...fallback];
  const filtered = value.filter((entry) => typeof entry === "string");
  return filtered.length > 0 ? filtered : [...fallback];
}

function sanitizeId(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export function parseStoredLocalProfile(
  raw: string | null,
): StoredLocalProfile {
  if (!raw) return { ...DEFAULT_STORED_LOCAL_PROFILE };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.schemaVersion !== 1) {
      return { ...DEFAULT_STORED_LOCAL_PROFILE };
    }

    const defaults = DEFAULT_STORED_LOCAL_PROFILE;
    const unlockedAvatarIds = sanitizeStringArray(
      parsed.unlockedAvatarIds,
      defaults.unlockedAvatarIds,
    );
    const unlockedRockSkinIds = sanitizeStringArray(
      parsed.unlockedRockSkinIds,
      defaults.unlockedRockSkinIds,
    );
    const unlockedPaperSkinIds = sanitizeStringArray(
      parsed.unlockedPaperSkinIds,
      defaults.unlockedPaperSkinIds,
    );
    const unlockedScissorsSkinIds = sanitizeStringArray(
      parsed.unlockedScissorsSkinIds,
      defaults.unlockedScissorsSkinIds,
    );

    const equippedAvatarId = sanitizeId(
      parsed.equippedAvatarId,
      defaults.equippedAvatarId,
    );
    const equippedRockSkinId = sanitizeId(
      parsed.equippedRockSkinId,
      defaults.equippedRockSkinId,
    );
    const equippedPaperSkinId = sanitizeId(
      parsed.equippedPaperSkinId,
      defaults.equippedPaperSkinId,
    );
    const equippedScissorsSkinId = sanitizeId(
      parsed.equippedScissorsSkinId,
      defaults.equippedScissorsSkinId,
    );

    return {
      schemaVersion: 1,
      equippedAvatarId: unlockedAvatarIds.includes(equippedAvatarId)
        ? equippedAvatarId
        : defaults.equippedAvatarId,
      equippedRockSkinId: unlockedRockSkinIds.includes(equippedRockSkinId)
        ? equippedRockSkinId
        : defaults.equippedRockSkinId,
      equippedPaperSkinId: unlockedPaperSkinIds.includes(equippedPaperSkinId)
        ? equippedPaperSkinId
        : defaults.equippedPaperSkinId,
      equippedScissorsSkinId: unlockedScissorsSkinIds.includes(
        equippedScissorsSkinId,
      )
        ? equippedScissorsSkinId
        : defaults.equippedScissorsSkinId,
      unlockedAvatarIds,
      unlockedRockSkinIds,
      unlockedPaperSkinIds,
      unlockedScissorsSkinIds,
    };
  } catch {
    return { ...DEFAULT_STORED_LOCAL_PROFILE };
  }
}

export function readStoredLocalProfile(
  storage: Storage | null,
): StoredLocalProfile {
  if (!storage) return { ...DEFAULT_STORED_LOCAL_PROFILE };
  return parseStoredLocalProfile(storage.getItem(LOCAL_PROFILE_STORAGE_KEY));
}

export function writeStoredLocalProfile(
  storage: Storage | null,
  profile: StoredLocalProfile,
): void {
  if (!storage) return;
  storage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function mergeStoredProfileWithDefaults(
  stored: StoredLocalProfile,
): LocalProfile {
  return {
    ...DEFAULT_LOCAL_PROFILE,
    avatarId: stored.equippedAvatarId,
    equipped: {
      avatarId: stored.equippedAvatarId,
      rockSkinId: stored.equippedRockSkinId,
      paperSkinId: stored.equippedPaperSkinId,
      scissorsSkinId: stored.equippedScissorsSkinId,
    },
    unlockedAvatarIds: stored.unlockedAvatarIds,
    unlockedRockSkinIds: stored.unlockedRockSkinIds,
    unlockedPaperSkinIds: stored.unlockedPaperSkinIds,
    unlockedScissorsSkinIds: stored.unlockedScissorsSkinIds,
  };
}

export function toStoredLocalProfile(
  profile: LocalProfile,
): StoredLocalProfile {
  return {
    schemaVersion: 1,
    equippedAvatarId: profile.equipped.avatarId,
    equippedRockSkinId: profile.equipped.rockSkinId,
    equippedPaperSkinId: profile.equipped.paperSkinId,
    equippedScissorsSkinId: profile.equipped.scissorsSkinId,
    unlockedAvatarIds: profile.unlockedAvatarIds,
    unlockedRockSkinIds: profile.unlockedRockSkinIds,
    unlockedPaperSkinIds: profile.unlockedPaperSkinIds,
    unlockedScissorsSkinIds: profile.unlockedScissorsSkinIds,
  };
}

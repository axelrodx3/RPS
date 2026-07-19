import { DEFAULT_PLAYER_AVATAR_ID } from "@/features/identity/avatar-registry";
import { getDefaultMoveSkin } from "@/features/practice/moves/move-asset-registry";
import { getRankById } from "@/features/profile/rank-registry";

export type EquippedCosmetics = {
  avatarId: string;
  rockSkinId: string;
  paperSkinId: string;
  scissorsSkinId: string;
};

export type LocalProfile = {
  username: string;
  avatarId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  rankId: string;
  equipped: EquippedCosmetics;
  unlockedAvatarIds: string[];
  unlockedRockSkinIds: string[];
  unlockedPaperSkinIds: string[];
  unlockedScissorsSkinIds: string[];
};

export const DEFAULT_LOCAL_PROFILE: LocalProfile = {
  username: "Player",
  avatarId: DEFAULT_PLAYER_AVATAR_ID,
  level: 3,
  xp: 420,
  xpToNextLevel: 600,
  rankId: "bronze",
  equipped: {
    avatarId: DEFAULT_PLAYER_AVATAR_ID,
    rockSkinId: getDefaultMoveSkin("rock").skinId,
    paperSkinId: getDefaultMoveSkin("paper").skinId,
    scissorsSkinId: getDefaultMoveSkin("scissors").skinId,
  },
  unlockedAvatarIds: [DEFAULT_PLAYER_AVATAR_ID],
  unlockedRockSkinIds: [getDefaultMoveSkin("rock").skinId],
  unlockedPaperSkinIds: [getDefaultMoveSkin("paper").skinId],
  unlockedScissorsSkinIds: [getDefaultMoveSkin("scissors").skinId],
};

export function getProfileRankName(profile: LocalProfile): string {
  return getRankById(profile.rankId).name;
}

export function getProfileXpProgress(profile: LocalProfile): number {
  if (profile.xpToNextLevel <= 0) return 100;
  return Math.min(100, Math.round((profile.xp / profile.xpToNextLevel) * 100));
}

export function getProfileXpRemaining(profile: LocalProfile): number {
  return Math.max(0, profile.xpToNextLevel - profile.xp);
}

export const NEXT_REWARD_PREVIEW = {
  label: "Avatar Tier 2",
  requirement: "Reach Level 4",
} as const;

export const PROFILE_REWARD_ROADMAP = [
  { level: 4, reward: "Avatar Tier 2" },
  { level: 8, reward: "Rock Tier 2" },
  { level: 12, reward: "Paper Tier 2" },
  { level: 16, reward: "Scissors Tier 2" },
] as const;

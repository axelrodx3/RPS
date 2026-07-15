import type { Move } from "@/features/practice/engine/practice-engine";
import {
  MOVE_EMOJI,
  MOVE_LABELS,
} from "@/features/practice/engine/practice-engine";

export type MoveArtVariant = "selection" | "arena" | "reveal" | "timeline";

export type SkinApprovalStatus = "approved" | "preserved";
export type SkinActiveStatus = "active" | "inactive";
export type FutureUnlockRequirementType =
  "default" | "level" | "reward" | "purchase";

export type FutureUnlockRequirement = {
  type: FutureUnlockRequirementType;
  threshold?: number;
  description?: string;
};

export type MoveSkinPaths = {
  png: string;
  webp: string | null;
  selection: string;
  reveal: string;
  timeline: string;
  thumbnail: string;
};

export type MoveSkin = {
  skinId: string;
  moveId: Move;
  tier: number;
  displayName: string;
  sourceFilename: string;
  sourceFolder: string;
  paths: MoveSkinPaths;
  unlockedByDefault: boolean;
  active: boolean;
  defaultSkin: boolean;
  approvalStatus: SkinApprovalStatus;
  futureUnlockRequirement: FutureUnlockRequirement;
  /** Per-move visual scale for consistent perceived size in UI containers. */
  presentationScale: number;
  accessibleDescription: string;
};

export type MoveAssetSet = {
  moveId: Move;
  visibleName: string;
  defaultSkinId: string;
  accessibleDescription: string;
  skins: MoveSkin[];
};

const ROCK_SOURCE_FOLDER = "animations/7 Tiers of stone blocks 512x512";
const PAPER_SOURCE_FOLDER = "animations/7 Tiers of blank papers 512x512";
const SCISSORS_SOURCE_FOLDER = "animations/21 v6.1 Scissors 512x512";

const ROCK_SOURCE_FILES = [
  "stone block tier 1.png",
  "stone block tier 2.png",
  "stone block tier 3.png",
  "stone block tier 4.png",
  "stone block tier 5.png",
  "stone block tier 6.png",
  "stone block tier 7.png",
] as const;

const PAPER_SOURCE_FILES = [
  "blank paper tier 1.png",
  "blank paper tier 2.png",
  "blank paper tier 3.png",
  "blank paper tier 4.png",
  "blank paper tier 5.png",
  "blank paper tier 6.png",
  "blank paper tier 7.png",
] as const;

const SCISSORS_SOURCE_FILES = [
  "1.png",
  "2.png",
  "3.png",
  "4.png",
  "5.png",
  "6.png",
  "7.png",
] as const;

/** Centralized per-move presentation scale tokens. */
export const MOVE_PRESENTATION_SCALE: Record<Move, number> = {
  rock: 1.08,
  paper: 1,
  scissors: 0.96,
};

function skinPaths(moveId: Move, tier: number): MoveSkinPaths {
  const png = `/assets/moves/skins/${moveId}/tier-${tier}.png`;
  // WebP paths are reserved for future derivatives; omit until files exist in public/.
  const webp = null;

  return {
    png,
    webp,
    selection: png,
    reveal: png,
    timeline: png,
    thumbnail: png,
  };
}

function createSkin(
  moveId: Move,
  tier: number,
  sourceFilename: string,
  sourceFolder: string,
  options: {
    active: boolean;
    defaultSkin: boolean;
    approvalStatus: SkinApprovalStatus;
    unlockedByDefault: boolean;
    futureUnlockRequirement: FutureUnlockRequirement;
  },
): MoveSkin {
  const visibleName = MOVE_LABELS[moveId];

  return {
    skinId: `${moveId}-tier-${tier}`,
    moveId,
    tier,
    displayName: `${visibleName} Tier ${tier}`,
    sourceFilename,
    sourceFolder,
    paths: skinPaths(moveId, tier),
    unlockedByDefault: options.unlockedByDefault,
    active: options.active,
    defaultSkin: options.defaultSkin,
    approvalStatus: options.approvalStatus,
    futureUnlockRequirement: options.futureUnlockRequirement,
    presentationScale: MOVE_PRESENTATION_SCALE[moveId],
    accessibleDescription: `${visibleName} move artwork, tier ${tier}`,
  };
}

function buildMoveSet(
  moveId: Move,
  sourceFolder: string,
  sourceFiles: readonly string[],
): MoveAssetSet {
  const skins = sourceFiles.map((sourceFilename, index) => {
    const tier = index + 1;
    const isTierOne = tier === 1;

    return createSkin(moveId, tier, sourceFilename, sourceFolder, {
      active: isTierOne,
      defaultSkin: isTierOne,
      approvalStatus: isTierOne ? "approved" : "preserved",
      unlockedByDefault: isTierOne,
      futureUnlockRequirement: isTierOne
        ? { type: "default" }
        : {
            type: "reward",
            description: "Future unlock — not available in Practice yet",
          },
    });
  });

  return {
    moveId,
    visibleName: MOVE_LABELS[moveId],
    defaultSkinId: `${moveId}-tier-1`,
    accessibleDescription: `${MOVE_LABELS[moveId]} move`,
    skins,
  };
}

export const MOVE_ASSET_SETS: Record<Move, MoveAssetSet> = {
  rock: buildMoveSet("rock", ROCK_SOURCE_FOLDER, ROCK_SOURCE_FILES),
  paper: buildMoveSet("paper", PAPER_SOURCE_FOLDER, PAPER_SOURCE_FILES),
  scissors: buildMoveSet(
    "scissors",
    SCISSORS_SOURCE_FOLDER,
    SCISSORS_SOURCE_FILES,
  ),
};

export const ALL_MOVE_SKINS: MoveSkin[] = Object.values(
  MOVE_ASSET_SETS,
).flatMap((set) => set.skins);

export const TIER_ONE_SOURCE_FILENAMES = {
  rock: ROCK_SOURCE_FILES[0],
  paper: PAPER_SOURCE_FILES[0],
  scissors: SCISSORS_SOURCE_FILES[0],
} as const;

export function getMoveAssetSet(move: Move): MoveAssetSet {
  return MOVE_ASSET_SETS[move];
}

export function getMoveSkin(move: Move, tier: number): MoveSkin | undefined {
  return getMoveAssetSet(move).skins.find((skin) => skin.tier === tier);
}

export function getDefaultMoveSkin(move: Move): MoveSkin {
  const skin = getMoveAssetSet(move).skins.find((entry) => entry.defaultSkin);
  if (!skin) {
    throw new Error(`Missing default skin for move: ${move}`);
  }
  return skin;
}

export function getActiveMoveSkins(move: Move): MoveSkin[] {
  return getMoveAssetSet(move).skins.filter((skin) => skin.active);
}

export function getFutureMoveSkins(move: Move): MoveSkin[] {
  return getMoveAssetSet(move).skins.filter((skin) => !skin.active);
}

export function resolveMoveSkin(move: Move, skinId?: string | null): MoveSkin {
  if (!skinId) {
    return getDefaultMoveSkin(move);
  }

  const skin = ALL_MOVE_SKINS.find(
    (entry) => entry.skinId === skinId && entry.moveId === move,
  );
  if (!skin?.active) {
    return getDefaultMoveSkin(move);
  }
  return skin;
}

export function getMoveArtPath(
  move: Move,
  variant: MoveArtVariant,
  skinId?: string | null,
): string {
  const skin = resolveMoveSkin(move, skinId);
  switch (variant) {
    case "selection":
      return skin.paths.selection;
    case "arena":
    case "reveal":
      return skin.paths.reveal;
    case "timeline":
      return skin.paths.timeline;
    default:
      return skin.paths.png;
  }
}

export function getMoveFallbackEmoji(move: Move): string {
  return MOVE_EMOJI[move];
}

export function getMoveAccessibleLabel(move: Move): string {
  return MOVE_LABELS[move];
}

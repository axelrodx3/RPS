import type { Move } from "@/features/practice/engine/practice-engine";
import {
  getDefaultMoveSkin,
  getMoveAssetSet,
} from "@/features/practice/moves/move-asset-registry";

export type MoveMetadata = {
  id: Move;
  label: string;
  shortLabel: string;
  description: string;
  defaultSkinId: string;
  selectionArtPath: string;
};

function buildMoveMetadata(move: Move): MoveMetadata {
  const set = getMoveAssetSet(move);
  const defaultSkin = getDefaultMoveSkin(move);

  return {
    id: move,
    label: set.visibleName,
    shortLabel: set.visibleName,
    description: `${set.visibleName} move`,
    defaultSkinId: defaultSkin.skinId,
    selectionArtPath: defaultSkin.paths.selection,
  };
}

export const MOVE_METADATA: Record<Move, MoveMetadata> = {
  rock: buildMoveMetadata("rock"),
  paper: buildMoveMetadata("paper"),
  scissors: buildMoveMetadata("scissors"),
};

export const MOVE_LIST = Object.values(MOVE_METADATA);

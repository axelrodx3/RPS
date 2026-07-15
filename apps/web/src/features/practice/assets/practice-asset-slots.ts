import type { Move } from "@/features/practice/engine/practice-engine";
import { MOVE_EMOJI } from "@/features/practice/engine/practice-engine";
import {
  getDefaultMoveSkin,
  getMoveArtPath,
} from "@/features/practice/moves/move-asset-registry";

/** Recommended dimensions for motion-designer deliverables. */
export const PRACTICE_ASSET_SPECS = {
  moveSelection: { width: 96, height: 96, format: "PNG RGBA" },
  moveReveal: { width: 128, height: 128, format: "PNG RGBA" },
  moveTimeline: { width: 28, height: 28, format: "PNG RGBA" },
  playerAvatar: { width: 64, height: 64, format: "SVG" },
  cpuAvatar: { width: 64, height: 64, format: "SVG" },
  vsEffect: { width: 120, height: 48, format: "SVG or Lottie JSON" },
  victoryEffect: { width: 480, height: 240, format: "PNG/WebP" },
  defeatEffect: { width: 480, height: 240, format: "PNG/WebP" },
  confetti: {
    width: 609,
    height: 812,
    format: "SVG (Lottie export) or Lottie JSON",
  },
} as const;

export type PracticeAssetSlot =
  | "rockSelection"
  | "paperSelection"
  | "scissorsSelection"
  | "rockReveal"
  | "paperReveal"
  | "scissorsReveal"
  | "playerAvatar"
  | "cpuAvatar"
  | "vsEffect"
  | "victoryEffect"
  | "defeatEffect"
  | "confetti";

export const PRACTICE_ASSET_SLOTS: Record<
  PracticeAssetSlot,
  { path: string | null; fallback: string; label: string }
> = {
  rockSelection: {
    path: getMoveArtPath("rock", "selection"),
    fallback: MOVE_EMOJI.rock,
    label: "Rock selection art",
  },
  paperSelection: {
    path: getMoveArtPath("paper", "selection"),
    fallback: MOVE_EMOJI.paper,
    label: "Paper selection art",
  },
  scissorsSelection: {
    path: getMoveArtPath("scissors", "selection"),
    fallback: MOVE_EMOJI.scissors,
    label: "Scissors selection art",
  },
  rockReveal: {
    path: getMoveArtPath("rock", "reveal"),
    fallback: MOVE_EMOJI.rock,
    label: "Rock reveal art",
  },
  paperReveal: {
    path: getMoveArtPath("paper", "reveal"),
    fallback: MOVE_EMOJI.paper,
    label: "Paper reveal art",
  },
  scissorsReveal: {
    path: getMoveArtPath("scissors", "reveal"),
    fallback: MOVE_EMOJI.scissors,
    label: "Scissors reveal art",
  },
  playerAvatar: {
    path: "/assets/avatars/robot-head.svg",
    fallback: "🤖",
    label: "Player avatar",
  },
  cpuAvatar: {
    path: "/brand/rps-icon-header.png",
    fallback: "R",
    label: "CPU avatar",
  },
  vsEffect: {
    path: null,
    fallback: "VS",
    label: "Versus impact effect",
  },
  victoryEffect: {
    path: "/assets/result-backgrounds/victory-result-bg.webp",
    fallback: "Victory",
    label: "Victory cinematic background",
  },
  defeatEffect: {
    path: "/assets/result-backgrounds/defeat-result-bg.webp",
    fallback: "Defeat",
    label: "Defeat cinematic background",
  },
  confetti: {
    path: "/assets/animations/confetti-victory.svg",
    fallback: "",
    label: "Victory confetti",
  },
};

export function getMoveSelectionAsset(move: Move) {
  const slotMap = {
    rock: PRACTICE_ASSET_SLOTS.rockSelection,
    paper: PRACTICE_ASSET_SLOTS.paperSelection,
    scissors: PRACTICE_ASSET_SLOTS.scissorsSelection,
  } as const;
  return slotMap[move];
}

export function getMoveRevealAsset(move: Move) {
  const slotMap = {
    rock: PRACTICE_ASSET_SLOTS.rockReveal,
    paper: PRACTICE_ASSET_SLOTS.paperReveal,
    scissors: PRACTICE_ASSET_SLOTS.scissorsReveal,
  } as const;
  return slotMap[move];
}

export function getDefaultMoveSkinPaths(move: Move) {
  return getDefaultMoveSkin(move).paths;
}

import type { Move } from "@/features/practice/engine/practice-engine";
import { MOVE_EMOJI } from "@/features/practice/engine/practice-engine";

/** Recommended dimensions for future motion-designer deliverables. */
export const PRACTICE_ASSET_SPECS = {
  moveSelection: { width: 96, height: 96, format: "SVG or Lottie JSON" },
  moveReveal: { width: 128, height: 128, format: "SVG or Lottie JSON" },
  playerAvatar: { width: 64, height: 64, format: "SVG" },
  cpuAvatar: { width: 64, height: 64, format: "SVG" },
  vsEffect: { width: 120, height: 48, format: "SVG or Lottie JSON" },
  victoryEffect: { width: 480, height: 240, format: "SVG or Lottie JSON" },
  defeatEffect: { width: 480, height: 240, format: "SVG or Lottie JSON" },
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
    path: "/assets/moves/rock.svg",
    fallback: MOVE_EMOJI.rock,
    label: "Rock selection art",
  },
  paperSelection: {
    path: "/assets/moves/paper.svg",
    fallback: MOVE_EMOJI.paper,
    label: "Paper selection art",
  },
  scissorsSelection: {
    path: "/assets/moves/scissors.svg",
    fallback: MOVE_EMOJI.scissors,
    label: "Scissors selection art",
  },
  rockReveal: {
    path: null,
    fallback: MOVE_EMOJI.rock,
    label: "Rock reveal art",
  },
  paperReveal: {
    path: null,
    fallback: MOVE_EMOJI.paper,
    label: "Paper reveal art",
  },
  scissorsReveal: {
    path: null,
    fallback: MOVE_EMOJI.scissors,
    label: "Scissors reveal art",
  },
  playerAvatar: {
    path: null,
    fallback: "P",
    label: "Player avatar",
  },
  cpuAvatar: {
    path: null,
    fallback: "⬡",
    label: "CPU avatar",
  },
  vsEffect: {
    path: null,
    fallback: "VS",
    label: "Versus impact effect",
  },
  victoryEffect: {
    path: null,
    fallback: "Victory",
    label: "Victory overlay effect",
  },
  defeatEffect: {
    path: null,
    fallback: "Defeat",
    label: "Defeat overlay effect",
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

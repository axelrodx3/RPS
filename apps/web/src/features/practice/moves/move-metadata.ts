import type { Move } from "@/features/practice/engine/practice-engine";

export type MoveMetadata = {
  id: Move;
  label: string;
  shortLabel: string;
  icon: string;
  iconPath: string;
  description: string;
};

export const MOVE_METADATA: Record<Move, MoveMetadata> = {
  rock: {
    id: "rock",
    label: "Rock",
    shortLabel: "Rock",
    icon: "✊",
    iconPath: "/assets/moves/rock.svg",
    description: "Rock crushes scissors.",
  },
  paper: {
    id: "paper",
    label: "Paper",
    shortLabel: "Paper",
    icon: "✋",
    iconPath: "/assets/moves/paper.svg",
    description: "Paper covers rock.",
  },
  scissors: {
    id: "scissors",
    label: "Scissors",
    shortLabel: "Scissors",
    icon: "✌️",
    iconPath: "/assets/moves/scissors.svg",
    description: "Scissors cut paper.",
  },
};

export const MOVE_LIST = Object.values(MOVE_METADATA);

export type SoundCategory = "sfx" | "music";

export type SoundId =
  | "button"
  | "move_hover"
  | "move_selected"
  | "move_locked"
  | "countdown"
  | "countdown_warning"
  | "reveal"
  | "round_tie"
  | "round_win"
  | "round_loss"
  | "match_win"
  | "match_loss"
  | "tutorial"
  | "lobby_filled"
  | "winnings_credited"
  | "withdrawal_confirmed";

export type SoundDefinition = {
  id: SoundId;
  category: SoundCategory;
  label: string;
  /** Temporary generated tone frequencies until file assets are approved. */
  frequencies: number[];
  enabled: boolean;
};

export const SOUND_REGISTRY: Record<SoundId, SoundDefinition> = {
  button: {
    id: "button",
    category: "sfx",
    label: "Button interaction",
    frequencies: [520],
    enabled: true,
  },
  move_hover: {
    id: "move_hover",
    category: "sfx",
    label: "Move hover",
    frequencies: [480],
    enabled: true,
  },
  move_selected: {
    id: "move_selected",
    category: "sfx",
    label: "Move selected",
    frequencies: [560, 620],
    enabled: true,
  },
  move_locked: {
    id: "move_locked",
    category: "sfx",
    label: "Move locked",
    frequencies: [400, 460],
    enabled: true,
  },
  countdown: {
    id: "countdown",
    category: "sfx",
    label: "Countdown tick",
    frequencies: [440, 520],
    enabled: true,
  },
  countdown_warning: {
    id: "countdown_warning",
    category: "sfx",
    label: "Timer warning",
    frequencies: [660, 660, 660],
    enabled: true,
  },
  reveal: {
    id: "reveal",
    category: "sfx",
    label: "Reveal",
    frequencies: [330, 440, 550],
    enabled: true,
  },
  round_tie: {
    id: "round_tie",
    category: "sfx",
    label: "Round tie",
    frequencies: [350, 350],
    enabled: true,
  },
  round_win: {
    id: "round_win",
    category: "sfx",
    label: "Round win",
    frequencies: [440, 660],
    enabled: true,
  },
  round_loss: {
    id: "round_loss",
    category: "sfx",
    label: "Round loss",
    frequencies: [220, 180],
    enabled: true,
  },
  match_win: {
    id: "match_win",
    category: "sfx",
    label: "Match victory",
    frequencies: [440, 554, 659, 880],
    enabled: true,
  },
  match_loss: {
    id: "match_loss",
    category: "sfx",
    label: "Match defeat",
    frequencies: [220, 196, 165],
    enabled: true,
  },
  tutorial: {
    id: "tutorial",
    category: "sfx",
    label: "Tutorial notification",
    frequencies: [500, 600],
    enabled: true,
  },
  lobby_filled: {
    id: "lobby_filled",
    category: "sfx",
    label: "Lobby filled",
    frequencies: [520, 640],
    enabled: false,
  },
  winnings_credited: {
    id: "winnings_credited",
    category: "sfx",
    label: "Winnings credited",
    frequencies: [660, 880],
    enabled: false,
  },
  withdrawal_confirmed: {
    id: "withdrawal_confirmed",
    category: "sfx",
    label: "Withdrawal confirmed",
    frequencies: [440, 520, 620],
    enabled: false,
  },
};

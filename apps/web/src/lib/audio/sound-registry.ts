export type SoundCategory = "sfx" | "music";

export type SoundId =
  | "button"
  | "ui_hover"
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
  | "notification"
  | "lobby_filled"
  | "winnings_credited"
  | "withdrawal_confirmed";

export type SoundDefinition = {
  id: SoundId;
  category: SoundCategory;
  label: string;
  /** Approved custom asset path when available. */
  src?: string;
  /** Temporary generated tone frequencies when no file asset is mapped. */
  frequencies?: number[];
  enabled: boolean;
  volumeScale?: number;
};

export const SOUND_REGISTRY: Record<SoundId, SoundDefinition> = {
  button: {
    id: "button",
    category: "sfx",
    label: "UI click",
    src: "/assets/audio/ui-click.mp3",
    enabled: true,
    volumeScale: 0.85,
  },
  ui_hover: {
    id: "ui_hover",
    category: "sfx",
    label: "UI hover",
    frequencies: [920],
    enabled: true,
    volumeScale: 0.28,
  },
  move_hover: {
    id: "move_hover",
    category: "sfx",
    label: "Move hover",
    enabled: false,
  },
  move_selected: {
    id: "move_selected",
    category: "sfx",
    label: "Move selected",
    enabled: false,
  },
  move_locked: {
    id: "move_locked",
    category: "sfx",
    label: "Move lock confirmation",
    frequencies: [560, 720],
    enabled: true,
    volumeScale: 0.85,
  },
  countdown: {
    id: "countdown",
    category: "sfx",
    label: "Opening countdown tick",
    frequencies: [440, 520],
    enabled: true,
    volumeScale: 0.9,
  },
  countdown_warning: {
    id: "countdown_warning",
    category: "sfx",
    label: "Timer warning",
    src: "/assets/audio/countdown-warning.mp3",
    enabled: true,
    volumeScale: 0.75,
  },
  reveal: {
    id: "reveal",
    category: "sfx",
    label: "Reveal",
    enabled: false,
  },
  round_tie: {
    id: "round_tie",
    category: "sfx",
    label: "Round tie",
    enabled: false,
  },
  round_win: {
    id: "round_win",
    category: "sfx",
    label: "Round win",
    enabled: false,
  },
  round_loss: {
    id: "round_loss",
    category: "sfx",
    label: "Round loss",
    enabled: false,
  },
  match_win: {
    id: "match_win",
    category: "sfx",
    label: "Match victory",
    src: "/assets/audio/match-victory.mp3",
    enabled: true,
    volumeScale: 0.85,
  },
  match_loss: {
    id: "match_loss",
    category: "sfx",
    label: "Match defeat",
    src: "/assets/audio/match-defeat.mp3",
    enabled: true,
    volumeScale: 0.85,
  },
  tutorial: {
    id: "tutorial",
    category: "sfx",
    label: "Tutorial notification",
    src: "/assets/audio/notification.mp3",
    enabled: true,
    volumeScale: 0.7,
  },
  notification: {
    id: "notification",
    category: "sfx",
    label: "Notification",
    src: "/assets/audio/notification.mp3",
    enabled: true,
    volumeScale: 0.7,
  },
  lobby_filled: {
    id: "lobby_filled",
    category: "sfx",
    label: "Lobby filled",
    enabled: false,
  },
  winnings_credited: {
    id: "winnings_credited",
    category: "sfx",
    label: "Winnings credited",
    enabled: false,
  },
  withdrawal_confirmed: {
    id: "withdrawal_confirmed",
    category: "sfx",
    label: "Withdrawal confirmed",
    enabled: false,
  },
};

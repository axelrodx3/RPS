export type SoundCategory = "sfx" | "music";

export type SoundId =
  | "button"
  | "ui_hover"
  | "practice_hover"
  | "move_hover"
  | "move_selected"
  | "move_lock_rock"
  | "move_lock_paper"
  | "move_lock_scissors"
  | "waiting_cpu"
  | "reveal_incoming"
  | "countdown"
  | "countdown_warning"
  | "selection_countdown_tick"
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

export const MOVE_LOCK_SOUND: Record<"rock" | "paper" | "scissors", SoundId> = {
  rock: "move_lock_rock",
  paper: "move_lock_paper",
  scissors: "move_lock_scissors",
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
  practice_hover: {
    id: "practice_hover",
    category: "sfx",
    label: "Practice mode hover",
    src: "/assets/audio/practice-hover.mp3",
    enabled: true,
    volumeScale: 0.55,
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
  move_lock_rock: {
    id: "move_lock_rock",
    category: "sfx",
    label: "Rock lock impact",
    src: "/assets/audio/move-lock-rock.mp3",
    enabled: true,
    volumeScale: 0.72,
  },
  move_lock_paper: {
    id: "move_lock_paper",
    category: "sfx",
    label: "Paper lock tear",
    src: "/assets/audio/move-lock-paper.mp3",
    enabled: true,
    volumeScale: 0.72,
  },
  move_lock_scissors: {
    id: "move_lock_scissors",
    category: "sfx",
    label: "Scissors lock slash",
    src: "/assets/audio/move-lock-scissors.mp3",
    enabled: true,
    volumeScale: 0.72,
  },
  waiting_cpu: {
    id: "waiting_cpu",
    category: "sfx",
    label: "Waiting on CPU pulse",
    frequencies: [420],
    enabled: true,
    volumeScale: 0.32,
  },
  reveal_incoming: {
    id: "reveal_incoming",
    category: "sfx",
    label: "Reveal incoming riser",
    frequencies: [520, 640, 760],
    enabled: true,
    volumeScale: 0.38,
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
    label: "Timer warning (legacy file — disabled in Practice)",
    src: "/assets/audio/countdown-warning.mp3",
    enabled: false,
    volumeScale: 0.75,
  },
  selection_countdown_tick: {
    id: "selection_countdown_tick",
    category: "sfx",
    label: "Selection timer final countdown tick",
    frequencies: [620],
    enabled: true,
    volumeScale: 0.62,
  },
  reveal: {
    id: "reveal",
    category: "sfx",
    label: "Reveal impact",
    src: "/assets/audio/reveal-impact.mp3",
    enabled: true,
    volumeScale: 0.68,
  },
  round_tie: {
    id: "round_tie",
    category: "sfx",
    label: "Round tie",
    src: "/assets/audio/round-tie.mp3",
    enabled: true,
    volumeScale: 0.58,
  },
  round_win: {
    id: "round_win",
    category: "sfx",
    label: "Round win",
    frequencies: [660, 880],
    enabled: true,
    volumeScale: 0.45,
  },
  round_loss: {
    id: "round_loss",
    category: "sfx",
    label: "Round loss",
    frequencies: [420, 360],
    enabled: true,
    volumeScale: 0.42,
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

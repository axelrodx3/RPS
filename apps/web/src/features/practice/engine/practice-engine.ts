export type Move = "rock" | "paper" | "scissors";

export type RoundOutcome = "player" | "cpu" | "tie";

export type PracticePhase =
  | "idle"
  | "countdown"
  | "round_intro"
  | "commit"
  | "move_locked"
  | "waiting_cpu"
  | "reveal_pause"
  | "reveal"
  | "round_result"
  | "match_complete";

export type RoundRecord = {
  round: number;
  playerMove: Move;
  cpuMove: Move;
  outcome: RoundOutcome;
  playerTimedOut: boolean;
  cpuTimedOut: false;
};

export type PracticeMatchState = {
  phase: PracticePhase;
  round: number;
  playerScore: number;
  cpuScore: number;
  countdown: number;
  timerSeconds: number;
  commitStartedAt: number | null;
  playerMove: Move | null;
  cpuMove: Move | null;
  roundOutcome: RoundOutcome | null;
  transitionMessage: string | null;
  history: RoundRecord[];
  matchWinner: "player" | "cpu" | null;
  playerTimedOut: boolean;
  roundResolved: boolean;
};

export const PRACTICE_WIN_TARGET = 2;
export const PRACTICE_TIMER_SECONDS = 20;
export const PRACTICE_COUNTDOWN_SECONDS = 3;
export const TIMER_WARNING_SECONDS = 5;
export const MOVE_LOCKED_MS = 650;
export const MOVE_LOCKED_REDUCED_MS = 500;
export const WAITING_CPU_MS = 1100;
export const WAITING_CPU_REDUCED_MS = 800;
export const REVEAL_PAUSE_MS = 850;
export const REVEAL_PAUSE_REDUCED_MS = 500;
export const REVEAL_DISPLAY_MS = 1000;
export const REVEAL_DISPLAY_REDUCED_MS = 650;
export const ROUND_RESULT_DISPLAY_MS = 1300;
export const ROUND_RESULT_DISPLAY_REDUCED_MS = 950;
export const ROUND_INTRO_MS = 700;
export const ROUND_INTRO_REDUCED_MS = 450;
export const RESULT_VISIBLE_TOTAL_MS =
  REVEAL_DISPLAY_MS + ROUND_RESULT_DISPLAY_MS;

export const PRACTICE_POST_LOCK_PHASES = [
  "move_locked",
  "waiting_cpu",
  "reveal_pause",
  "reveal",
  "round_result",
] as const satisfies readonly PracticePhase[];

export const MOVES: readonly Move[] = ["rock", "paper", "scissors"] as const;

export const MOVE_LABELS: Record<Move, string> = {
  rock: "Rock",
  paper: "Paper",
  scissors: "Scissors",
};

export const MOVE_EMOJI: Record<Move, string> = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️",
};

export function createInitialMatchState(): PracticeMatchState {
  return {
    phase: "idle",
    round: 1,
    playerScore: 0,
    cpuScore: 0,
    countdown: PRACTICE_COUNTDOWN_SECONDS,
    timerSeconds: PRACTICE_TIMER_SECONDS,
    commitStartedAt: null,
    playerMove: null,
    cpuMove: null,
    roundOutcome: null,
    transitionMessage: null,
    history: [],
    matchWinner: null,
    playerTimedOut: false,
    roundResolved: false,
  };
}

export function resolveRound(player: Move, cpu: Move): RoundOutcome {
  if (player === cpu) return "tie";
  if (
    (player === "rock" && cpu === "scissors") ||
    (player === "paper" && cpu === "rock") ||
    (player === "scissors" && cpu === "paper")
  ) {
    return "player";
  }
  return "cpu";
}

export function pickRandomMove(random = Math.random): Move {
  const index = Math.floor(random() * MOVES.length);
  return MOVES[index] ?? "rock";
}

export function randomCpuRevealDelayMs(random = Math.random): number {
  void random;
  return WAITING_CPU_MS;
}

export function isMoveSelectionLocked(phase: PracticePhase): boolean {
  return (
    phase === "move_locked" ||
    phase === "waiting_cpu" ||
    phase === "reveal_pause" ||
    phase === "reveal" ||
    phase === "round_result" ||
    phase === "match_complete"
  );
}

export function getTransitionMessage(state: PracticeMatchState): string {
  if (state.roundOutcome === "tie") {
    return "Tie. Replay round.";
  }
  if (state.playerScore === 1 || state.cpuScore === 1) {
    return "Match point";
  }
  return "Next round";
}

export function formatRoundHistoryAccessibleLabel(record: RoundRecord): string {
  const player = MOVE_LABELS[record.playerMove];
  const cpu = MOVE_LABELS[record.cpuMove];
  const outcome =
    record.outcome === "tie"
      ? "Round tied."
      : record.outcome === "player"
        ? "Player won the round."
        : "CPU won the round.";
  const automatic = record.playerTimedOut ? " Player move was automatic." : "";
  return `Player chose ${player}. CPU chose ${cpu}. ${outcome}${automatic}`;
}

export type PracticeAction =
  | { type: "START_MATCH" }
  | { type: "TICK_COUNTDOWN" }
  | { type: "SYNC_TIMER"; seconds: number }
  | { type: "SELECT_MOVE"; move: Move }
  | { type: "TIMEOUT_PLAYER"; move: Move }
  | { type: "ADVANCE_FROM_MOVE_LOCKED" }
  | { type: "CPU_REVEAL"; move: Move }
  | { type: "ADVANCE_FROM_REVEAL_PAUSE" }
  | { type: "ADVANCE_FROM_REVEAL" }
  | { type: "ADVANCE_FROM_ROUND_RESULT" }
  | { type: "ADVANCE_FROM_ROUND_INTRO" }
  | { type: "REMATCH" }
  | { type: "ABORT" };

export function practiceReducer(
  state: PracticeMatchState,
  action: PracticeAction,
): PracticeMatchState {
  switch (action.type) {
    case "START_MATCH":
      return {
        ...createInitialMatchState(),
        phase: "countdown",
      };

    case "TICK_COUNTDOWN":
      if (state.phase !== "countdown") return state;
      if (state.countdown <= 1) {
        return {
          ...state,
          phase: "round_intro",
          countdown: 0,
        };
      }
      return { ...state, countdown: state.countdown - 1 };

    case "SYNC_TIMER":
      if (state.phase !== "commit" || state.playerMove) return state;
      return { ...state, timerSeconds: action.seconds };

    case "SELECT_MOVE":
      if (state.phase !== "commit" || state.playerMove || state.roundResolved)
        return state;
      return {
        ...state,
        playerMove: action.move,
        phase: "move_locked",
      };

    case "TIMEOUT_PLAYER": {
      if (state.phase !== "commit" || state.playerMove || state.roundResolved)
        return state;
      return {
        ...state,
        playerMove: action.move,
        playerTimedOut: true,
        phase: "move_locked",
      };
    }

    case "ADVANCE_FROM_MOVE_LOCKED":
      if (state.phase !== "move_locked" || !state.playerMove) return state;
      return { ...state, phase: "waiting_cpu" };

    case "CPU_REVEAL": {
      if (
        state.phase !== "waiting_cpu" ||
        !state.playerMove ||
        state.roundResolved
      )
        return state;
      const outcome = resolveRound(state.playerMove, action.move);
      let playerScore = state.playerScore;
      let cpuScore = state.cpuScore;
      if (outcome === "player") playerScore += 1;
      if (outcome === "cpu") cpuScore += 1;

      const record: RoundRecord = {
        round: state.round,
        playerMove: state.playerMove,
        cpuMove: action.move,
        outcome,
        playerTimedOut: state.playerTimedOut,
        cpuTimedOut: false,
      };

      const matchWinner =
        playerScore >= PRACTICE_WIN_TARGET
          ? "player"
          : cpuScore >= PRACTICE_WIN_TARGET
            ? "cpu"
            : null;

      return {
        ...state,
        cpuMove: action.move,
        roundOutcome: outcome,
        playerScore,
        cpuScore,
        history: [...state.history, record],
        phase: "reveal_pause",
        matchWinner,
        roundResolved: true,
      };
    }

    case "ADVANCE_FROM_REVEAL_PAUSE":
      if (state.phase !== "reveal_pause") return state;
      return { ...state, phase: "reveal" };

    case "ADVANCE_FROM_REVEAL":
      if (state.phase !== "reveal") return state;
      if (state.matchWinner) {
        return { ...state, phase: "match_complete" };
      }
      return {
        ...state,
        phase: "round_result",
        transitionMessage: getTransitionMessage({
          ...state,
          phase: "round_result",
        }),
      };

    case "ADVANCE_FROM_ROUND_INTRO":
      if (state.phase !== "round_intro") return state;
      return {
        ...state,
        phase: "commit",
        timerSeconds: PRACTICE_TIMER_SECONDS,
        commitStartedAt: Date.now(),
      };

    case "ADVANCE_FROM_ROUND_RESULT": {
      if (state.phase !== "round_result") return state;
      return {
        ...state,
        phase: "round_intro",
        countdown: 0,
        round: state.roundOutcome === "tie" ? state.round : state.round + 1,
        playerMove: null,
        cpuMove: null,
        roundOutcome: null,
        transitionMessage: null,
        playerTimedOut: false,
        roundResolved: false,
      };
    }

    case "REMATCH":
      return { ...createInitialMatchState(), phase: "countdown" };

    case "ABORT":
      return createInitialMatchState();

    default:
      return state;
  }
}

export function countTiedRounds(history: RoundRecord[]): number {
  return history.filter((round) => round.outcome === "tie").length;
}

export function countAutomaticMoves(history: RoundRecord[]): number {
  return history.filter((round) => round.playerTimedOut).length;
}

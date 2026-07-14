export type Move = "rock" | "paper" | "scissors";

export type RoundOutcome = "player" | "cpu" | "tie";

export type PracticePhase =
  | "idle"
  | "countdown"
  | "commit"
  | "waiting_reveal"
  | "reveal_countdown"
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
  revealCountdown: number;
  playerMove: Move | null;
  cpuMove: Move | null;
  roundOutcome: RoundOutcome | null;
  history: RoundRecord[];
  matchWinner: "player" | "cpu" | null;
  playerTimedOut: boolean;
  roundResolved: boolean;
};

export const PRACTICE_WIN_TARGET = 2;
export const PRACTICE_TIMER_SECONDS = 20;
export const PRACTICE_COUNTDOWN_SECONDS = 3;
export const PRACTICE_REVEAL_COUNTDOWN_SECONDS = 2;
export const TIMER_WARNING_SECONDS = 5;
export const CPU_REVEAL_DELAY_MIN_MS = 500;
export const CPU_REVEAL_DELAY_MAX_MS = 1200;

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
    revealCountdown: PRACTICE_REVEAL_COUNTDOWN_SECONDS,
    playerMove: null,
    cpuMove: null,
    roundOutcome: null,
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
  const range = CPU_REVEAL_DELAY_MAX_MS - CPU_REVEAL_DELAY_MIN_MS;
  return CPU_REVEAL_DELAY_MIN_MS + Math.floor(random() * (range + 1));
}

export function isMoveSelectionLocked(phase: PracticePhase): boolean {
  return (
    phase === "waiting_reveal" ||
    phase === "reveal_countdown" ||
    phase === "reveal" ||
    phase === "round_result" ||
    phase === "match_complete"
  );
}

export type PracticeAction =
  | { type: "START_MATCH" }
  | { type: "TICK_COUNTDOWN" }
  | { type: "SYNC_TIMER"; seconds: number }
  | { type: "SELECT_MOVE"; move: Move }
  | { type: "TIMEOUT_PLAYER"; move: Move }
  | { type: "CPU_READY" }
  | { type: "TICK_REVEAL_COUNTDOWN" }
  | { type: "CPU_REVEAL"; move: Move }
  | { type: "ADVANCE_FROM_REVEAL" }
  | { type: "ADVANCE_FROM_ROUND_RESULT" }
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
          phase: "commit",
          countdown: 0,
          timerSeconds: PRACTICE_TIMER_SECONDS,
          commitStartedAt: Date.now(),
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
        phase: "waiting_reveal",
      };

    case "TIMEOUT_PLAYER": {
      if (state.phase !== "commit" || state.playerMove || state.roundResolved)
        return state;
      return {
        ...state,
        playerMove: action.move,
        playerTimedOut: true,
        phase: "waiting_reveal",
      };
    }

    case "CPU_READY":
      if (state.phase !== "waiting_reveal" || !state.playerMove) return state;
      return {
        ...state,
        phase: "reveal_countdown",
        revealCountdown: PRACTICE_REVEAL_COUNTDOWN_SECONDS,
      };

    case "TICK_REVEAL_COUNTDOWN":
      if (state.phase !== "reveal_countdown") return state;
      if (state.revealCountdown <= 1) {
        return { ...state, revealCountdown: 0 };
      }
      return { ...state, revealCountdown: state.revealCountdown - 1 };

    case "CPU_REVEAL": {
      if (
        state.phase !== "reveal_countdown" ||
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
        phase: "reveal",
        matchWinner,
        roundResolved: true,
      };
    }

    case "ADVANCE_FROM_REVEAL":
      if (state.phase !== "reveal") return state;
      if (state.matchWinner) {
        return { ...state, phase: "match_complete" };
      }
      return { ...state, phase: "round_result" };

    case "ADVANCE_FROM_ROUND_RESULT": {
      if (state.phase !== "round_result") return state;
      return {
        ...state,
        phase: "countdown",
        round: state.roundOutcome === "tie" ? state.round : state.round + 1,
        countdown: PRACTICE_COUNTDOWN_SECONDS,
        timerSeconds: PRACTICE_TIMER_SECONDS,
        commitStartedAt: null,
        playerMove: null,
        cpuMove: null,
        roundOutcome: null,
        playerTimedOut: false,
        roundResolved: false,
        revealCountdown: PRACTICE_REVEAL_COUNTDOWN_SECONDS,
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

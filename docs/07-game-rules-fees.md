# Versioned Game Rules and Fees

## Status

This document proposes canonical human-readable rules for `RPS_RULES_V1`.
Implementation remains blocked from real-SOL use until the automatic fallback
and selective non-reveal design passes the gates in
[Fairness, Sessions, and Randomness](09-fairness-sessions-randomness.md).

Every funded match stores the complete operative snapshot: mode, rule version,
timer, warning threshold, lives, teams/seats, wager per player, player count,
fee bps, fee rounding, payout formula, automatic fallback version, excessive-tie
policy, and spectator setting. Global changes never alter a funded match.

## Common rules

| Move     | Beats    | Loses to | Encoding |
| -------- | -------- | -------- | -------- |
| Rock     | Scissors | Paper    | `0`      |
| Paper    | Rock     | Scissors | `1`      |
| Scissors | Paper    | Rock     | `2`      |

- Every active player chooses privately during the same round.
- Commitments bind the canonical match, rules, round, wallet, seat, move, and a
  32-byte cryptographically secure salt.
- Moves become visible only when the approved protocol permits revelation.
- A player cannot change a commitment.
- A missing move at the snapshotted deadline receives a verifiably random
  automatic Rock, Paper, or Scissors move. The backend cannot choose it.
- Browser closure or wallet disconnection does not cancel a funded match.
- Practice uses the same visible scoring rules but no wallet, on-chain balance,
  fee, payout, or wager statistics.

## Timers and timeouts

| Phase                  |                   Initial v1 value |                         Warning | Deadline behavior                                                                                | Funds                                  |
| ---------------------- | ---------------------------------: | ------------------------------: | ------------------------------------------------------------------------------------------------ | -------------------------------------- |
| Full-lobby ready check |                         30 seconds |                       5 seconds | Missing/ineligible player is removed; lobby reopens                                              | None locked                            |
| Atomic match funding   |  Short transaction validity window |           Status, not countdown | Entire start succeeds or all player balances remain unchanged                                    | All or none                            |
| Move commitment        |                         20 seconds |                       5 seconds | Missing seat enters automatic-move path                                                          | Pot remains locked                     |
| Reveal/recovery        | Mechanism-specific and snapshotted | 5 seconds where user-actionable | Approved forced/timed reveal or fallback resolves; plain selective reveal is not production-safe | Pot remains locked                     |
| Reveal animation       |        Recommended 1.5–2.5 seconds |                            None | Next round begins automatically                                                                  | None                                   |
| Settlement             |                  No claim deadline |          Delayed-status warning | Permissionless deterministic retry until credited                                                | Pot remains locked until atomic credit |
| Withdrawal             |       No expiry on available funds |          Pending-status warning | Owner may retry only after reconciliation                                                        | Locked funds excluded                  |

Deadlines use the Solana Clock sysvar and a single documented boundary
comparison. UI countdowns are estimates and cannot extend a deadline.

## Fee specification

- Default fee: `200` basis points (2% of total pot).
- Hard program cap: `500` basis points (5%).
- Fee bps and formula are copied into the funded match.
- Fee changes affect future matches only and require authorized governance;
  production uses multisignature approval.
- No floating-point arithmetic is used.

```text
total_pot = checked_mul(wager_per_player_lamports, player_count)
fee_numerator = checked_mul(total_pot as u128, fee_bps as u128)
house_fee = floor(fee_numerator / 10_000)
net_payout = checked_sub(total_pot, house_fee)
```

Floor rounding favors the payout side for very small pots. The minimum wager
must be configured so the disclosed economics and network costs are sensible.
The invariant is exact:

```text
house_fee + sum(winner_balance_credits) == total_pot
```

For a 2v2 payout:

```text
base_teammate_credit = floor(net_payout / 2)
remainder = net_payout - (base_teammate_credit * 2)
```

V1 assigns a possible one-lamport remainder to the winning team's lower seat
number. This rule is snapshotted and independent of account ordering.

### Required financial preview

Before Ready, show:

- wager per player;
- player count and total pot;
- snapshotted fee bps and exact fee;
- exact net winning payout;
- for 2v2, exact payout per teammate including deterministic remainder;
- current available RPS balance; and
- network fee estimate separately from the wager and house fee.

Example: four players wager `0.50 SOL` each. Total pot is `2 SOL`; a 2% fee is
`0.04 SOL`; the winning team receives `1.96 SOL`; each teammate is credited
`0.98 SOL`.

## 1v1

### Win condition

- Two players with equal wager per player.
- Both choose privately.
- Identical moves are a tie and award no point.
- The winner of a non-tied round receives one point.
- The first player to win **two non-tied rounds** wins the match.
- The winner's RPS balance receives total pot minus the snapshotted fee.

### Examples

| Score before | Player A | Player B | Result       | Score after |
| ------------ | -------- | -------- | ------------ | ----------- |
| `0–0`        | Rock     | Scissors | A wins       | `1–0`       |
| `1–0`        | Paper    | Paper    | Tie          | `1–0`       |
| `1–1`        | Scissors | Paper    | A wins match | `2–1`       |
| `1–0`        | Rock     | Paper    | B wins       | `1–1`       |

Automatic moves are evaluated exactly like chosen moves and are marked in
history and verification records.

## 2v2

### Seats and privacy

- Four players form two fixed teams before atomic funding.
- Team A Player 1 (seat A1) faces Team B Player 1 (seat B1).
- Team A Player 2 (seat A2) faces Team B Player 2 (seat B2).
- All four choose privately and simultaneously.
- Teammates cannot see one another's move before protocol-authorized reveal.
- Teams and seats cannot change after funding.

### Round scoring

Only the two fixed paired matchups are compared:

| Matchup 1  | Matchup 2  | Round result      |
| ---------- | ---------- | ----------------- |
| Team A win | Team A win | Team A wins round |
| Team B win | Team B win | Team B wins round |
| Team A win | Team B win | Tie               |
| Team B win | Team A win | Tie               |
| Tie        | Team A win | Team A wins round |
| Team A win | Tie        | Team A wins round |
| Tie        | Team B win | Team B wins round |
| Team B win | Tie        | Team B wins round |
| Tie        | Tie        | Tie               |

The first team to win **two rounds** wins the match. Tied rounds award no team
point.

### Scoring examples

1. A1 Rock beats B1 Scissors; A2 Paper beats B2 Rock: Team A wins both, so Team
   A wins the round.
2. A1 Rock beats B1 Scissors; A2 Rock loses to B2 Paper: one win each, so the
   round is tied.
3. A1 Paper ties B1 Paper; A2 Scissors beats B2 Paper: Team A wins the round.
4. A1 Rock ties B1 Rock; A2 Paper ties B2 Paper: the round is tied.

### Payout

The net pot is split equally between the two winning teammates as independent,
one-time `PlayerBalance.available` credits. No post-match claim transaction is
required. A “Collect Winnings” button only acknowledges those credits.

## 1v1v1v1

### Lives and elimination

- Four individual players each begin with **two lives**.
- Everyone chooses simultaneously and privately.
- Eliminated users remain on the match page as spectators.
- The last remaining player wins the entire net pot; the final pot is never
  split.

### Round resolution

1. If all active players choose the same move, nobody loses a life.
2. If Rock, Paper, and Scissors all appear, nobody loses a life.
3. If exactly two move types appear, every active player holding the losing move
   loses one life.
4. A player at zero lives is eliminated after all losses for that round apply.
5. If one player remains, that player wins.
6. If all remaining finalists would reach zero simultaneously, restore those
   finalists to their pre-round lives and enter sudden-death replay. No
   eliminated outsider returns.

### Required examples

| Active moves                                                                                                               | Resolution                                               |
| -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Rock, Rock, Scissors, Scissors                                                                                             | Both Scissors players lose one life                      |
| Rock, Paper, Scissors, Rock                                                                                                | All three move types appear; no life lost                |
| Paper, Paper, Paper, Paper                                                                                                 | All same; no life lost                                   |
| One Rock and three Scissors — Rock, Scissors, Scissors, Scissors                                                           | All three Scissors players lose one life                 |
| Two Paper and two Rock — Paper, Paper, Rock, Rock                                                                          | Both Rock players lose one life                          |
| Two one-life finalists choose Paper and Rock                                                                               | Rock finalist would be eliminated; Paper finalist wins   |
| Simultaneous finalist elimination — all one-life finalists receive losing outcomes under a multi-seat resolution edge case | Restore pre-round finalist lives and replay sudden death |
| Automatic move causing elimination — an automatic Rock faces a chosen Scissors in the only two-type set                    | Scissors loses a life; history marks Rock as automatic   |
| Consecutive tie rounds — repeated all-same or all-three-type rounds                                                        | No lives change; non-elimination counter increases       |

In ordinary cyclic RPS with exactly two finalist move types, at least one move
type wins, so simultaneous elimination should be unreachable. The explicit
replay rule is still stored and tested to protect future rule versions,
multi-seat edge cases, and fallback integration mistakes.

### Excessive non-elimination safety

RPS can tie indefinitely. V1 snapshots:

- `max_consecutive_non_elimination_rounds = 20`;
- a **sudden-death phase** after the cap;
- unchanged private move selection and automatic-move rules during sudden death;
- `max_sudden_death_non_elimination_rounds = 10`; and
- a terminal verifiable-random survivor draw among active players if both caps
  are exhausted.

The survivor draw uses the funded match's approved verifiable-randomness method,
binds match/rules/round/active-seat bitmap, selects exactly one active seat
without modulo bias, and is independently verifiable. No backend or
administrator can select or reroll the winner. Oracle timeout/retry behavior is
snapshotted and permissionless. This terminal draw is a last-resort liveness
rule, not an implementation shortcut; real-SOL remains disabled until its
provider assumptions and the broader reveal/fallback protocol are reviewed.

## Automatic move rules

The selected production design must:

- fix the randomness request before it can be chosen based on other moves;
- derive `move = unbiased(randomness, match, rules, round, seat)`;
- reject request, proof, match, round, or seat replay;
- remain callable after browser closure without the wallet private key;
- grant no withdrawal, transfer, fee, destination, or arbitrary-program power;
- expose the proof and derived move in completed match verification; and
- have a rules-snapshotted retry path that cannot reroll an unfavorable output.

Switchboard and ORAO are candidates, not endorsements. VRF alone does not solve
selective non-reveal after a player has committed; see the fairness safety gate.

## Match completion and credits

1. The program verifies the terminal rule outcome.
2. It computes the fee from the match snapshot.
3. It debits all locked player liabilities exactly once.
4. It credits the winner, or both winning teammates, directly to available RPS
   balances.
5. It accrues the exact house fee to treasury accounting.
6. It writes an immutable settlement receipt.
7. The UI may offer **Collect Winnings** as an acknowledgement only.

Completed match history records every revealed move, automatic-move marker,
round calculation, score/lives transition, settlement transaction, and balance
credit.

## Rules test obligations

- all nine 1v1 move pairs and tied-round score behavior;
- early completion at two non-tied wins;
- all nine paired 2v2 scoring combinations;
- every required 1v1v1v1 pattern above;
- life-loss/elimination ordering and last-player payout;
- simultaneous-finalist replay;
- automatic-move elimination;
- both non-elimination caps and unbiased survivor selection;
- 200 bps fee, 500 bps cap, very-small-pot rounding, and 2v2 remainder;
- immutable existing-match behavior after global configuration changes; and
- conservation: fee plus credits equals funded pot exactly.

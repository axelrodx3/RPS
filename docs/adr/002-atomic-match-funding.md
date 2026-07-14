# ADR 002: Atomic Match Funding

## Status

Proposed

## Context

A wager match must not become funded through ambiguous, stale, or unilateral
intent. Multi-step funding creates intermediate states in which one player has
committed funds while the other has not, increasing cancellation, timeout, and
griefing complexity.

General wallet approval to use platform funds is not sufficient evidence that a
player accepts a particular opponent, game version, wager, and rule set. Consent
must be bound to one match proposal.

## Decision

Require match-specific ready consent from every participant, then fund the match
with one atomic program instruction.

Each ready approval is bound to immutable match terms, including match/program/
network identifiers, complete participant roster, the player's seat/team, game
module and rules hash, exact wager per player, fee bps/treasury, timer/fallback/
payout snapshot, spectator policy, and expiry/proposal generation. Changing any
bound term invalidates prior readiness. Joining or readying a waiting lobby does
not reserve or debit balance.

The atomic fund instruction:

- verifies all required ready approvals and their freshness;
- verifies participant identities and exact terms;
- debits each player's available internal balance;
- credits the match's reserved balance;
- transitions the match from ready to funded exactly once; and
- fails the entire instruction if any check or debit fails.

Readiness is consent to fund only the identified match. It is not reusable
approval for another match or a withdrawal.

## Alternatives

- **Sequential participant funding:** simpler individual transactions, but
  creates partially funded states and refund paths.
- **Platform-funded escrow followed by collection:** smoother UX, but exposes
  the platform to credit and collection risk.
- **Broad standing wager allowance:** fewer signatures, but weakens informed,
  match-specific consent.
- **Single transaction containing separate fund instructions:** potentially
  atomic at the transaction level, but increases instruction-order and
  composability assumptions; one program instruction provides a narrower
  invariant boundary.

## Threat analysis

- A stale ready approval could be replayed after terms, opponent, or wager
  changes.
- A match identifier collision or weak domain separation could authorize a
  different match.
- One participant could race a withdrawal or another reservation before funding.
- Duplicate funding could reserve balances twice.
- Front-running could substitute accounts or alter unbound terms.
- A coordinator could falsely represent readiness unless readiness is
  wallet-authenticated and verified by the program.
- Expiry based on uncertain wall-clock assumptions could behave differently near
  slot/time boundaries.

Atomicity avoids partial program state for this operation, but it does not
eliminate wallet compromise, transaction censorship, or all liveness failures.

## Consequences

- Partially funded matches are excluded from the state model.
- The final participant or coordinator can submit funding once all consents
  exist.
- Any term change requires participants to approve the revised proposal.
- Transaction construction and signature collection become more structured.
- Failed funding leaves balances unchanged, though users may still need to renew
  expired readiness.

## Validation gates

- Tests prove funding either performs all debits, reservation, and transition or
  performs none.
- Negative tests cover missing, stale, duplicated, mismatched, and wrong-wallet
  ready approvals.
- Tests prove changing every individually bound term invalidates existing
  readiness.
- Concurrent funding, withdrawal, and reservation attempts cannot overspend a
  wallet balance.
- The same match cannot be funded more than once under retries or duplicate
  transactions.
- Program and client fixtures agree on the exact ready-consent payload and
  domain separator.
- Load tests measure contention and failure behavior for simultaneous match
  funding.
- Independent review confirms account constraints, replay protection, and
  state-transition completeness.

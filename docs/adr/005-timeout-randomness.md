# ADR 005: Timeout Randomness

## Status

Proposed; real-SOL use is gated

## Context

Commit-reveal games need deterministic handling when a participant does not
reveal. A timeout winner rule discourages non-reveal but can still create
strategic option value if a player learns information before deciding whether to
reveal. Randomness is sometimes proposed to resolve missing reveals, yet the
source and release mechanism matter as much as randomness quality.

The design space includes a verifiable random function (VRF), deterministic
fallback rules, participant or operator reveals, and delayed or threshold-based
secret release. None should be assumed safe for real-value wagering without
analyzing who can observe what and who can withhold which input.

## Decision

Do not select a production timeout-randomness mechanism yet. Gate real-SOL
wagering on a dedicated spike that evaluates timelock and threshold reveal
designs, including their liveness, trust, cost, and integration constraints.

The spike must compare at least:

- **VRF:** publicly verifiable random output once delivered, with oracle
  availability, request timing, callback, cost, and censorship assumptions.
- **Deterministic fallback:** timeout loss, cancellation, refund, or
  deterministic move substitution, including griefing and strategic-abort
  incentives.
- **Participant/operator reveal:** encrypted moves or secrets released by a
  party, including custody, collusion, withholding, and availability.
- **Timelock or threshold reveal:** information that becomes recoverable after a
  deadline without granting one actor unilateral withholding power, including
  practical chain support and failure thresholds.

A VRF alone is not considered sufficient. It can choose a fallback outcome, but
a participant who knows whether revealing or accepting the VRF-mediated fallback
is preferable may retain selective non-reveal option value. Verifiable
randomness does not itself force release of the participant's committed
information.

Until a mechanism passes the gates below, deployments must use valueless play or
an explicitly non-wagering mode. Any temporary test mechanism must be labeled
experimental and must not be represented as economically fair.

## Alternatives

- **Immediate timeout loss:** simple and deterministic; may strongly penalize
  network or client failures and can still create griefing strategies.
- **Timeout refund:** limits direct loss; may make unfavorable games costlessly
  abortable.
- **VRF-selected fallback move/outcome:** verifiable randomness, but does not by
  itself remove selective non-reveal option value.
- **Trusted platform reveal:** straightforward, but centralizes fairness and
  availability in one operator.
- **Two-party reveal only:** minimal infrastructure, but one party can withhold.
- **Timelock encryption or threshold decryption:** may reduce unilateral
  withholding, but feasibility, latency, key management, and chain integration
  are not yet established.

## Threat analysis

- A player may reveal only when reveal produces a better expected outcome than
  timeout handling.
- An oracle, operator, committee, or participant may delay, censor, bias, or
  withhold required material.
- Parties may collude or adapt behavior after observing transactions, reveals,
  or randomness requests.
- Chain reordering, congestion, clock/slot variance, and finality assumptions
  may affect deadlines.
- A fallback rule may create asymmetric expected value across player positions.
- Threshold members may be unavailable, compromised, or economically
  incentivized to collude.
- Timelock assumptions may fail under implementation errors or unexpected
  computation capabilities.
- Complex recovery logic may introduce funds-locking or double-settlement
  defects.

No candidate is presumed to provide fairness merely because its output is
cryptographically verifiable.

## Consequences

- Real-SOL launch is delayed until timeout fairness and liveness have stronger
  evidence.
- The team must budget a focused protocol and prototype investigation.
- Valueless gameplay can proceed with clearly disclosed experimental timeout
  behavior.
- Match state should avoid hard-coding a candidate mechanism before selection.
- A selected design may add latency, oracle/committee dependencies, fees, or
  operational burden.

## Validation gates

- The spike models player information and expected value at every
  reveal/withhold decision point for each candidate.
- Simulations quantify strategic abort advantage under realistic latency,
  failure, and adversarial timing assumptions.
- A prototype demonstrates the preferred timelock or threshold path on the
  target chain or documents why it is impractical.
- The design identifies trust, liveness, censorship, collusion, finality,
  deadline, and recovery assumptions explicitly.
- Tests cover missing oracle callbacks, unavailable threshold members, late
  reveals, duplicate resolution, reordering, and prolonged congestion.
- Settlement remains single-use and funds cannot become permanently stranded
  under documented recovery conditions.
- Independent cryptographic and economic review finds no unresolved
  high-severity issue.
- Real-SOL wagering remains disabled until the selected mechanism, caps,
  disclosures, and incident procedures receive explicit approval after the
  spike.

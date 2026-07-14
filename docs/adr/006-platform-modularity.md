# ADR 006: Platform Modularity

## Status

Proposed

## Context

The platform may host multiple games and revisions while reusing identity,
sessions, balances, match coordination, settlement, fees, and observability.
Combining all behavior in one evolving module would make shared financial
invariants depend on game-specific changes and could make old matches ambiguous
after rule upgrades.

Complete isolation per game would reduce coupling but duplicate sensitive
custody and authorization logic. The architecture needs a stable shared boundary
without implying that every future game can fit one interface unchanged.

## Decision

Isolate shared platform services from explicitly versioned game modules.

Shared platform services own cross-game capabilities and invariants, including:

- wallet identity and scoped session authorization;
- pooled balance accounting, treasury accounting, and withdrawals;
- match lifecycle primitives and atomic wager reservation;
- settlement authorization and fee application;
- common event, audit, and operational interfaces.

Game modules own versioned game-specific behavior, including:

- legal actions and state transitions;
- commitment schemas and reveal validation where applicable;
- game result computation;
- game-specific timeout inputs, subject to platform safety policy; and
- rule metadata presented to participants.

Every match binds an immutable game module identifier, rules version, and any
required rules/configuration hash before readiness. A module cannot directly
withdraw, arbitrarily transfer, mutate another game's state, or bypass platform
accounting. It returns constrained state-transition or outcome data that shared
services validate before settlement.

Interfaces between services and modules are narrow, capability-based, and
versioned. Existing matches continue under their bound version unless a
separately approved recovery process is required.

## Alternatives

- **Single monolithic program/module:** simpler initial deployment, but game
  changes increase the blast radius of shared financial logic.
- **Fully independent stack per game:** strong isolation, but duplicates
  custody, sessions, fees, and operations.
- **Unversioned plugin interface:** flexible initially, but cannot reliably
  preserve historical match semantics.
- **Off-chain game engines with on-chain settlement attestations:** supports
  complex games, but introduces attester trust and dispute requirements.

## Threat analysis

- A malicious or defective game module could forge a winner or malformed
  outcome.
- A broad module interface could expose balance mutation or arbitrary CPI
  capability.
- Version confusion could cause clients and the program to apply different
  rules.
- Shared-service upgrades could unintentionally change old module semantics.
- Cross-game identifiers or accounts could be substituted without domain
  separation.
- Denial of service in one module could consume shared resources.
- A module deemed safe for valueless play might be incorrectly enabled for
  wagers.
- Governance could approve incompatible or unaudited module versions.

Module boundaries reduce coupling but do not prove game correctness or contain
every runtime-level failure.

## Consequences

- Shared security-sensitive code can be reviewed and reused across games.
- Game rules can evolve through new versions without silently rewriting active
  matches.
- Interfaces and compatibility policy require deliberate governance.
- Some game designs may not fit the initial module contract and may require a
  reviewed interface extension.
- Testing must cover both modules independently and their integration with
  shared settlement.
- Deployment and observability must identify module and rules versions
  consistently.

## Validation gates

- Architecture tests prove game modules cannot invoke withdrawal, arbitrary
  transfer, treasury mutation, or cross-game state mutation.
- Every match and consent payload binds module identifier, rules version, and
  configuration hash.
- Compatibility tests preserve behavior for active matches across shared-service
  and client upgrades.
- Contract tests exercise valid and malformed module outputs at the shared
  settlement boundary.
- Resource limits and failure isolation are tested with adversarial or
  non-terminating module behavior where the runtime permits.
- Each wager-enabled module receives game-logic, authorization, and economic
  review for its exact version.
- Deployment policy distinguishes valueless, capped-wager, and approved-wager
  module versions.
- Recovery and deprecation procedures are documented and tested before any
  module version handles real SOL.

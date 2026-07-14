# RPS Architecture Documentation

This is the Prompt 1 source of truth for the proposed RPS Solana platform.
Mainnet, real SOL, deposits, withdrawals, wagering, and program deployment are
not enabled. No document claims risk-free operation.

## Reading order

1. [Current State](00-current-state.md)
2. [Product Requirements](01-product-requirements.md)
3. [System Architecture](02-system-architecture.md)
4. [Repository and Environments](03-repository-environments.md)
5. [On-Chain Program](04-on-chain-program.md)
6. [Backend, Database, and Indexing](05-backend-database-indexing.md)
7. [Frontend and Design System](06-frontend-design-system.md)
8. [Game Rules and Fees](07-game-rules-fees.md)
9. [State Machines](08-state-machines.md)
10. [Fairness, Sessions, and Randomness](09-fairness-sessions-randomness.md)
11. [Security Threat Model](10-security-threat-model.md)
12. [Reliability and Operations](11-reliability-operations.md)
13. [Testing and Audit Readiness](12-testing-audit-readiness.md)
14. [Roadmap, Decisions, and Limitations](13-roadmap-decisions-limitations.md)

## Architecture decisions

- [ADR 001 — Program-Accounted SOL Balances](adr/001-program-accounted-sol-balances.md)
- [ADR 002 — Atomic Match Funding](adr/002-atomic-match-funding.md)
- [ADR 003 — Scoped Gameplay Sessions](adr/003-scoped-gameplay-sessions.md)
- [ADR 004 — Commit-Reveal Encoding](adr/004-commit-reveal-encoding.md)
- [ADR 005 — Timeout Randomness](adr/005-timeout-randomness.md)
- [ADR 006 — Platform Modularity](adr/006-platform-modularity.md)

ADRs are proposed until their validation gates pass. ADR 005 deliberately leaves
the production reveal/fallback mechanism unresolved and blocks real-SOL play.

## Authority order

When documents conflict:

1. Explicit safety gates and real-SOL/mainnet prohibitions win.
2. Product requirements and normative game/state-machine documents define
   expected behavior.
3. Accepted ADRs define consequential architecture choices.
4. The on-chain program specification defines financial authority.
5. Backend/frontend documents describe non-authoritative implementation.

## Glossary

- **RPS balance:** Program-accounted SOL attributed to an owner.
- **Available:** Owner funds not locked and eligible for withdrawal/funding.
- **Locked:** Funds atomically committed to an active match.
- **Ready consent:** Expiring match/terms/seat-specific permission; it does not
  itself debit funds.
- **Atomic funding:** One program instruction locks all required wagers or none.
- **Commitment:** Canonical hash binding context, move, and secure salt.
- **Automatic move:** Verifiably random timeout move derived without backend
  discretion.
- **Balance credit:** Program settlement increase to winner available balance;
  no separate claim transaction.
- **Projection:** Rebuildable off-chain view that cannot override chain truth.
- **Practice:** Free, off-chain, wallet-optional play with no wager statistics.

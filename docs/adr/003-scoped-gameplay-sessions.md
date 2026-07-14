# ADR 003: Scoped Gameplay Sessions

## Status

Proposed

## Context

Requiring a wallet interaction for every gameplay action creates poor latency
and repeated signing prompts. A temporary key can improve playability, but an
unconstrained delegated key would turn a browser or device compromise into
custody compromise.

Session authorization therefore needs to be explicit, narrow, inspectable,
revocable where practical, and enforced by the on-chain program rather than
trusted to client behavior.

## Decision

Support wallet-approved ephemeral Ed25519 session keys scoped by an on-chain
authorization record.

The wallet creates or approves a session record that binds:

- the wallet and ephemeral Ed25519 public key;
- allowed gameplay action types;
- applicable game or match scope;
- an absolute expiry enforced using an agreed on-chain time source;
- a maximum wager or cumulative value limit; and
- a nonce or generation that prevents reuse after replacement or revocation.

Every session-signed action must verify the session signature and all on-chain
constraints. Sessions may submit only enumerated gameplay actions. They cannot
withdraw funds, perform arbitrary transfers, change payout destinations, expand
their own scope, create another session, or exercise administrative authority.

Session keys should be short-lived and held only as long as necessary. Client
storage details are not standardized by this ADR and require separate threat
review.

## Alternatives

- **Wallet signs every action:** strongest direct user involvement, but likely
  unacceptable interaction latency.
- **Server-authorized sessions:** operationally convenient, but adds a trusted
  signer and central compromise target.
- **Unscoped delegated keys:** simple, but exposes funds and authority beyond
  gameplay needs.
- **Pre-signed action bundles:** narrow authority, but difficult for interactive
  and branching gameplay.

## Threat analysis

- Browser malware or XSS could steal a session key and act until expiry or
  revocation.
- Weak action encoding could let a valid signature authorize a different
  instruction.
- Missing nonce or generation checks could permit replay across sessions or
  matches.
- A permissive action enum or CPI path could indirectly enable transfer or
  withdrawal.
- Incorrect expiry semantics could extend authority beyond the wallet's
  expectation.
- Value limits could be bypassed through concurrency, repeated actions, or
  ambiguous units.
- Wallet UI could misrepresent the scope being approved.
- Revocation transactions can be delayed or censored and should not be treated
  as instantaneous protection.

Scoping limits expected damage; it does not make compromised client environments
safe.

## Consequences

- Routine gameplay can avoid repeated wallet prompts.
- The program and wallet UI must share a precise authorization schema.
- All future gameplay actions must be classified explicitly as session-allowed
  or wallet-only.
- On-chain session records add storage and lifecycle operations.
- Short expiries and low limits may add renewal friction, while broad values
  increase exposure.

## Validation gates

- Negative tests prove session keys cannot invoke withdrawal, arbitrary
  transfer, payout-address change, session creation, or administration.
- Tests cover every allowed action and reject unrecognized action discriminants.
- Expired, revoked, wrong-wallet, wrong-match, and over-limit sessions always
  fail.
- Replay and concurrent-action tests prove nonce and cumulative-limit
  enforcement.
- Cross-language fixtures verify the signed session authorization and action
  payloads byte for byte.
- Wallet approval UI displays key scope, actions, expiry, match/game scope, and
  value limit before signing.
- Client-side key handling receives a focused threat review covering XSS,
  persistence, logs, backups, and crash recovery.
- Rollout starts with short expiries and low wager caps until telemetry and
  review support broader limits.

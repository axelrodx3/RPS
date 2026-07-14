# Roadmap, Decisions, and Limitations

## Product direction

The currently approved path is a practice-first product followed by a separately
gated, non-custodial Solana sandbox using only allowlisted non-mainnet test
assets. The proposed on-chain program owns match lifecycle and fund movement;
the client, RPC providers, WebSocket subscriptions, and indexer provide access
and derived views. Scope should remain narrow until financial invariants,
timeout behavior, recovery, and operational controls are independently verified.

An audited mainnet beta is included below only as a conditional future phase so
its prerequisites are explicit. It is not approved by this documentation. In
particular, plain commit/reveal has a profitable selective non-reveal risk and
cannot support real-value play until a timed-reveal, threshold-reveal, or
equivalent protocol passes cryptographic, game-theoretic, liveness, and on-chain
verification review. No phase may accept real value merely because the UI is
complete or a feature flag exists.

## Phased roadmap

### Phase 0 — Specification and risk closure

Deliverables:

- freeze terminology, supported network/assets, wager units, fees, lifecycle,
  commit/reveal rules, deadlines, timeout outcomes, draw handling, refunds,
  withdrawals, and account closure;
- define accounts, PDAs, authorities, state transitions, instruction
  preconditions, and fund flows;
- document financial invariants, threat model, trust boundaries, abuse cases,
  privacy model, incident modes, and regulatory assumptions;
- prototype commitment/domain separation and clock-boundary behavior without
  accepting value;
- decide secret storage/recovery and clearly define the loss mode when a reveal
  secret is unavailable;
- establish dependency acceptance criteria and supported wallet/browser/device
  matrix.

Exit gate: all open decisions marked “required before implementation” are
approved; every terminal branch conserves funds on paper; independent reviewers
can derive the same result from the specification.

### Phase 1 — Practice and identity foundation

Deliverables:

- establish the repository, CI, environment isolation, typed shared rules, and
  accessible design-system foundation;
- deliver anonymous unlimited local-CPU practice without any wallet request;
- support the product's first-to-two 1v1 practice rules, ties, automatic local
  moves, reconnect/reset, rematches, and human-readable results;
- add keyboard, screen-reader, reduced-motion, audio, responsive, and
  supported-browser coverage;
- add wallet connection and domain-bound signed-message authentication as a
  distinct optional identity layer;
- add optional wallet profiles, username safeguards, built-in avatars, privacy,
  moderation basics, and mode-separated telemetry; do not add public chat;
- enforce deny-by-default mainnet/wager routes even when client flags or
  configuration are manipulated.

Exit gate: Practice MVP and authenticated social beta acceptance criteria pass;
practice remains available when wallet, Solana, ledger, and wager services fail;
no practice path can create a reservation, ledger entry, or chain transaction.

### Phase 2 — Program foundation on local validator

Deliverables:

- implement versioned program accounts and the smallest complete lifecycle;
- implement exact integer accounting, checked arithmetic, signer/account
  constraints, immutable match terms, and terminal-state replay protection;
- add pooled-vault deposits, owner withdrawals, match-specific ready consent,
  one atomic `fund_match`, commit/reveal/fallback interfaces,
  settle/refund/balance-credit, and safe account-close behavior;
- establish Rust unit, Anchor integration, property, fuzz, and invariant tests;
- establish reproducible builds, IDL generation, and authority/configuration
  controls.

Exit gate: all program-level balance, lobby, gameplay, and invariant tests pass;
generated state-machine sequences preserve invariants; no unresolved
critical/high internal security finding.

### Phase 3 — SDK and recovery-capable sandbox client

Deliverables:

- typed instruction builders and account decoders pinned to program/IDL
  versions;
- allowlisted local-validator/devnet checks plus balances, lobby, gameplay,
  settlement, withdrawal, and spectator experiences that are visibly separate
  from practice;
- transaction state machine and reconciliation for refresh, restart, disconnect,
  unknown sends, and provider failover;
- explicit freshness/finality states and safe incident-mode UI;
- secure handling of commitment secrets according to the Phase 0 decision;
- component and end-to-end coverage for all critical paths and accessibility
  basics.

Exit gate: a user can recover every recoverable workflow from
refresh/restart/disconnect without duplicate value movement; unrecoverable
secret-loss behavior is prevented or disclosed before funding; component and E2E
matrices pass; mainnet/genesis/asset denial passes at build, startup, and
transaction time.

### Phase 4 — Indexing, discovery, and sandbox operations

Deliverables:

- reorg/duplicate-tolerant indexer for lobby discovery, history, and aggregate
  views;
- direct RPC fallback for known active matches and financial state;
- independent primary/fallback RPC and WebSocket topology;
- circuit breakers, bounded retries, transaction reconciliation workers,
  monitoring, SLO dashboards, alerts, and public status;
- scoped pause controls that block new exposure while preserving active matches,
  settlement/refunds, and withdrawals whenever safe;
- privacy-reviewed analytics and idempotent, non-sensitive notifications;
- incident, provider failover, indexer rebuild, reconciliation, and
  communications runbooks.

Exit gate: failure drills pass for provider outage, WebSocket gap, indexer
lag/rebuild, duplicate events, restart, reconciliation backlog, and scoped safe
pause; on-call ownership is staffed.

### Phase 5 — Devnet/testnet adversarial beta

Deliverables:

- closed then expanded beta using valueless or test assets;
- load, soak, concurrency, wallet-compatibility, abuse, and adversarial testing;
- economic simulation for fee rounding, timeout incentives, spam costs, and
  griefing;
- dependency and deployment rehearsal with production-like configuration;
- UX validation of signing, commitment/reveal, deadlines, finality, and incident
  messaging;
- external security review readiness assessment.

Exit gate: target volumes meet defined latency/error/reconciliation objectives;
no unresolved critical/high issue; operational drills and complete test matrices
produce retained evidence.

### Phase 6 — Independent audit and remediation

Deliverables:

- freeze audit scope and reproducible artifact;
- provide specification, threat model, fund flows, authorization matrix,
  invariants, tests, fuzz corpus, dependency inventory, authority model, and
  runbooks;
- complete at least one qualified independent program audit, plus focused
  client/service review for transaction safety and secret/privacy handling;
- complete independent cryptographic and game-theoretic review of the proposed
  non-reveal solution if real-value consideration remains a goal;
- remediate findings, add regression tests, and obtain auditor review of
  material fixes;
- rehearse deployment, verification, authority transfer, and emergency
  procedures in the approved environment; rehearse mainnet only after separate
  authorization.

Exit gate: all critical/high findings closed; accepted lower findings documented
with controls; deployable binary is reproducible; audit scope equals the release
candidate. This gate permits only the environment approved in the audit scope
and does not itself authorize mainnet.

### Phase 7 — Conditionally authorized audited mainnet beta

This phase does not begin unless a separate decision record supersedes the
current mainnet prohibition and records approval from protocol security,
legal/compliance, product, finance/treasury, privacy, and operations owners. The
forced/timed/threshold reveal or equivalent fairness gate must already have
passed independent review and adversarial testing.

Deliverables:

- limited allowlist or staged cohort;
- on-chain-enforced low per-match, per-wallet, and aggregate value caps where
  feasible;
- canary rollout with explicit stop conditions and daily financial
  reconciliation;
- live on-call, status communication, security disclosure, and support;
- heightened monitoring of invariants, transaction age, settlement/withdrawal
  failures, provider health, and abuse;
- post-launch review before raising any cap or widening access.

Exit gate for broader availability: stable SLOs over an agreed observation
period, zero unexplained financial discrepancy, no unresolved severe incident,
acceptable support/abuse load, and approved audit impact review for all changes
since the audit.

## Dependency evaluation

Dependencies must be evaluated before adoption and re-evaluated before
audit/mainnet.

| Area                       | Evaluation criteria                                                                                                                       | Preferred posture                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Solana/Anchor versions     | security advisories, validator/mainnet compatibility, account/discriminator behavior, build reproducibility, auditor support              | Pin exact tested versions; upgrade deliberately                                           |
| Rust crates                | maintenance, transitive graph, unsafe code, licenses, advisories, deterministic behavior                                                  | Minimize program dependencies and ban unnecessary network/native code                     |
| Web3 client library        | transaction version support, confirmation semantics, wallet compatibility, bundle size, maintenance                                       | Wrap behind a narrow adapter and test unknown-send behavior                               |
| Wallet adapter/connectors  | supported wallets, mobile/deep-link behavior, origin/network safety, dependency surface                                                   | Enable only tested wallets for beta                                                       |
| RPC/WS providers           | independent infrastructure, latency, rate limits, archive/history, subscription behavior, incident record, data terms                     | At least two providers with tested failover                                               |
| Indexer/database           | idempotent writes, unique constraints, rollback/rebuild, backup/restore, observability                                                    | Treat as derived and fully rebuildable                                                    |
| Queue/scheduler            | delivery guarantees, dedupe, visibility timeout, dead-letter handling                                                                     | At-least-once with idempotent consumers                                                   |
| Analytics                  | field allowlisting, consent, retention, region, deletion, wallet-data handling                                                            | First-party/coarse events; no secrets or full addresses                                   |
| Notifications              | retries, dedupe, template security, consent/unsubscribe, provider privacy                                                                 | Advisory only; authoritative status remains in app                                        |
| Testing/fuzzing            | Anchor validator fidelity, deterministic time, concurrency, corpus retention, CI integration                                              | Maintain model-based and invariant suites in CI                                           |
| Monitoring/error tracking  | redaction, data residency, retention, alert routing, sampling                                                                             | Explicit schemas and secret scrubbing before export                                       |
| Upgrade/multisig tooling   | signer support, transaction simulation, audit logs, recovery, vendor risk                                                                 | Independently verify every privileged transaction                                         |
| Fairness mechanism         | selective non-reveal resistance, cryptographic assumptions, liveness, committee/oracle trust, on-chain verification, cost, audit maturity | Plain commit/reveal for non-value sandbox only; no mainnet without a validated equivalent |
| Legal/compliance providers | jurisdiction, wagering classification, age/identity, sanctions, custody, tax, privacy, retention, incident duties                         | Obtain qualified advice; technical controls do not substitute for authorization           |

For every runtime dependency record owner, version, purpose, alternatives,
license, advisory status, data access, privilege, failure mode, fallback, and
removal plan. Unmaintained or unauditable dependencies in fund-moving paths
block mainnet.

## Open technical decisions

### Required before program implementation

1. Confirm native SOL-only v1 and explicitly reject SPL/token-extension support.
2. Review the selected pooled program vault plus per-owner
   `PlayerBalance`/per-match liability model against account/compute limits.
3. Review the selected match-specific ready consent plus single atomic
   `fund_match` transaction under worst-case four-player account limits.
4. Confirm 200 bps default, 500 bps hard cap, floor rounding, 2v2 remainder, fee
   treasury, and no-fee deterministic refund branches.
5. Freeze Clock boundary semantics, fallback/reveal deadlines, and every
   provider retry branch.
6. Select and independently review a forced/timed/threshold reveal or equivalent
   design that removes selective non-reveal option value.
7. Freeze account closure, rent recipient, upgrade authority, pause, and
   deterministic emergency-recovery policy.

### Required before client implementation

1. Commitment secret lifecycle: memory only, encrypted local persistence, user
   backup, cross-device recovery, or delegated encrypted storage.
2. Domain-separated commitment encoding and canonical move/salt serialization
   shared across Rust and TypeScript.
3. Confirmation/finality target for each user-visible state.
4. Transaction replacement policy and idempotency identifiers.
5. Wallet/network support and mobile deep-link behavior.
6. Spectator privacy: exactly when individual moves become public.
7. Direct RPC versus indexer responsibility for history and discovery.

### Required before audited mainnet beta

1. Value caps and whether each is enforced on chain.
2. Mainnet RPC providers, rate limits, and geographic/data-handling
   requirements.
3. Multisig participants, thresholds, key custody, rotation, and emergency
   access.
4. Legal/compliance position on wagering, geography, age restrictions,
   sanctions, consumer disclosures, taxes, and custody.
5. Privacy retention schedule and approved analytics/notification vendors.
6. Audit scope, auditor selection, bug bounty/disclosure process, and post-audit
   change policy.
7. Mainnet rollout cohort, stop conditions, and observation period.

## Known limitations

- Commit/reveal reduces simple move copying but does not eliminate griefing; a
  losing participant may refuse to reveal, so timeout incentives and outcomes
  are central to fairness.
- Solana transactions and account data are public. Wallet participation, wagers,
  timing, and eventual revealed moves may be linkable even when analytics are
  minimized.
- Finality is not instantaneous. UI states before the selected commitment may be
  rolled back or superseded.
- RPC and WebSocket providers can be stale, unavailable, throttled, or
  inconsistent. Multi-provider reconciliation improves availability but does not
  replace cluster consensus.
- The indexer is eventually consistent and may omit, duplicate, or temporarily
  reorder records.
- Browser refresh, storage clearing, device loss, or cross-device use can lose a
  reveal secret unless an approved recovery design exists. A warning is not a
  substitute for deciding the design.
- Wallet software and extensions are outside the application's trust boundary
  and may display or sign misleading transactions if compromised.
- Transaction fees, account rent, and congestion can make very small wagers
  uneconomical.
- Chain congestion or halt can prevent users from acting before a deadline.
  Deadline and timeout policy cannot promise availability the cluster does not
  provide.
- A program upgrade authority or pause authority is a trust assumption until
  removed or governed as disclosed.
- An audit reduces risk but does not prove absence of vulnerabilities or
  economic design flaws.
- Mainnet beta caps reduce exposure but do not make losses impossible.
- Legal availability can vary by user jurisdiction and may constrain or prohibit
  real-value play.
- The initial system does not provide private balances, private participation,
  or private final outcomes.

## Expansion architecture

Expansion should preserve a small audited settlement kernel:

- a versioned game/match interface defines participants, stakes, phases,
  deadlines, terminal result, and payout vector;
- isolated rule modules or separately deployed programs validate game-specific
  transitions;
- a shared escrow/settlement layer is considered only after strict authority
  boundaries and cross-game insolvency risk are proven;
- game type and ruleset version are immutable per match;
- clients load only allowlisted, schema-validated rulesets and render unknown
  versions read-only;
- the indexer stores raw chain provenance and builds versioned projections that
  can be rebuilt;
- SDK packages expose versioned codecs/adapters rather than silently changing
  semantics;
- feature flags control discovery/UI exposure but never override program
  authorization;
- each new asset, game, tournament, or matchmaking mode receives a separate
  threat model, invariant set, load model, audit-impact assessment, and rollout
  cap.

Potential future capabilities, in dependency order:

1. best-of-N rock-paper-scissors using the existing settlement model;
2. private/invite lobbies and public lobby discovery without automatic PvP
   matchmaking;
3. tournament orchestration that settles independent matches;
4. additional approved SPL assets with isolated vault/accounting;
5. reusable game adapters only after the RPS kernel is stable and audited;
6. privacy-enhancing protocols only after a dedicated cryptographic design and
   audit.

The architecture must not load arbitrary untrusted game logic into the
fund-moving authority, accept client-calculated payouts, or permit an indexer to
authorize settlement.

## Explicitly excluded from the initial audited beta

- fiat payments, card purchases, bridges, cross-chain wagers, and off-chain
  custody;
- arbitrary tokens, token-2022 extensions not explicitly approved, NFTs, and
  user-created assets;
- tournaments, leagues, leaderboard prizes, and pooled jackpots (the specified
  2v2 and 1v1v1v1 equal-wager pots remain initial product modes);
- lending, yield, staking, liquidity pools, house-banked odds, and credit;
- public chat, direct messaging, social feeds, referral payouts, and
  unrestricted user content (referral tracking foundation remains disabled);
- bots playing for users and unattended auto-wagering; narrowly scoped gameplay
  sessions remain required and cannot withdraw or transfer;
- automatic PvP matchmaking, hidden matching manipulation, dynamic odds, or
  client-authorized payout rules;
- DAO/governance systems beyond the minimum operational multisig;
- cross-device secret synchronization without an approved encrypted recovery
  design;
- claims of anonymity, guaranteed uptime, guaranteed fairness under chain
  outage, or guaranteed profit;
- broad public mainnet launch before the audited capped beta gates pass.

## Prompt 2 recommendation

Proceed with Prompt 2 as Phase 1: establish the reusable design system,
application shell/routes, centralized branding, and an anonymous local-CPU
Practice vertical slice, with optional wallet identity kept separate. This
validates first-to-two rules, timers, reveals, responsive match presentation,
accessibility, audio preferences, and environment isolation without custody or
fairness exposure. Prompt 2 should not implement deposits, withdrawals, on-chain
funding, a production program, wagered games, or mainnet configuration.

### Prompt 2 entry gates

- The web framework, package manager, supported Node/browser versions, test
  stack, and repository layout are selected.
- Practice rules for first-to-two, ties, local automatic move, disconnect/reset,
  rematch, and local CPU behavior are unambiguous.
- Practice/wager route, API, storage, cache, queue, event, and analytics
  namespaces are defined so practice cannot reach financial mutations.
- Mainnet and wager capabilities have deny-by-default build/startup/runtime
  tests; no placeholder transfer endpoint is added.
- WCAG 2.2 AA, keyboard, screen-reader, reduced-motion, audio, 320-pixel
  responsive, and performance acceptance criteria are assigned to tests.
- Anonymous identity, optional wallet connection, and signed-message
  authentication are explicitly separate; Practice never requires either wallet
  capability.
- Privacy, moderation, abuse-rate-limit, telemetry schema, and secret-redaction
  baselines are approved for the slice.
- Prompt 2 has a small vertical-slice acceptance plan and does not attempt the
  full roadmap.

Before any later Prompt implements the local-validator financial program, the
asset, custody, atomic funding, fee, draw, deadline, timeout, rent, upgrade,
pause, commitment encoding, secret recovery, authority, and every fund-flow
branch must pass the Phase 0/2 entry review. Before any mainnet work, the
separate Phase 7 authorization and fairness gates must pass.

## Change control

Any change to asset support, custody, payout, fee, deadline, timeout, authority,
account layout, commitment encoding, or settlement instruction is a protocol
change. It requires specification update, threat-model review, invariant/test
update, migration analysis, audit-impact assessment, and a new release gate. UI
or indexer changes that can misstate financial status require the same
transaction-safety review even when the on-chain program is unchanged.

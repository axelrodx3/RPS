# Reliability and Operations

## Purpose and operating principles

This document defines the reliability model for a wagered rock-paper-scissors
application. The chain is the source of truth for balances, match state,
settlement, and withdrawals. RPC responses, WebSocket events, indexer records,
browser state, analytics, and notifications are derived views and must never
independently authorize a financial transition.

The current approved product is anonymous off-chain practice plus a separately
gated non-mainnet wager sandbox. Mainnet and real-value operation remain
prohibited. RPC, wallet, indexer, settlement, or wager incidents must not
disable practice unless practice has an independent fault. The backend is
authoritative only for off-chain authentication, profiles, public/private lobby
presence/invites, and durable application records; it cannot reserve funds,
perform automatic PvP matchmaking, override program state, or direct custody.

Operations must preserve these priorities, in order:

1. Do not create an invalid or duplicate financial transition.
2. Preserve the ability to settle already-funded matches.
3. Preserve withdrawals whenever the chain and wallet path are healthy.
4. Stop new exposure before stopping read-only access.
5. Prefer a clearly degraded experience over ambiguous or stale claims.

All transaction-producing operations must be idempotent at the program level or
safely detectable as already complete. Client retries alone are not an
idempotency guarantee.

## Provider topology

### Primary and fallback RPC

Production uses at least two independently operated Solana RPC providers. The
primary serves normal reads and transaction submission. The fallback is
continuously health-checked and serves read failover. Providers should not share
the same upstream infrastructure where this can be verified.

Provider selection rules:

- Route reads to the primary while it is healthy and within latency/error
  budgets.
- Fail a read to the fallback after a bounded timeout or a qualifying
  transport/provider error.
- Retry only safe reads automatically. Use exponential backoff with jitter and a
  maximum attempt/time budget.
- For transaction submission, preserve the signed transaction and signature.
  Before re-signing or rebuilding, query signature status and relevant program
  accounts across providers.
- Never treat a provider's absence of a signature as proof that the transaction
  failed.
- Pin network, commitment, program ID, and expected genesis hash. A provider
  returning the wrong network is unhealthy.
- Compare critical account reads against a second provider during incidents or
  when data is internally inconsistent.

Suggested initial budgets:

- Read timeout: 2 seconds primary, then 3 seconds fallback.
- Read retry: up to 3 attempts within 8 seconds total.
- Transaction send retry: rebroadcast the same serialized transaction while its
  blockhash is valid; reconcile before creating a replacement.
- Health probe interval: 10 seconds, with recovery requiring multiple
  consecutive successes.

### Primary and fallback WebSocket

WebSocket subscriptions are an acceleration layer, not the source of truth.
Maintain one active connection to the primary provider and a warm or
reconnectable fallback.

- Track subscription generation, last observed slot, heartbeat age, reconnect
  count, and provider identity.
- On disconnect, mark live state as reconnecting, switch providers when
  thresholds are exceeded, recreate all subscriptions, then fetch authoritative
  account snapshots.
- De-duplicate events by account/signature plus slot and ignore events older
  than the last applied authoritative version.
- Detect gaps by comparing the last observed slot with current RPC slot and by
  periodically polling critical accounts.
- Never infer a final outcome solely from a WebSocket event. Confirm the program
  account and transaction commitment.

### Provider health model

Each provider is `healthy`, `degraded`, `open`, or `recovering`.

- `healthy`: probes pass and error/latency thresholds are within budget.
- `degraded`: usable, but latency, stale slots, throttling, or intermittent
  errors exceed warning thresholds.
- `open`: circuit breaker rejects normal traffic after consecutive failures or a
  rolling error threshold.
- `recovering`: limited probe traffic is allowed; normal traffic resumes only
  after consecutive successful probes.

Health probes cover JSON-RPC availability, expected genesis hash, latest slot
freshness, blockhash retrieval, a known program account read, WebSocket
heartbeat, and rate-limit signals. A circuit breaker is maintained per provider
and operation class so a WebSocket failure does not unnecessarily stop healthy
HTTP reads.

Retries must classify errors:

- Retryable: timeout, connection reset, HTTP 429/5xx, temporarily unavailable
  node, stale blockhash while no signature could have landed.
- Reconcile first: unknown send result, expired confirmation wait, browser
  interruption after signing, provider disagreement.
- Not retryable without user/action change: wallet rejection, insufficient
  funds, invalid account state, program error, authorization failure.

## Transaction reconciliation

Every user-visible transaction has a durable client correlation ID and stores
the signature as soon as it exists. The UI and backend use the following states:

| State                | Meaning                                                    | Allowed action                                   |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| `draft`              | Intent exists; nothing signed                              | Edit or cancel intent                            |
| `awaiting_signature` | Wallet interaction requested                               | Wait or cancel before signing                    |
| `signed`             | Signed payload exists; send result unknown or pending      | Submit/rebroadcast the same bytes                |
| `submitted`          | Provider accepted the signature                            | Poll signature and program accounts              |
| `processed`          | Cluster observed it, not yet at target commitment          | Continue reconciliation; do not claim finality   |
| `confirmed`          | Signature reached configured confirmation                  | Verify expected account transition               |
| `finalized`          | Signature finalized and expected transition verified       | Mark complete                                    |
| `rejected`           | Wallet/user rejected before submission                     | Return to a safe pre-transaction state           |
| `failed`             | Definitive chain/program failure                           | Show reason; permit corrected new intent         |
| `expired_unknown`    | Blockhash expired and outcome is not established           | Query signature and accounts before replacement  |
| `replaced`           | A reconciled replacement transaction supersedes the intent | Track both signatures; prevent double accounting |
| `manual_review`      | Providers or chain/account evidence disagree               | Stop automated mutation and alert operations     |

Reconciliation order:

1. Query the known signature at the configured commitment from primary and
   fallback.
2. Fetch the affected program and token/system accounts.
3. Determine whether the intended state transition already happened, using
   on-chain identifiers and state.
4. If the transaction definitively failed, expose the failure.
5. If it is absent and its blockhash is still valid, rebroadcast the identical
   signed bytes.
6. If it is absent, expired, and the transition did not occur, construct a
   replacement only if the operation is program-level idempotent or its
   preconditions prove it remains safe.
7. Escalate disagreement, unexpected deltas, or duplicate-looking effects to
   `manual_review`.

Deposits/funding, reveal/settlement actions, balance credits, refunds, and
withdrawals each require an operation-specific reconciliation adapter. A generic
“retry transaction” button is not sufficient.

## Service status and incident modes

Status is represented both internally and on a public status surface:

- `normal`: all supported operations available.
- `practice_only`: practice remains available while every wager entry point
  fails closed.
- `degraded_reads`: reads may be delayed; show data freshness and continue safe
  reconciliation.
- `live_updates_degraded`: WebSocket path impaired; poll and label delayed live
  state.
- `new_matches_paused`: block lobby creation and joining/funding of new
  exposure.
- `gameplay_restricted`: allow only actions required to complete or safely
  timeout already-funded matches.
- `settlement_only`: permit reveal, timeout resolution, refunds, automatic
  balance credits, and reconciliation; prohibit new matches.
- `withdrawals_restricted`: only when the withdrawal path itself is unsafe or
  unavailable; never use this merely to reduce load.
- `maintenance`: read-only where possible, with explicit exceptions for
  time-sensitive safety actions.
- `chain_halt_or_fork`: freeze claims of finality, preserve signed artifacts,
  and follow cluster guidance.

### Safe pause policy

Pause controls are separate, auditable flags for:

- creating lobbies;
- joining or funding lobbies;
- starting unfunded play;
- submitting gameplay actions;
- settlement and timeout resolution;
- withdrawals;
- notifications.

A broad incident switch must resolve to explicit flags. The default incident
action is to pause new exposure while preserving active matches,
settlement/refund paths, and withdrawals. Settlement or withdrawals may be
paused only when continuing them creates a specific integrity, authorization, or
chain-safety risk. UI messaging must distinguish “temporarily unavailable” from
“funds lost” and provide the last verified state and next safe action.

Disabling wager mode must route users to clearly labeled practice, not silently
convert, rematch, or reuse a financial game as practice. Practice and wager
incidents, status, telemetry, queues, and recovery actions remain separately
scoped.

Pause changes require an operator identity, reason, timestamp, scope,
expiry/review time, and audit record. Two-person approval is recommended for
disabling settlement or withdrawals in mainnet production.

## Recovery behavior

### Browser refresh or process restart

- Persist only minimal non-secret intent metadata, correlation IDs, signatures,
  and last known account identifiers.
- Never persist wallet private keys, signing material, unrevealed plaintext
  moves, or secrets in analytics/logs.
- On startup, discard optimistic derived state, load pending operations,
  reconnect providers, fetch authoritative accounts, and reconcile each
  signature.
- Restore active match navigation from on-chain account identity, not from a
  cached UI step.
- If a commit/reveal secret is required, use the approved secure recovery
  design; otherwise warn before commitment that clearing local state may forfeit
  the reveal. The limitation must be tested and disclosed.

### Disconnect and reconnect

During disconnection, disable mutation that cannot be safely queued, show
connectivity and last-updated time, and retain signed transaction artifacts. On
reconnect, fetch snapshots before applying new subscription events. Do not
replay stale optimistic updates.

### Indexer lag or outage

The indexer powers discovery, history, aggregates, and search only. Critical
balances, active match state, settlement eligibility, and withdrawal eligibility
are read from chain RPC. Display indexer freshness and fall back to direct
account lookup for known matches. Never hide a funded active match solely
because it is absent from the indexer.

### Duplicate events and actions

- De-duplicate client events with stable operation IDs.
- Enforce unique match/account constraints and one-way state transitions in the
  program.
- Make settlement/credit and withdrawal instructions reject replay or produce no
  additional value effect.
- Treat duplicate notifications and analytics independently from financial
  idempotency.
- Reconcile account deltas after every finalized financial action.
- Apply chain events at least once into projections with unique event identity
  and monotonic match sequence; a duplicate insert is a no-op.
- Commit an authoritative database projection and its outbox record in one
  transaction. Consumers use stable dedupe keys and tolerate worker restart
  between side effect and acknowledgement.
- Rebuild disposable caches and index projections from finalized chain history
  and durable cursors instead of inferring truth from delivery logs.

## Monitoring and proposed SLOs

These are launch proposals and require load testing and production-baseline
review.

| Signal                             | Proposed objective                                      | Alert guidance                                                  |
| ---------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| Practice availability              | 99.9% monthly, independent of wager dependencies        | Page when wallet/RPC/wager failures cascade into practice       |
| Route interaction feedback         | p95 begins within 200 ms under expected load            | Warn on sustained regression by route/device class              |
| Ordinary API read latency          | p95 under 500 ms server time                            | Alert on sustained breach excluding provider dependency         |
| Realtime game event latency        | p95 under 300 ms excluding client/network distance      | Alert by gateway/region; preserve snapshot recovery             |
| RPC read availability              | 99.9% monthly across provider failover                  | Page if critical reads fail across both providers for 5 minutes |
| Critical read latency              | 99% under 3 seconds                                     | Warn on 10-minute breach; page if sustained and no fallback     |
| Live update freshness              | 99% under 10 seconds when cluster is healthy            | Warn on stale subscription slots or polling fallback            |
| Transaction status visibility      | 99% of submitted signatures reflected within 15 seconds | Alert on reconciliation backlog/age                             |
| Finalized financial reconciliation | 99.99% eventually reconciled without manual correction  | Page on unexplained balance delta or invariant breach           |
| Active-match availability          | 99.9% monthly excluding cluster-wide incidents          | Page when funded matches cannot be read/actioned                |
| Settlement path availability       | 99.95% monthly when cluster permits writes              | Immediate page on systemic settlement failure                   |
| Withdrawal path availability       | 99.95% monthly when cluster permits writes              | Immediate page on systemic withdrawal failure                   |
| Indexer freshness                  | 99% within 30 seconds                                   | Degrade discovery; page after sustained backlog                 |
| Notification duplication           | Below 0.1%                                              | Warn on dedupe failures or retry storms                         |

Dashboards should include provider error/latency/rate limits, slot lag,
WebSocket reconnects, transaction states and age, failure codes, reconciliation
mismatches, active/funded matches by age, settlement/timeout backlog, withdrawal
failures, program invariant alerts, indexer lag, notification retries, frontend
error rate, and status-mode changes.

Alerts must avoid sensitive payloads. Runbooks must identify owner, severity,
first checks, safe pause scope, provider failover procedure, reconciliation
queries, communication template, rollback/forward-fix criteria, and
post-incident actions.

## Incident response

1. Detect and assign severity.
2. Establish whether the issue is UI, indexer, provider, wallet, program, or
   cluster-wide.
3. Preserve evidence: versions, slots, signatures, account IDs, provider
   responses, and timestamps without secrets.
4. Pause the smallest unsafe surface, prioritizing a pause on new exposure.
5. Verify funded matches, settlement, refunds, and withdrawals directly against
   chain state.
6. Communicate user impact, safe actions, and update cadence.
7. Recover using provider failover, rollback, forward fix, or controlled
   reconciliation.
8. Remove pauses gradually and monitor error and invariant signals.
9. Complete a blameless post-incident review with remediation owners and dates.

## Privacy-preserving analytics

Analytics are opt-in where required and data-minimized everywhere:

- Do not collect wallet signatures, private keys, seed phrases, unrevealed
  moves/salts, raw transaction payloads, IP addresses beyond short-lived
  security necessity, or full wallet addresses as general analytics identifiers.
- Prefer ephemeral pseudonymous session IDs and coarse aggregates.
- If wallet-level abuse analysis is necessary, use a purpose-specific keyed
  hash, restricted access, rotation/retention rules, and documented legal
  review.
- Separate operational logs, security logs, product analytics, and financial
  reconciliation data.
- Define event schemas and reject unexpected fields at ingestion.
- Apply retention limits, deletion workflows, access controls, audit logs, and
  regional/consent requirements.
- Do not send financial amounts or wallet identifiers to third-party analytics
  unless explicitly approved and disclosed.

## Notification safety

Notifications are advisory and never proof of settlement, winnings, or
withdrawal completion.

- Generate notifications from confirmed/finalized authoritative events,
  according to event risk.
- Include a stable dedupe key and make delivery retries idempotent.
- Do not include unrevealed moves, salts, full wallet addresses, sensitive
  balances, or links that request a seed phrase/signature.
- Deep links must open the application on the expected origin and require fresh
  wallet/account verification.
- Clearly distinguish “action may be required,” “transaction submitted,” and
  “finalized.”
- Respect user consent, channel preferences, quiet hours, unsubscribe, and rate
  limits.
- Disable campaigns during incidents independently of required safety notices.
- Treat inbound support messages and notification templates as untrusted
  content; protect against phishing and template injection.

## Operational readiness gates

Before production value is accepted:

- Two independent RPC/WS providers pass failover drills.
- Restart, refresh, disconnect, stale indexer, duplicate event, and unknown
  transaction tests pass.
- Safe-pause controls are scoped, audited, access-controlled, and rehearsed.
- Funded-match, settlement, refund, and withdrawal runbooks are exercised.
- Dashboards, alerts, status communication, and on-call ownership are active.
- Reconciliation can enumerate all nonterminal operations and prove expected
  account deltas.
- Analytics and notifications pass privacy and security review.
- Recovery point and recovery time objectives are documented for every off-chain
  component.

# Testing and Audit Readiness

## Quality strategy

Tests must prove both user behavior and on-chain financial correctness. Program
state and account deltas are authoritative; UI text alone is never sufficient
evidence for a financial assertion. Every financial scenario records pre-state,
transaction signature, instruction result, post-state, fees/rent, and the
invariant calculation.

The present release target is practice play plus an explicitly allowlisted
non-mainnet wager sandbox. Mainnet and real-value tests are negative safety
tests unless and until a separate authorization, fairness protocol, legal
review, audit, and release decision supersede that restriction. No checklist in
this document authorizes deployment.

The standard environments are:

- Rust unit tests for pure state transitions, validation, arithmetic, and
  serialization.
- Anchor program tests against a local validator for accounts, signers, CPIs,
  clocks, and failure atomicity.
- TypeScript SDK tests for instruction construction, decoding, reconciliation,
  and provider failures.
- Component tests for wallet, balance, lobby, game, spectator, transaction, and
  incident UI.
- End-to-end tests on local validator and a production-like test cluster.
- Property and fuzz tests for state-machine sequences, malformed inputs,
  arithmetic boundaries, and duplicate/reordered events.
- Security tests for authorization, replay, account substitution, commitment
  manipulation, privacy, and abuse controls.
- Performance and soak tests for lobby discovery, subscriptions, transaction
  queues, indexer lag, and provider failover.

## Balance and withdrawal matrix

| ID    | Scenario                                    | Setup/action                                                                           | Expected result and explicit assertions                                                                                                          | Layers                                       |
| ----- | ------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| BW-01 | Zero balance                                | Connected wallet has no available escrow balance                                       | Zero is displayed; withdrawal disabled; no instruction can transfer value                                                                        | Anchor, TS, component, E2E                   |
| BW-02 | Wallet balance load                         | Fund wallet and load app                                                               | Native/token balance matches RPC at selected commitment; freshness shown                                                                         | TS, component, E2E                           |
| BW-03 | Escrow balance load                         | User has available, locked, and pending amounts                                        | Each category and total reconcile to program accounts; locked funds are not withdrawable                                                         | Anchor, TS, component, E2E                   |
| BW-04 | Deposit/funding reflected                   | Submit a valid funding transaction                                                     | Pending then confirmed/finalized states appear; exact amount enters escrow/lock once                                                             | Anchor, TS, E2E                              |
| BW-05 | Full withdrawal                             | Withdraw entire available amount                                                       | Recipient gains exact transfer less only documented network effects; escrow available becomes zero; locked unchanged                             | Anchor, E2E, invariant                       |
| BW-06 | Partial withdrawal                          | Withdraw less than available                                                           | Available decreases by exact amount; recipient increases by exact amount; remainder withdrawable                                                 | Anchor, E2E, invariant                       |
| BW-07 | Minimum withdrawal                          | Withdraw minimum supported unit                                                        | Succeeds without rounding loss; exact integer accounting                                                                                         | Rust, Anchor, E2E                            |
| BW-08 | Dust and below minimum                      | Request zero, dust, or below minimum                                                   | Client blocks where appropriate; program rejects; no account changes except unavoidable failed-transaction fee                                   | Rust, Anchor, component                      |
| BW-09 | Over-withdrawal                             | Request available plus one unit                                                        | Program rejects atomically; available/locked/vault balances unchanged                                                                            | Rust, Anchor, fuzz                           |
| BW-10 | Locked-fund withdrawal                      | User has funds locked in an active match                                               | Locked value cannot be withdrawn; available value remains independently withdrawable                                                             | Anchor, E2E, security                        |
| BW-11 | Pending-settlement withdrawal               | Match outcome observed but not settled                                                 | Only already-available funds can be withdrawn; no optimistic winnings are spendable                                                              | Anchor, TS, E2E                              |
| BW-12 | Withdrawal recipient                        | Withdraw to authorized wallet/account                                                  | Funds reach only the program-defined authorized recipient; substituted recipient/account rejected                                                | Anchor, security                             |
| BW-13 | Wrong signer                                | Another wallet attempts withdrawal                                                     | Authorization fails atomically; all financial accounts unchanged                                                                                 | Anchor, security                             |
| BW-14 | Wrong mint/token program                    | Substitute mint, vault, token program, or account owner                                | Constraint/owner validation rejects before transfer                                                                                              | Anchor, fuzz, security                       |
| BW-15 | Frozen/invalid recipient                    | Recipient cannot accept transfer                                                       | Transaction fails atomically; internal balance is not debited                                                                                    | Anchor, E2E                                  |
| BW-16 | Insufficient fee balance                    | User can withdraw value but cannot pay transaction fee                                 | Clear preflight/error state; no false completion; balances reconcile                                                                             | TS, component, E2E                           |
| BW-17 | User rejects signature                      | Reject wallet prompt                                                                   | State returns to idle/rejected; no chain/account change                                                                                          | TS, component, E2E                           |
| BW-18 | Unknown send result                         | Disconnect after signing/submitting                                                    | Same signature is reconciled; no duplicate withdrawal; final state reflects chain                                                                | TS, E2E, fault injection                     |
| BW-19 | Double click/replay                         | Submit withdrawal twice or replay instruction                                          | At most one authorized debit for a one-time claim/intent; duplicate is rejected or independently bounded by remaining available balance          | Anchor, E2E, security                        |
| BW-20 | Concurrent withdrawals                      | Two requests race against the same available balance                                   | Serialization permits only valid total; no negative balance or vault deficit                                                                     | Anchor, property, E2E                        |
| BW-21 | Withdrawal during refresh/restart           | Refresh at signature, submitted, and confirmed stages                                  | Operation restores and reconciles; no duplicate accounting                                                                                       | TS, component, E2E                           |
| BW-22 | RPC failover                                | Primary fails during balance read or withdrawal confirmation                           | Read moves to fallback; signed transaction is not rebuilt until reconciled                                                                       | TS, E2E, fault injection                     |
| BW-23 | Stale indexer                               | Indexer reports old balance                                                            | Critical balance and withdrawal eligibility follow direct on-chain state; freshness warning shown                                                | TS, component, E2E                           |
| BW-24 | Large and boundary values                   | Use max configured balance, maximum wager-derived payout, and near-integer limits      | Checked arithmetic; exact display/serialization; overflow rejected                                                                               | Rust, Anchor, property, fuzz                 |
| BW-25 | Fee/rent accounting                         | Create/close relevant accounts around withdrawal                                       | Network fee/rent effects are separated from principal; no hidden program leakage                                                                 | Anchor, E2E, invariant                       |
| BW-26 | Restricted withdrawal incident              | Enable withdrawal-specific pause                                                       | New withdrawal rejected with reason; balances preserved; unpause restores access                                                                 | Anchor/admin, component, E2E                 |
| BW-27 | Normal incident pause                       | Pause new matches only                                                                 | Withdrawals remain available and correct                                                                                                         | E2E, operations                              |
| BW-28 | Closed-account recovery                     | Account closure is supported after full withdrawal                                     | Close only when state permits; rent destination authorized; account cannot be reused unsafely                                                    | Anchor, security, E2E                        |
| BW-29 | Available/reserved/pending/total projection | Create balances in each lifecycle category                                             | Displayed categories match canonical program accounts and append-only ledger projection; total equals defined categories without double counting | TS, component, E2E, invariant                |
| BW-30 | Reservation isolation                       | Reserve for one match, then attempt a second reservation and withdrawal                | The same units cannot reserve twice or be withdrawn; unrelated available units remain usable                                                     | Anchor, E2E, property                        |
| BW-31 | Versioned balance race                      | Submit mutations with the same expected balance version                                | At most one conflicting transition succeeds; stale request refreshes instead of overwriting                                                      | Anchor, TS, E2E                              |
| BW-32 | Alternate withdrawal destination            | Attempt default and alternate destinations                                             | Default is owner wallet; alternate requires explicit wallet-bound authorization and cannot be substituted by backend/session alone               | Anchor, TS, security                         |
| BW-33 | Append-only ledger                          | Complete deposit, reservation, release, stake, payout, fee, withdrawal, and correction | Each uses a distinct immutable entry type/correlation ID; correction uses balancing compensating entries, never update/delete                    | Service, database, E2E, audit                |
| BW-34 | Duplicate ledger/outbox delivery            | Redeliver each balance event and restart worker between write/publish                  | Idempotency key returns prior result; one ledger effect and one logical notification result                                                      | Service, database, property, fault injection |
| BW-35 | Reconciliation discrepancy                  | Corrupt/stale projection relative to finalized chain                                   | Unsafe new reservation is disabled; finding enters review; reprojection repairs views without corrective money movement                          | Service, E2E, operations                     |
| BW-36 | Frozen/emergency recovery                   | Freeze available and reserved balances, then enable committed recovery path            | No new inflow/reservation; entitlements remain attributed; only owner-authorized unencumbered withdrawal/deterministic refund is allowed         | Anchor, admin, E2E, security                 |
| BW-37 | Environment and asset labels                | View every balance and transaction state                                               | Asset, integer precision, cluster, test-asset label, and finality are always visible and cannot be hidden by responsive layout                   | Component, E2E, accessibility                |
| BW-38 | Practice isolation                          | Enter practice through every route and rematch path                                    | No wallet, balance, deposit, withdrawal, reservation, or ledger mutation is requested or reachable                                               | Component, API contract, E2E, security       |
| BW-39 | Mainnet denial                              | Inject mainnet RPC/genesis, URL/config, account, asset, and transaction request        | Build/startup/runtime layers reject it; no transaction builder or wager mutation proceeds                                                        | Unit, integration, E2E, security             |
| BW-40 | Successful deposit                          | Owner deposits exact lamports with fresh nonce                                         | Vault and available liability increase equally once; lifetime deposits and receipt update                                                        | Anchor, E2E, invariant                       |
| BW-41 | Failed deposit                              | Reject wallet, fail simulation/program, expire blockhash, and inject RPC failure       | Rejection submits nothing; failed/expired transaction creates no credit; unknown is reconciled before retry                                      | Anchor, TS, E2E, fault injection             |
| BW-42 | Duplicate deposit indexing                  | Deliver the same successful deposit event repeatedly and restart projector             | One on-chain credit and one indexed receipt/projection effect                                                                                    | Database, indexer, property                  |
| BW-43 | Failed withdrawal retry                     | Fail before landing, reconcile expiry, then sign a fresh nonce/transaction             | First attempt does not debit; second succeeds once; receipts remain distinct and correct                                                         | Anchor, TS, E2E                              |
| BW-44 | Backend offline during withdrawal           | Build/submit owner withdrawal using direct client/program path                         | Valid owner withdrawal remains possible and reconciles when backend returns                                                                      | Anchor, E2E, operations                      |
| BW-45 | Successful withdrawal replay                | Replay landed transaction/instruction and nonce                                        | Program rejects/no-ops without second debit or payment                                                                                           | Anchor, fuzz, security                       |

## Lobby funding matrix

| ID    | Scenario                        | Setup/action                                                                | Expected result and explicit assertions                                                                   | Layers                                             |
| ----- | ------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| LF-01 | Join and leave incomplete lobby | Player occupies and leaves a waiting seat                                   | Available/locked balances and lifetime counters are byte-for-byte unchanged; no refund transaction exists | Service, Anchor negative assertion, E2E, invariant |
| LF-02 | Repeated join/leave             | Players repeatedly acquire/release seats                                    | No fund mutation; leases expire; abuse/rate limits engage without trapping a seat                         | Service, E2E, abuse                                |
| LF-03 | Full 1v1 lobby                  | Two unique eligible players occupy seats                                    | Full roster and 30-second ready check appear; still no balance lock                                       | Service, component, E2E                            |
| LF-04 | Full 2v2 lobby                  | Four unique players choose valid teams/seats                                | Complete paired roster, team selection and exact 4-player preview; no funds lock                          | Service, component, E2E                            |
| LF-05 | Full 1v1v1v1 lobby              | Four unique players occupy seats                                            | Full roster, lives/rules preview and ready check; no funds lock                                           | Service, component, E2E                            |
| LF-06 | Balance becomes insufficient    | Player joins with enough balance, spends/withdraws before start             | Atomic funding fails before mutation; player is removed/reopened per policy; nobody charged               | Anchor, component, E2E                             |
| LF-07 | Session expires before start    | Ready consent references expired/revoked session                            | Program rejects entire funding instruction; every balance unchanged                                       | Anchor, TS, E2E, security                          |
| LF-08 | One player fails funding        | One consent/account/wager/owner check is invalid                            | One transaction fails atomically; zero players move available→locked                                      | Anchor, E2E, invariant                             |
| LF-09 | All-or-nothing funding          | Valid 2- and 4-player starts plus injected failure at each validation point | Success locks every exact wager once; each injected failure locks none                                    | Anchor, property, fuzz, E2E                        |
| LF-10 | Team change before lock         | 2v2 player changes to an available team during waiting                      | Allowed and reflected in fresh ready review; no balance effect                                            | Service, component, E2E                            |
| LF-11 | Team change after lock          | Attempt change after funded state                                           | UI blocks and program rejects; teams, balances and rules remain unchanged                                 | Anchor, component, security                        |
| LF-12 | Ready timeout                   | One/more players fail 30-second ready window                                | Missing player removed; seat reopens; no fee/debit/refund                                                 | Service, component, E2E                            |
| LF-13 | Seat reservation expiration     | Disconnect without renewing presence                                        | Lease expires, seat reopens, remaining players informed; no balance effect                                | Service, E2E, fault injection                      |
| LF-14 | Duplicate join                  | Same wallet joins twice or multiple seats                                   | Unique constraint/policy rejects duplicate; one seat maximum; no fund effect                              | Service, database, E2E                             |
| LF-15 | Self-join                       | Creator wallet attempts another seat                                        | Rejected; no roster or balance change                                                                     | Service, database, security                        |
| LF-16 | Concurrent final-seat joins     | Two wallets race for last seat                                              | Exactly one lease wins; loser receives no seat and no charge                                              | Service, database, property, E2E                   |
| LF-17 | Duplicate atomic start          | Coordinator retries known/unknown funding submission                        | Reconcile one signature/consumed consents; at most one lock per player                                    | Anchor, TS, E2E, security                          |
| LF-18 | Terms changed after ready       | Mutate wager, fee, mode, rules, team or deadline                            | Ready-consent hash mismatch rejects whole funding; fresh review required                                  | Anchor, TS, E2E                                    |
| LF-19 | Public creator interference     | Creator rejects/kicks valid occupied player or changes terms after join     | Operation unavailable/rejected; only lease/readiness policy can reopen seat                               | Service, API contract, security                    |
| LF-20 | Private invite security         | Valid, guessed, expired, closed-lobby, enumerated and rate-limited codes    | Only valid high-entropy code resolves; it grants discovery/seat access, never fund authority              | Service, E2E, security                             |
| LF-21 | New games paused                | Create/join/atomic fund during pause                                        | New exposure blocked; waiting balances unchanged; existing matches and safe exits continue                | Anchor, service, E2E                               |
| LF-22 | Wrong account graph             | Substitute player balance, owner, session, consent, match or vault account  | PDA/owner/relationship/distinct-mutable checks reject before any debit                                    | Anchor, fuzz, security                             |
| LF-23 | Lobby expiry/cancel             | Expire or creator-cancel eligible incomplete lobby                          | Leases/invite invalidated; no refund because no funds were ever locked                                    | Service, component, E2E                            |
| LF-24 | Indexer/backend restart         | Restart during full/ready/funding transitions                               | Waiting state recovers from DB leases; financial state reconciles from chain; no duplicate start          | Service, Anchor, E2E, fault injection              |

## Gameplay and settlement matrix

| ID    | Scenario                                | Setup/action                                                                                                         | Expected result and explicit assertions                                                                                                         | Layers                                     |
| ----- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| GP-01 | All nine move pairs                     | Execute R/R, R/P, R/S, P/R, P/P, P/S, S/R, S/P, S/S                                                                  | Three draws and six wins match canonical rules; participant ordering does not bias result                                                       | Rust, Anchor, property                     |
| GP-02 | Valid commit                            | Each player commits a domain-separated move hash                                                                     | Commitment accepted once for correct match/player; plaintext move is not exposed                                                                | Rust, Anchor, E2E                          |
| GP-03 | Duplicate commit                        | Same or different commitment submitted twice                                                                         | Defined idempotent/reject behavior; original commitment cannot be overwritten                                                                   | Anchor, security                           |
| GP-04 | Invalid commitment                      | Wrong length/format or malformed input                                                                               | Rejected without state change                                                                                                                   | Rust, Anchor, fuzz                         |
| GP-05 | Early reveal                            | Reveal before required commitments/phase                                                                             | Rejected; move remains private                                                                                                                  | Anchor, security                           |
| GP-06 | Correct reveal                          | Reveal valid move and salt                                                                                           | Hash verifies and reveal records once                                                                                                           | Rust, Anchor, E2E                          |
| GP-07 | Wrong move or salt                      | Reveal does not match commitment                                                                                     | Rejected without replacing commitment or granting payout                                                                                        | Rust, Anchor, fuzz, security               |
| GP-08 | Opponent reveal privacy                 | One player reveals first                                                                                             | Protocol/UI follow documented information model; no unauthorized secret was logged before reveal                                                | Anchor, component, privacy                 |
| GP-09 | Duplicate reveal                        | Replay reveal instruction                                                                                            | No duplicate transition or settlement                                                                                                           | Anchor, security                           |
| GP-10 | Unauthorized action                     | Spectator or unrelated wallet commits/reveals                                                                        | Signer constraint rejects atomically                                                                                                            | Anchor, security                           |
| GP-11 | Phase and clock boundaries              | Act immediately before/at/after commit and reveal deadlines                                                          | Deterministic permitted/rejected behavior based on chain clock                                                                                  | Rust, Anchor, E2E                          |
| GP-12 | Both reveal, decisive result            | Complete a non-draw game                                                                                             | Winner credited exact pot minus only documented fee; loser receives no payout; match closes/settles once                                        | Anchor, E2E, invariant                     |
| GP-13 | Both reveal, draw                       | Complete equal moves                                                                                                 | Defined draw refund/rematch policy applies exactly; no unexplained remainder                                                                    | Anchor, E2E, invariant                     |
| GP-14 | One player times out                    | Required action omitted past deadline                                                                                | Authorized timeout resolution pays/refunds exactly per rules once                                                                               | Anchor, E2E, invariant                     |
| GP-15 | Both players inactive                   | Neither acts through deadlines                                                                                       | Defined cancellation/refund outcome is deterministic and conserves funds                                                                        | Anchor, E2E, invariant                     |
| GP-16 | Premature timeout claim                 | Claim at or before eligible boundary                                                                                 | Rejected; match and locked balances unchanged                                                                                                   | Anchor, security                           |
| GP-17 | Competing settle/timeout                | Reveal settlement and timeout transactions race                                                                      | Only one terminal transition succeeds; one payout maximum                                                                                       | Anchor, property, E2E                      |
| GP-18 | Duplicate settlement                    | Retry/replay finalization                                                                                            | Terminal state prevents a second transfer or fee                                                                                                | Anchor, fuzz, security                     |
| GP-19 | Settlement unknown                      | Disconnect after settlement submission                                                                               | Signature/account reconciliation finds terminal state; no replacement payout                                                                    | TS, E2E, fault injection                   |
| GP-20 | Refresh/restart mid-game                | Refresh in each commit/reveal/settlement phase                                                                       | Authoritative phase restores; pending signatures reconcile; secret recovery limitation is handled as designed                                   | Component, E2E                             |
| GP-21 | WebSocket missed/reordered/duplicate    | Inject event anomalies                                                                                               | Snapshot/version logic converges to chain state; no illegal UI action enabled                                                                   | TS, component, E2E                         |
| GP-22 | RPC/provider disagreement               | Providers return stale/different observations                                                                        | No premature terminal claim; critical state is re-read and disagreement surfaced                                                                | TS, E2E                                    |
| GP-23 | Settlement-only mode                    | Pause new gameplay while funded matches exist                                                                        | Required reveal/timeout/settle actions remain available per safe-pause policy                                                                   | Admin, component, E2E                      |
| GP-24 | Invalid account graph                   | Cross-wire player, lobby, match, vault, or payout accounts                                                           | PDA/relationship constraints reject                                                                                                             | Anchor, fuzz, security                     |
| GP-25 | Fee calculation                         | Test zero/configured/max fee and rounding boundaries                                                                 | Fee formula uses checked integer arithmetic; total payout plus fee equals pot                                                                   | Rust, Anchor, property                     |
| GP-26 | Account close after settlement          | Close eligible terminal accounts                                                                                     | Rent goes to authorized destination; account cannot settle again                                                                                | Anchor, security, E2E                      |
| GP-27 | Client move validation                  | Empty, unknown, manipulated, or stale move input                                                                     | Client blocks invalid input; program independently rejects it                                                                                   | TS, component, E2E                         |
| GP-28 | Multi-match isolation                   | Same wallet plays concurrent matches                                                                                 | Commitments, secrets, deadlines, balances, and settlement never cross matches                                                                   | Anchor, property, E2E                      |
| GP-29 | Versioned scoring targets               | Run 1v1/2v2 first-to-two sequences and 1v1v1v1 two-life sequences including ties                                     | Snapshotted target/lives, round counter, score and continuation are deterministic; ties do not increase stake                                   | Rust, Anchor, property, E2E                |
| GP-30 | Team/FFA mode safety                    | Exercise any implemented 2v2/free-for-all rules version                                                              | Seat/team aggregation and payout vector follow immutable snapshot; unsupported modes are rejected and not exposed                               | Rust, Anchor, E2E                          |
| GP-31 | Canonical cross-language commitment     | Consume shared vectors for rounds 0/max, both seats, all moves, leading-zero inputs                                  | Rust, TypeScript, and on-chain verifier produce identical 180-byte preimage and SHA-256 digest                                                  | Rust, Anchor, TS, fixture                  |
| GP-32 | Commitment domain replay                | Substitute program, cluster/domain, match, rules, round, wallet, seat, move, or salt                                 | Every mismatch fails verification; original commitment remains intact                                                                           | Rust, Anchor, property, fuzz               |
| GP-33 | Salt quality and leakage                | Inspect generation, persistence, export/import, logs, URLs, telemetry, source maps, and backend traffic              | Salt is 32 CSPRNG bytes, encrypted locally/exportable per design, and absent from all forbidden channels before reveal                          | TS, component, E2E, security               |
| GP-34 | Selective non-reveal safety gate        | Model every reveal/withhold choice and network-failure information set                                               | Plain commit/reveal remains non-mainnet only; real-value configuration cannot enable until reviewed forced/timed/threshold reveal criteria pass | Model, property, config, security          |
| GP-35 | Scoped session authorization            | Test allowed actions plus wrong scope, limits, nonce races, expiry, revoke-one/all, loss, and fee-payer substitution | Session can only perform explicitly bound play actions; cannot withdraw, delegate, change destination, exceed limits, or survive revoke/expiry  | Anchor, TS, E2E, security                  |
| GP-36 | Session and wallet disruption           | Expire login, disconnect/change wallet, lose session key mid-lobby/match                                             | Canonical match remains accessible; direct wallet action or deterministic timeout/settlement works; no support impersonation                    | Component, E2E, security                   |
| GP-37 | Upgrade compatibility                   | Decode and play existing account/rules versions across supported program upgrade fixture                             | Existing immutable snapshots retain identical interpretation and payouts; unknown versions become read-only                                     | Rust, Anchor, TS, E2E                      |
| GP-38 | Practice game separation                | Run unlimited local-CPU practice, rematch, timer and reveal flows                                                    | Rules are correct with no wallet or chain/ledger call; wager rematch cannot be entered implicitly                                               | Unit, component, E2E                       |
| GP-39 | 1v1 first-to-two completion             | Exercise decisive/tied sequences including `2-0`, `2-1`, and consecutive ties                                        | Match ends exactly at two non-tied round wins; ties award no point                                                                              | Rust, Anchor, property, E2E                |
| GP-40 | Every 2v2 paired scoring combination    | Exercise both wins, split wins, each one-tie/one-win orientation, and both ties                                      | Team round result matches the nine-row paired table; no cross-pair comparison occurs                                                            | Rust, Anchor, property                     |
| GP-41 | 1v1v1v1 required patterns               | Rock/Rock/Scissors/Scissors; all three types; all Paper; one Rock/three Scissors; two Paper/two Rock                 | Correct losing move holders lose exactly one life; all-same/all-three cause no loss                                                             | Rust, Anchor, property                     |
| GP-42 | 1v1v1v1 elimination and final pot       | Drive players from two lives to zero and leave one survivor                                                          | Eliminations occur after simultaneous life updates; last survivor receives entire net pot, never split                                          | Rust, Anchor, E2E, invariant               |
| GP-43 | Simultaneous finalist elimination guard | Trigger the specified edge-case fixture                                                                              | Pre-round finalist lives restore and sudden death continues; no invalid zero-survivor settlement                                                | Rust, Anchor, property                     |
| GP-44 | Automatic fallback elimination          | Time out a seat so verifiable automatic move creates a losing two-type set                                           | Proof/match/round/seat bind; expected life loss and automatic marker persist                                                                    | Anchor, oracle integration, E2E            |
| GP-45 | Consecutive tie safety                  | Reach regular and sudden-death non-elimination caps                                                                  | Snapshotted safety phases activate exactly; final unbiased survivor proof selects one active seat without reroll                                | Rust, Anchor, property, oracle integration |
| GP-46 | Backend restart mid-match               | Restart API/indexer/relayer in every phase                                                                           | Program match continues; services rebuild/reconcile; deterministic crank/settlement remains available                                           | Integration, E2E, fault injection          |
| GP-47 | Mobile wallet app switch                | Background/foreground around ready, commit and transaction approval                                                  | Route/session/pending signature restore; chain deadline remains authoritative; no duplicate action                                              | Mobile E2E                                 |
| GP-48 | Player disconnect after funding         | Close browser for one/more participants                                                                              | Match continues through snapshotted automatic fallback and settlement; no cancellation/refund escape                                            | Anchor, E2E, fault injection               |

## Spectating matrix

| ID    | Scenario                                   | Setup/action                                                                     | Expected result and explicit assertions                                                                                                       | Layers                                 |
| ----- | ------------------------------------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| SP-01 | Spectate open/funded/active/terminal match | Open each lifecycle state without participant wallet                             | Public fields and phase render correctly; spectator controls are read-only                                                                    | Component, E2E                         |
| SP-02 | Commitment privacy                         | Spectate before reveals                                                          | No plaintext move, salt, hidden client storage, or private analytics field is exposed                                                         | Component, E2E, security               |
| SP-03 | Reveal visibility                          | Observe one/both valid reveals                                                   | Only protocol-public data appears at the correct phase; result matches chain                                                                  | Component, E2E                         |
| SP-04 | Attempt participant action                 | Spectator calls commit, reveal, cancel, timeout, settlement, or withdrawal paths | UI does not offer unauthorized controls; program rejects forged calls                                                                         | Anchor, component, security            |
| SP-05 | Live updates                               | Players act while spectator watches                                              | Updates arrive once, in order after reconciliation, within freshness objective                                                                | TS, component, E2E, performance        |
| SP-06 | Missed/duplicate/reordered updates         | Inject subscription anomalies                                                    | Spectator view converges to authoritative account state without duplicate animation/result                                                    | TS, component, E2E                     |
| SP-07 | Disconnect/reconnect/refresh               | Interrupt spectator at every phase                                               | Snapshot restores correct phase and result; stale state visibly updates                                                                       | Component, E2E                         |
| SP-08 | Indexer lag                                | Discovery/history is stale but account is known                                  | Direct match page remains accurate; freshness warning displayed                                                                               | TS, component, E2E                     |
| SP-09 | Invalid/deleted match link                 | Open malformed, wrong-network, or closed-account identifier                      | Safe not-found/network message; no arbitrary account parsing or crash                                                                         | TS, component, security                |
| SP-10 | Wallet switching                           | Switch among disconnected, spectator, and participant wallets                    | Permissions recompute from chain identity; no stale participant controls                                                                      | Component, E2E                         |
| SP-11 | High spectator fan-out                     | Many clients watch active matches                                                | Read path remains within latency/error targets; participants are not starved                                                                  | Performance, soak                      |
| SP-12 | Privacy and analytics                      | Inspect logs/events during spectating                                            | No secret, full wallet identifier, or sensitive balance leaks; consent honored                                                                | Security, privacy                      |
| SP-13 | Terminal result accuracy                   | Spectate win, draw, timeout, refund, and disputed/unknown state                  | Labels match final program state and do not claim finality early                                                                              | Component, E2E                         |
| SP-14 | Incident mode                              | Live updates or indexer degraded                                                 | Read-only access continues with freshness/status messaging and polling fallback                                                               | Component, E2E, operations             |
| SP-15 | Privacy and spectating policy              | Toggle public, private, blocked-user, and non-spectatable matches                | Only policy-eligible matches appear; private invitations, risk signals, and non-opted profile data are absent from payloads                   | API contract, component, E2E, security |
| SP-16 | Configurable wager delay                   | Compare participant chain events with spectator delivery                         | Public wager events respect configured anti-collusion delay without delaying participant actions or canonical verification data beyond policy | Service, E2E, performance              |
| SP-17 | Approximate spectator count                | Vary real viewer count and inspect public API/UI                                 | Display is intentionally approximate where required and cannot be used as a precise presence oracle                                           | Service, component, privacy            |
| SP-18 | Hidden-field contract                      | Snapshot every spectator API/WebSocket schema in each phase                      | Move/salt/preimage, private invite, full wallet details, IP/device data, session key, and internal risk fields are structurally absent        | Contract, fuzz, security               |
| SP-19 | Independent verification view              | Verify win, draw, timeout, refund, finality pending, and tampered receipt        | Canonical bytes/hash, rules, signatures, rounds, deadline evidence, payout conservation, and finality verify; tampering fails visibly         | TS, component, E2E, property           |
| SP-20 | Public match visibility                    | Create waiting/active public matches                                             | Public matches are always watchable with allowed fields and correct chain freshness                                                           | API, component, E2E                    |
| SP-21 | Private spectator enabled/disabled         | Toggle creator's immutable spectator setting before funding                      | Outside viewers can watch only when enabled; setting cannot be changed after funding                                                          | API, Anchor snapshot, E2E              |
| SP-22 | Eliminated player remains watching         | Eliminate a 1v1v1v1 participant                                                  | Participant controls disappear, spectator presentation remains, hidden moves stay hidden                                                      | Component, E2E                         |

## Financial invariant matrix

Each invariant is checked after every instruction in deterministic tests and
across generated instruction sequences.

| ID    | Invariant                    | Assertion                                                                                                                                                         |
| ----- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FI-01 | Conservation                 | Initial controlled value plus explicit inbound transfers equals final controlled value plus explicit outbound transfers plus documented fees/rent effects.        |
| FI-02 | Vault solvency               | Vault assets are always greater than or equal to total user available balances plus locked liabilities and pending authorized claims.                             |
| FI-03 | No negative balances         | Available, locked, escrow, fee, and claim amounts are unsigned, checked, and never underflow.                                                                     |
| FI-04 | Exact lock                   | Funding moves exactly one wager from the defined source into exactly one match liability.                                                                         |
| FI-05 | Exact pot                    | A two-player funded pot equals both accepted wagers; no phantom or partially funded start state exists.                                                           |
| FI-06 | Terminal distribution        | For each terminal match, payouts plus protocol fee plus defined refund/dust treatment equal the pot exactly.                                                      |
| FI-07 | Single settlement            | A match enters one terminal state once and can produce no additional principal transfer.                                                                          |
| FI-08 | Withdrawal bound             | Cumulative successful withdrawals never exceed cumulative credited available balance minus prior withdrawals.                                                     |
| FI-09 | Locked isolation             | Withdrawal, cancellation, or another match cannot spend funds locked to an active match.                                                                          |
| FI-10 | Match isolation              | One match instruction cannot mutate another match's state, liability, vault accounting, or participant claim.                                                     |
| FI-11 | User isolation               | One signer cannot debit another user's available funds without explicit protocol-authorized terminal logic.                                                       |
| FI-12 | Fee bound                    | Charged fee matches configured formula and cap; fee destination is authorized and immutable for the transaction.                                                  |
| FI-13 | Integer exactness            | All financial calculations use checked integer base units with documented rounding; no floating-point accounting.                                                 |
| FI-14 | Failure atomicity            | Any rejected instruction leaves all program-controlled financial state unchanged.                                                                                 |
| FI-15 | Replay safety                | Replaying create/fund/join/reveal/settle/refund/withdraw instructions cannot duplicate value effects.                                                             |
| FI-16 | Account closure safety       | An account closes only with zero unresolved liability; rent goes only to the authorized destination.                                                              |
| FI-17 | Supply neutrality            | The program never creates or destroys token/native principal except through documented token mechanics, fees, or rent.                                            |
| FI-18 | Reconciliation equality      | Finalized transaction effects equal indexed/UI ledger effects; discrepancies are detected, not silently corrected.                                                |
| FI-19 | Pause neutrality             | Enabling/disabling an incident pause does not alter balances or terminal rights.                                                                                  |
| FI-20 | Timeout boundedness          | Timeout resolution transfers only the already-funded pot according to one documented branch.                                                                      |
| FI-21 | Reservation exclusivity      | A reservation belongs to exactly one wallet, asset, environment, match, and idempotency key and is consumed or released once, never both.                         |
| FI-22 | Double-entry ledger balance  | For each non-mainnet asset/environment ledger transaction, total debits equal total credits in integer base units.                                                |
| FI-23 | Projection rebuildability    | Available/reserved/pending snapshots, index records, and caches can be discarded and deterministically rebuilt from authoritative records without changing value. |
| FI-24 | Outbox atomicity             | An authoritative database mutation and its outbox record commit together or neither commits.                                                                      |
| FI-25 | Environment isolation        | Practice and non-mainnet wager records, queues, caches, events, assets, and programs never cross namespaces; mainnet value movement is denied.                    |
| FI-26 | Immutable funded terms       | Participants, stake, rules hash, fee, treasury, deadlines, timeout/tie policy, and payout destinations cannot change after funding lock.                          |
| FI-27 | Recovery destination safety  | Normal, emergency, and trapped-fund recovery can pay only immutable player payout keys and the snapshotted treasury within exact liabilities.                     |
| FI-28 | Fee cap                      | Snapshotted fee is within 0–500 bps, uses documented floor rounding, and configuration changes affect future matches only.                                        |
| FI-29 | Incomplete lobby neutrality  | Creating, joining, leaving, readying, timing out, expiring, or cancelling an unfunded lobby changes no player balance.                                            |
| FI-30 | Atomic multiplayer funding   | For 2- and 4-player modes, locked-player count is either zero or the full required count and every amount is exact.                                               |
| FI-31 | Failed withdrawal neutrality | Any failed/rejected/expired withdrawal leaves available and locked balances unchanged.                                                                            |
| FI-32 | 2v2 exact split              | Two winner credits plus fee equal pot; deterministic lower-seat remainder is at most one lamport.                                                                 |
| FI-33 | Practice zero authority      | Practice produces no program instruction, financial database mutation, wager statistic, or leaderboard contribution.                                              |
| FI-34 | No trapped terminal funds    | Every ordinary terminal state has a permissionless deterministic settlement/refund path with no claim deadline.                                                   |
| FI-35 | Default 2% fee case          | A 200 bps funded snapshot computes the exact floor-rounded fee and net credits.                                                                                   |
| FI-36 | Fee change affects new only  | Governance default changes appear only in later funded snapshots.                                                                                                 |
| FI-37 | Existing fee retained        | Active and completed matches continue using their original fee after configuration changes.                                                                       |
| FI-38 | 5% hard cap                  | 500 bps is accepted when authorized; 501 bps is rejected on-chain.                                                                                                |
| FI-39 | Winner credit exactness      | Settlement credits the calculated winner balance once without a separate claim.                                                                                   |
| FI-40 | No overpayment               | Across every mode and rounding edge, credits plus fee never exceed the funded pot.                                                                                |
| FI-41 | No duplicate credit          | Duplicate/reordered settlement, index, and relayer events produce one on-chain credit vector.                                                                     |

## Property, fuzz, and model-based testing

Create a reference state machine with lobby, funding, commit, reveal, timeout,
settlement, refund, withdrawal, pause, and account-close transitions. Generate
valid and invalid sequences with multiple users and matches. After every step,
compare the model with program accounts and assert all FI invariants.

Fuzz targets include:

- arbitrary move/commitment/salt bytes and domain-separation inputs;
- timestamps around all boundaries;
- wager, fee, balance, decimal, and integer-limit values;
- malformed, duplicate, reordered, substituted, writable, and aliased accounts;
- repeated and concurrent instruction sequences;
- serialization/deserialization and account-version migration inputs;
- provider events with gaps, duplicates, stale slots, and conflicting
  commitments;
- indexer records with omissions, duplicates, and reorg-like replacement;
- notification payload and analytics schema injection.

Every discovered failure becomes a minimized, deterministic regression test.

## Security test program

Security tests cover signer and ownership checks, PDA seeds and bumps, account
relationship constraints, executable/program IDs, token mint/authority checks,
arbitrary CPI prevention, reinitialization, account confusion, duplicate mutable
accounts, overflow/underflow, rounding extraction, replay, front-running
implications, commitment domain separation, weak salts, reveal theft, deadline
manipulation, denial of service, rent destination theft, upgrade/admin
authority, pause abuse, fee configuration, and supply-chain dependencies.

Client and service tests cover wallet-origin confusion, transaction simulation
mismatch, unsafe deep links, XSS/content injection, CSRF where applicable,
secret leakage to storage/logs/analytics, dependency compromise, rate-limit
bypass, notification phishing, RPC response validation, and indexer data treated
as untrusted.

## Performance and resilience testing

Before launch, measure:

- program compute units and transaction/account-size limits at worst-case
  inputs;
- RPC read latency and error rate under expected and burst traffic;
- primary-to-fallback failover and circuit-breaker recovery;
- WebSocket fan-out, reconnect storms, polling fallback, and event convergence;
- indexer throughput, catch-up time, duplicate handling, and maximum acceptable
  lag;
- transaction reconciliation backlog and recovery after provider outage;
- lobby query and rendering performance at target cardinality;
- concurrent join, settlement, timeout, and withdrawal contention;
- 24-hour soak with generated matches and invariant checks;
- client responsiveness on supported low-end devices and constrained networks.

Target volumes and pass thresholds must be set from product forecasts before
release; “no crash” is not an adequate performance criterion.

## Audit readiness

The audit package must contain:

- frozen scope: program crates, deployed program IDs, IDLs, SDK transaction
  builders, financial/indexer services, and privileged operational tooling;
- architecture, trust boundaries, account/state diagrams, instruction
  authorization matrix, and complete fund-flow diagrams;
- written protocol rules for lifecycle, deadlines, draws, timeouts, fees,
  refunds, settlement, withdrawals, and account closure;
- all invariants in this document mapped to enforcing code and tests;
- threat model and abuse cases, including malicious participant, spectator, RPC,
  indexer input, compromised client, and privileged operator;
- dependency and toolchain lockfiles, reproducible build instructions,
  compiler/Anchor/Solana versions, and binary verification procedure;
- admin/upgrade/pause authority inventory, multisig policy, key custody,
  rotation, and emergency procedures;
- test reports, coverage, fuzz corpus, known findings, accepted risks, and
  remediation evidence;
- static analysis and dependency vulnerability reports;
- deployment/migration/rollback strategy and account compatibility plan;
- monitoring, reconciliation, incident, and disclosure runbooks;
- auditor-ready repository tag/commit supplied by the owning team after this
  documentation phase.

No code changes enter audit scope without change control and auditor impact
assessment. All high and critical findings must be fixed and re-tested. Accepted
medium or lower findings require an owner, rationale, compensating control, and
review date.

## Audited mainnet beta checklist

- [ ] Protocol specification and user-facing rules are frozen and consistent.
- [ ] Rust, Anchor, TypeScript, component, E2E, property, fuzz, security,
      performance, and soak suites pass.
- [ ] Every BW, LF, GP, SP, and FI case is automated or has an approved manual
      procedure with retained evidence.
- [ ] Independent audit is complete; critical/high findings are closed and fixes
      reviewed.
- [ ] Reproducible build matches the intended deployable artifact and program
      ID.
- [ ] Upgrade, fee, treasury, pause, and deployment authorities use approved
      multisig/key custody.
- [ ] Mainnet configuration, mint/token settings, RPC genesis hash, commitment,
      and addresses are independently verified.
- [ ] Per-match, per-wallet, and aggregate beta value caps are enforced on chain
      where feasible.
- [ ] Primary/fallback RPC and WebSocket failover drills pass.
- [ ] Reconciliation, indexer rebuild, duplicate event, browser restart, and
      provider outage drills pass.
- [ ] Safe pauses preserve funded matches, settlement/refunds, and withdrawals
      unless a specific path is unsafe.
- [ ] Monitoring, SLO dashboards, invariant alerts, public status, and on-call
      escalation are live.
- [ ] Incident, vulnerability disclosure, user support, and communications
      procedures are staffed.
- [ ] Privacy, analytics, notification, legal, sanctions/compliance, and
      jurisdiction reviews are approved.
- [ ] Wallet compatibility and supported browser/device matrix pass.
- [ ] Terms, risk disclosures, fee disclosures, timeout behavior, and
      secret-recovery limitations are visible before funding.
- [ ] Treasury and fee-account reconciliation is independently validated.
- [ ] Backup access to required infrastructure and provider billing/rate limits
      is verified.
- [ ] Beta rollout, canary cohort, caps, stop conditions, and
      rollback/forward-fix criteria are approved.
- [ ] Post-launch review cadence and audit-triggering change policy are
      scheduled.

## Evidence and release policy

CI retains machine-readable results, validator logs, randomized seeds, coverage,
artifacts, and relevant signatures/account snapshots with secrets removed. Flaky
financial tests block release until root-caused. A release cannot waive a failed
invariant, authorization, replay, settlement, refund, or withdrawal test. Manual
tests require named tester, environment, build identifier, timestamp, evidence,
and expected/actual result.

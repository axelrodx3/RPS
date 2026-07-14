# Product Requirements

**Product:** RPS  
**Status:** Prompt 1 proposed baseline; no real-SOL functionality is enabled.

RPS is a dark, esports-inspired Solana Rock Paper Scissors platform. It must
feel competitive and transparent rather than casino-like. No system is described
as risk-free.

## Goals

- Free, unlimited, wallet-optional practice.
- Public and private equal-wager games in 1v1, 2v2, and 1v1v1v1.
- Program-authoritative deposited, available, locked, credited, and withdrawable
  SOL accounting.
- Private moves, program-computed results, automatic fair timeout moves, and
  independently verifiable completed matches.
- Public spectating, profiles, statistics, leaderboards, history, status,
  fairness, security, and Game Guide experiences.
- Mobile-first, accessible, reliable recovery from browser/provider failures.
- Reusable platform services and immutable game-rule modules.

## Explicit non-goals

- Public chat, direct messages, Ranked mode, seasons, reputation, or unlisted
  games.
- Automatic PvP matchmaking.
- Wagered CPU games; show **Play vs CPU — Coming Soon** only.
- Referral payouts, tournament play, arbitrary assets, lending, yield, credit,
  jackpots, or casino presentation.
- Mainnet or real-SOL operation before separate explicit approval, validated
  timeout/reveal design, audits, legal review, and readiness gates.

## Users and authority

| Role                    | Product capabilities                                                                       | Hard restrictions                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Visitor                 | Home, Guide, Fairness, Security, Status, public lobbies/watch/profiles, unlimited practice | Cannot enter funded flow                                               |
| Wallet-connected player | Wallet capability inspection and owner transactions                                        | Connection alone is not authentication or fund consent                 |
| Authenticated player    | Profile, lobby coordination, notifications, private invites, history                       | Backend session cannot withdraw or sign on-chain actions               |
| Scoped gameplay session | Ready, bounded fund consent, commits/reveals and allowed progression                       | No withdrawal, arbitrary transfer, payout/fee/destination/admin change |
| Spectator               | Public matches; permitted private matches; eliminated-player view                          | No participant action or hidden move/salt access                       |
| Moderator/operator      | Limited profile/status/incident/flag workflows                                             | No winner/move/score/history/payout control                            |
| Program governance      | Future defaults, capped fee, pauses and approved upgrades through multisig                 | Cannot modify funded terms or redirect individual funds                |

## Navigation and routes

Primary product navigation:

- Home
- Play
- Public Lobby
- Private Game
- Practice
- Watch
- Leaderboards
- Match History
- Profile
- Game Guide
- Fairness
- Security
- Status
- Balance
- Deposit
- Withdraw

The Game Guide remains visible from Home, lobbies, previews, active/spectator
matches, profiles, and history.

## Practice versus Play With SOL

The primary selection is a prominent segmented control:

`[ PRACTICE ] [ PLAY WITH SOL ]`

### Practice

- Free, unlimited, clearly labeled, and available without deposit or wallet.
- Uses a local CPU opponent for the initial release.
- Teaches private selection, timers, automatic moves, reveals, scoring, lives,
  and animations.
- Never affects wager statistics, leaderboards, balances, referrals, or on-chain
  state.
- A rematch cannot silently switch into a wager.

### Play With SOL

- Requires connected, authenticated wallet; supported capability; sufficient
  deposited RPS balance; active bounded gameplay authorization; and all
  environment/policy gates.
- Shows wager per player, player count, total pot, fee, exact potential payout,
  rules version, timers, fallback method, network, and available balance before
  Ready.
- Disabled in Prompt 1, previews, and mainnet until explicitly approved.

## Brand and design

- Dark black/charcoal/neutral surfaces, white text, one replaceable accent,
  strong contrast, clean typography, responsive cards, and restrained motion.
- Centralized logo, wordmark, favicon, social image, artwork, avatars,
  achievements, backgrounds, reveals, and victory/defeat asset references.
- No wrench/tool/hardware mascot, casino/slot imagery, flashing urgency, fake
  activity, fake players, or fake wagers.
- Design tokens cover color, typography, spacing, radius, shadow, motion,
  z-index, breakpoints, and audio preferences.
- Respect reduced motion and never obscure a timer or transaction status.

## Wallets and authentication

- Use current official Solana React patterns and Wallet Standard auto-discovery.
- Target Phantom and Solflare testing. MetaMask is advertised only if compatible
  Solana support is exposed and tested. Other standard wallets appear under
  **More Wallets** as detected-not-fully-tested until certified.
- Do not advertise Rabby without confirmed native Solana connection/signing.
- Test extensions, mobile deep links, mobile browsers, and in-wallet browsers.
- Classify each integration: **Tested**, **Detected but not fully tested**, or
  **Unsupported**.
- Never request seed/recovery phrases, private keys, secret files, or arbitrary
  unlimited signing authority.

Wallet ownership is primary identity. Authentication uses a human-readable,
domain/URI/purpose/wallet/network/time/nonce-bound signed message. Challenges
are single-use and short-lived. Login does not approve a transaction or wager.

## Profiles and usernames

Profiles include username, truncated wallet address, built-in avatar, join date,
completed matches, wins/losses/win percentage, current/best streak, largest win,
lifetime winnings/wagered/fees, favorite mode, recent matches, active public
match, and later achievements/cosmetics.

Usernames are:

- unique under consistent case-insensitive normalization;
- length/boundary constrained and safely escaped;
- checked for reserved names, profanity/abuse, invisible/confusable Unicode, and
  impersonation;
- rename-cooldown protected with moderator-visible history; and
- always displayed with a wallet address to reduce impersonation.

Initial avatars are built-in only. There is no public chat.

## RPS balance, deposits, and withdrawals

The Solana program—not PostgreSQL—is authoritative. Each owner has program
accounting for available, locked, credited/claim receipt view, pending
withdrawal where required, lifetime deposits, and lifetime withdrawals. The
pooled vault must remain solvent against all liabilities.

### Deposit

1. Connect owner wallet and open Balance/Deposit.
2. Enter amount; review exact amount and estimated network fee.
3. Sign a clear owner deposit transaction.
4. Show submitted/processing states without optimistic credit.
5. Confirm only after required chain confirmation and account reconciliation.

### Withdrawal

1. Choose partial or all available balance.
2. Review exact amount, destination owner wallet, and estimated network fee.
3. Owner signs withdrawal.
4. Program excludes active-match funds, enforces nonce and owner destination,
   debits/transfers atomically, and writes one receipt.
5. Failed/rejected transactions do not reduce balance; successful instructions
   cannot replay.

Funds have no claim deadline. V1 cannot change withdrawal wallet. Admins and
gameplay sessions cannot redirect or invoke withdrawal.

## Wagers and fees

- Default presets: 0.25, 0.50, 1, and 2 SOL.
- Every player may edit all four personal presets and enter a custom amount.
- Program-configured minimum/maximum and available-balance validation.
- Labels always distinguish wager per player and total pot.
- Default fee 200 bps of total pot; hard maximum 500 bps.
- Checked integer lamport arithmetic with floor fee rounding.
- Funded match stores fee and payout formula; future changes have no effect.
- Production default changes use multisignature authorization.
- Fee plus all winner credits equals funded pot exactly.

## Public and private lobbies

Only **Public** and **Private** visibility exist.

### Waiting and ready

- Joining a waiting seat never reduces, reserves, or locks balance.
- Players may leave freely; no refund transaction or fee exists.
- Presence leases expire and repeated seat blocking is rate-limited.
- Once full, show roster and final exact terms, allow pre-lock team selection,
  and begin a 30-second ready check.
- Each Ready action creates explicit match-specific consent but still does not
  debit funds.
- The program verifies all unique players, balances, authorizations, seats,
  terms, and consent then locks every wager in one atomic instruction.
- Any failure leaves all balances unchanged, removes/reopens the appropriate
  seat under published policy, and explains the reason.
- Once funded/active, nobody cancels, leaves for refund, or changes team/seat.

Seat states: Available, Joining, Occupied, Disconnected, Selecting team, Ready,
Funding, Funded, Locked, Active, Eliminated, Completed.

### Public

- Listed in the public lobby and always spectatable.
- Any eligible wallet may join an available seat.
- Creator cannot reject/kick valid joiners or change terms after occupancy.
- Cards show creator username/address/avatar, mode, wager per player, expected
  pot/net payout, occupied/total seats, waiting time, record/win rate, network,
  Join/Profile/Rules actions.
- Filters: mode, min/max wager, newest, longest waiting, largest wager, and
  available seats. Use cards, not dense tables.

### Private

- Not listed publicly.
- One cryptographically secure invite code and shareable link; native mobile
  share where supported.
- Code is enumeration-resistant, rate-limited, hash-stored, and invalid after
  lobby expiry/closure. It grants no wallet or fund authority.
- One invite permits any available seat; 2v2 players choose available teams.
- Creator chooses outside spectator permission before funding.

## Game modes

Normative details and examples are in
[Game Rules and Fees](07-game-rules-fees.md).

- **1v1:** first player to win two non-tied rounds; winner receives net pot.
- **2v2:** fixed paired matchups; first team to win two rounds; net pot splits
  equally into two independent winner credits.
- **1v1v1v1:** four-player elimination, two lives each; exactly two move types
  causes losing-move holders to lose a life; last survivor receives full net
  pot, never split.

Initial move timer is 20 seconds with a five-second warning. Funded rules store
the timer and excessive-tie safety policy.

## Fairness and automatic moves

- Canonical binary commit encoding binds domain, program, cluster, match, rules,
  round, wallet, seat, move, and 32-byte salt.
- No ambiguous concatenated strings; Rust and TypeScript share golden vectors.
- Program independently verifies reveal/fallback evidence, resolves rounds and
  matches, and settles once.
- Backend/spectators/teammates cannot see moves early.
- A timed-out player receives a verifiably random move that works after browser
  closure without wallet private key and has no transfer/withdrawal authority.

VRF alone does not prevent profitable selective non-reveal. Real-SOL stays
disabled until a timed/threshold reveal or equivalent design passes
cryptographic, game-theoretic, liveness, operational, and on-chain-verification
review.

## Gameplay sessions

Wallet-authorized ephemeral Ed25519 sessions are short-lived and program-scoped.
They bind allowed action discriminators, match/seat where applicable, expiry,
nonce/revocation epoch, maximum wager/cumulative exposure, action count, and
sponsored-fee cap. Users can inspect, revoke one, or revoke all.

Browser refresh/app switch should recover protected local session state where
available. Loss falls back to owner reauthorization or deterministic match
timeouts; support cannot impersonate the wallet. Session compromise risk is
disclosed and bounded, not described as eliminated.

## Spectating and live presentation

Public matches are always spectatable; private creators choose outside access
before funding. Spectators see players/addresses/avatars, mode,
wager/pot/fee/net payout, score/round/lives, previous results, commit/reveal
status, timer, match status, public stats, approximate count, explorer links,
and Rules.

Before permitted reveal they see only locked/not-locked/waiting/timer statuses.
They never receive selected moves, salts, local secrets, backend guesses, or
private transaction contents. Counts are approximate and deduplicated/rate
limited. Eliminated 1v1v1v1 players remain spectators.

Match UI uses large player/team panels, clear score/lives/pot/timer, restrained
reveal/round/match animations, return-to-lobby, Collect Winnings
acknowledgement, Verify Match, and replay/history foundations.

## Guide, verification, safety, and status

The **Game Guide** explains practice/wager, deposits/balances/withdrawals, fees,
public/private waiting/ready/locking, automatic moves, privacy, commit-reveal,
spectating/settlement, all mode rules/examples, ties/timeouts, and FAQ.

Completed **Verify Match** views show program/match/rules, fee, players/seats/
teams/wagers, commitments, revealed/automatic moves, calculations, winner,
credits, settlement transaction, and explorer links in plain English.

The **Fairness** and **Security** pages explain assumptions and anti-phishing
guidance without guarantees. The public **Status** page supports Normal,
Degraded, New games paused, Read-only, Maintenance, and Emergency plus service
messages such as RPC degraded or spectator updates delayed.

## Statistics, history, leaderboards, and referrals

Normal wagered matches contribute to statistics without being called Ranked.
Boards may cover wins, qualified win percentage, lifetime winnings, largest win,
total wagered, streak, games, biggest pot, and each mode.

Exclude practice, cancelled/refunded/duplicate records, testnet data from
production boards, prohibited self-play, and flagged suspicious clusters.

History includes mode, opponents/teams, wager/fee/result/net, round moves after
reveal, automatic markers, match address, settlement, balance credit, explorer,
and Verify Match.

Referral foundation stores code, referrer/referred wallets, created date, first
legitimate completed wager, qualification, suspicious activity, and reversal.
Self/circular/wash/fake-profile abuse is monitored. Economics and payouts are
disabled.

## Accessibility, mobile, audio, and notifications

- WCAG 2.2 AA target, keyboard operation, focus-managed dialogs, screen-reader
  labels/live regions, high contrast, 44px touch targets, reduced motion, and no
  color-only meaning.
- Test mobile connect, deposit, join, team, ready, move, app-switch recovery,
  active-match return, and withdrawal.
- Persistent header speaker/mute and volume; desktop hover/focus slider; mobile
  tap panel; no loud autoplay; architecture for separate effects/music.
- In-site, sound, and optional browser notifications for lobby filled, ready,
  match start, five-second warning, round/match result, credit, withdrawal,
  delays, maintenance, and return-to-match—never unrevealed moves.

## Administration and expansion

Admin can manage flags, new-game pause, monitoring, failed settlement/delayed
withdrawal views, status banners, future-match fee/wager limits, username/avatar
moderation, leaderboard config, referral review, analytics, and incidents.

Feature-flag boundaries exist for CPU wagering, future automatic matching,
tournaments, games, cosmetics, achievement rewards, borders, streamer tools,
result cards, audio/animation, and wallets. Shared auth, balances, lobbies,
invites, profiles, spectating, stats, referrals, notifications, status, and
administration remain separate from isolated immutable RPS rule modules.

## Acceptance gates

- Preview/local environments display a non-production banner and cannot accept
  real SOL.
- Practice works with wallet/RPC/backend unavailable and cannot mutate finance.
- All requested state, rules, financial invariant, security, and failure tests
  in [Testing and Audit Readiness](12-testing-audit-readiness.md) pass before
  their respective phase.
- Funded flow cannot start with partial participants or changed terms.
- Every ordinary terminal state has deterministic non-admin settlement/refund.
- Mainnet requires explicit separate authorization; audits reduce but do not
  eliminate risk.

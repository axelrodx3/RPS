# Current Repository State

**Last verified:** 2026-07-14  
**Working directory:** `C:\Users\jaide\OneDrive\Desktop\RPS`

## Starting state

The target folder and GitHub repository were both empty:

- no files or hidden project configuration;
- no local `.git`, commits, branches, or remote;
- GitHub `axelrodx3/RPS` existed but had no branches or commits;
- no application, Solana program, backend, database, tests, or documentation;
- no local Vercel linkage.

There was no existing work to overwrite and no implementation conflict.

## Git

The empty GitHub repository was cloned into the exact target directory.

| Item              | Current value                                              |
| ----------------- | ---------------------------------------------------------- |
| Branch            | `main` (unborn; no commits)                                |
| Origin fetch/push | `https://github.com/axelrodx3/RPS`                         |
| Commit history    | None                                                       |
| Working tree      | Prompt 1 files are untracked and intentionally uncommitted |
| Push/PR/tag       | None                                                       |

## Vercel

| Item                                  | Current value                                                  |
| ------------------------------------- | -------------------------------------------------------------- |
| Existing project                      | `axes-projects-c08a9d9a/rps`                                   |
| Project ID                            | `prj_FLL0rD159hy1B5f1KLjn5IHENZe0`                             |
| Root directory                        | `.`                                                            |
| Configured Node setting at inspection | `24.x`                                                         |
| Initial framework preset              | Other                                                          |
| Local link                            | Created in ignored `.vercel/` metadata                         |
| Production URL (Ready)                | `https://rps-rouge.vercel.app`                                 |
| Latest production deployment          | `https://rps-386cltrav-axes-projects-c08a9d9a.vercel.app`      |
| Team production alias                 | `https://rps-axes-projects-c08a9d9a.vercel.app`                |
| Latest preview deployment             | `https://rps-feem9sngj-axes-projects-c08a9d9a.vercel.app`      |
| Stable preview alias                  | `https://rps-axelrodx3-1237-axes-projects-c08a9d9a.vercel.app` |

The preview build completed successfully. Team deployment protection redirects
unauthenticated browser sessions to Vercel login; this is a preview-access
warning, not an application runtime failure.

## Implemented in Prompt 1

- Root pnpm/Turborepo configuration and strict TypeScript/format tooling.
- Minimal Next.js foundation preview in `apps/web`.
- Centralized placeholder brand references/assets and dark design tokens.
- Persistent non-production/no-real-SOL notice.
- Disabled wallet, Play With SOL, Practice, deposit, withdrawal, admin, and CPU
  wager controls; no transaction or Solana client is active.
- Security headers, no-index metadata, reduced-motion CSS, responsive layout,
  and one safety configuration test.
- The complete architecture documentation and proposed ADR set.

## Not implemented

- Wallet connection/authentication, gameplay, lobbies, spectating, profiles,
  backend/API, database/Redis, indexer, relayer/crank, admin dashboard.
- Anchor/Rust program, accounts, deposits, balances, withdrawals, funding,
  commit/reveal, randomness/fallback, settlement, or program deployment.
- Devnet or mainnet configuration, real SOL, production secrets, or production
  Vercel deployment.

## Safety status

- `NEXT_PUBLIC_ENABLE_REAL_SOL`, wagering, deposit, withdrawal, and admin
  example flags default false.
- Example network is devnet and has no RPC/program credential.
- Mainnet has no fallback.
- Real-SOL work remains blocked by implementation/audit/readiness gates and the
  unresolved selective non-reveal problem documented in ADR 005.

This is a planning foundation, not an audited or production wagering system.

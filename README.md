# RPS

RPS is a planned competitive, esports-inspired Rock Paper Scissors platform on
Solana. This repository is currently in **foundation planning**. Wagering,
deposits, withdrawals, wallet transactions, and administrative controls are not
implemented or enabled.

> **Non-production:** local and preview environments use safe development
> configuration. They must not accept real SOL.

## Prompt 1 scope

- Product, system, on-chain, backend, frontend, security, and operations design
- Explicit balance, lobby, and match state machines
- Threat-modeled protocol decisions and financial invariants
- Testing, audit, expansion, and mainnet-readiness plans
- A static preview that communicates the foundation status

Start with the [documentation index](docs/README.md).

## Local preview

Prerequisites: Node.js 22–24 and pnpm 10.34.5 (Corepack recommended).

```bash
pnpm install
pnpm dev
```

Run all available validation:

```bash
pnpm validate
```

## Safety

- No seed phrase, recovery phrase, private key, or unrestricted signing key is
  ever required.
- No production or mainnet configuration belongs in source control.
- The Solana program—not the website database—will be authoritative for funds
  when wagering is eventually implemented and approved.
- Real-SOL functionality remains blocked until the protocol is implemented,
  independently audited, tested, and explicitly approved.

## Repository status

There are no commits yet. Changes are intentionally left uncommitted until the
project owner approves a milestone.

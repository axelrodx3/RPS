# ADR 001: Program-Accounted SOL Balances

## Status

Proposed

## Context

The platform needs to hold player funds for wagers, settle matches, and collect
platform fees. Creating a separate on-chain vault for every wallet or match
would make ownership boundaries obvious, but would also increase account
creation, rent, transaction size, and lifecycle complexity.

A pooled vault can reduce those costs, but its lamports are not inherently
partitioned by wallet. The program must therefore treat its ledger, rather than
the vault's raw balance, as the source of each wallet's spendable funds. This
concentrates accounting risk: an authorization, arithmetic, or reconciliation
defect could affect multiple users.

## Decision

Use one program-controlled pooled SOL vault with program-accounted balances per
wallet and a separately accounted treasury balance.

- Deposits transfer SOL into the vault and credit only the depositing wallet's
  ledger balance.
- Only successful all-participant `fund_match` moves a player's amount from
  available to match-locked; waiting lobby join/leave/ready never reserves or
  debits value. Settlement moves locked value to explicit credits and treasury
  accounting without inferring ownership from raw vault balance.
- Platform fees accrue to a treasury ledger entry distinct from player
  liabilities.
- Withdrawals debit an authenticated wallet's available balance and transfer no
  more than that debit.
- Checked integer arithmetic, explicit state transitions, and conservation
  checks are required.
- The vault must retain rent-exempt minimums and enough lamports to cover
  recorded player liabilities and treasury obligations.
- Administrative authority must not be able to relabel player balances as
  treasury funds.

The exact account layout, reconciliation cadence, and upgrade controls remain
implementation decisions subject to the gates below.

## Alternatives

- **Vault per wallet:** stronger account-level isolation, but higher rent and
  account-management overhead.
- **Vault per match:** clear wager segregation, but substantial account churn
  and cleanup complexity.
- **Direct wallet-to-wallet settlement:** minimizes custody, but complicates
  atomic funding, fees, cancellations, and unavailable counterparties.
- **Tokenized internal balances:** composable, but introduces token-program
  complexity and does not remove reserve-management risk.

## Threat analysis

- Ledger credits could be created without a matching SOL transfer.
- Reentrancy-like CPI sequencing or partial state updates could cause double
  credits or withdrawals.
- Integer overflow, underflow, rounding, or duplicate instruction processing
  could violate conservation.
- A compromised upgrade or administrative authority could redirect vault funds
  or mutate accounting.
- Treasury withdrawals could consume lamports backing player liabilities.
- Account substitution, signer confusion, or incorrect PDA derivation could
  debit one wallet and pay another.
- Unexpected direct transfers into the vault could make raw lamports exceed
  ledger totals; they must not become player credit automatically.
- Rent changes, account closure mistakes, or external program behavior could
  reduce usable reserves.

These controls reduce risk but do not prove solvency or eliminate shared-vault
blast radius.

## Consequences

- Fewer vault accounts and simpler funding flows are expected.
- Every balance-changing instruction becomes security-critical and must preserve
  global invariants.
- Auditing, reconciliation, incident response, and upgrade governance carry more
  weight than with segregated custody.
- Raw vault balance cannot be presented as any user's balance.
- A defect may affect the whole pool, so conservative caps and staged rollout
  are appropriate.

## Validation gates

- Property tests demonstrate conservation across arbitrary deposit, reserve,
  settle, cancel, fee, and withdrawal sequences.
- Tests prove a wallet cannot spend, reserve, or withdraw another wallet's
  balance.
- Tests prove treasury withdrawals cannot reduce reserves below player
  liabilities plus required rent.
- Duplicate, reordered, failed, and partially constructed transactions leave
  accounting consistent.
- Reconciliation tooling independently compares vault lamports, rent reserve,
  player liabilities, reserved wagers, and treasury balance.
- Account-substitution and signer-negative tests cover every balance-changing
  instruction.
- Independent security review examines arithmetic, CPI ordering, PDA
  constraints, upgrade authority, and insolvency paths.
- Real-SOL limits remain low until sustained testnet/devnet reconciliation shows
  no unexplained variance.

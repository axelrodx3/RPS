# ADR 004: Commit-Reveal Encoding

## Status

Proposed

## Context

Commit-reveal gameplay depends on every implementation hashing exactly the same
bytes. Text concatenation, JSON, locale-sensitive formatting, implicit integer
widths, and inconsistent public-key or nonce representations can produce
incompatible commitments or ambiguous preimages.

The protocol is expected to have Rust on-chain code and TypeScript clients.
Compatibility must be specified independently of either language's default
serialization behavior.

## Decision

Adopt the fixed SHA-256 canonical binary commitment preimage specified in
[Fairness, Sessions, and Randomness](../09-fairness-sessions-randomness.md) and
publish golden Rust and TypeScript test vectors. It binds the fixed domain,
program ID, cluster/genesis identifier, match PDA, rules hash, round, player
wallet, seat, move, and 32-byte salt using explicit widths and little-endian
integers.

The encoding specification must assign, in order:

- a protocol-domain separator and encoding version;
- fixed action or game identifiers;
- match and participant identifiers;
- the committed move encoded as a constrained numeric discriminant;
- a cryptographically appropriate nonce with a fixed byte length; and
- any additional context required to prevent cross-game, cross-version,
  cross-match, or cross-player replay.

Each field has a fixed order, byte width, and byte order. Variable-length
fields, if unavoidable, use explicit fixed-width length prefixes and bounded
lengths. Public keys and hashes use their raw fixed-length bytes. No JSON,
delimiter-based text concatenation, platform-native integer layout, or implicit
string encoding is part of the commitment format.

The commitment is SHA-256 of the complete canonical preimage. The normative
field table is versioned independently from implementation language. Golden
vectors include normal cases and boundary values, and contain semantic inputs,
preimage bytes, and expected digest.

## Alternatives

- **Canonical JSON:** human-readable, but canonicalization and number/string
  handling add avoidable cross-runtime risk.
- **Framework serializer output:** convenient, but ties a durable protocol to
  serializer details and upgrades.
- **Delimited strings:** easy to inspect, but prone to encoding, escaping, and
  ambiguity errors.
- **ABI-defined structures:** potentially suitable, but only if the ABI is
  frozen and independently documented with vectors.

## Threat analysis

- Ambiguous field boundaries could allow different semantic inputs to share a
  preimage.
- Missing domain, game, match, player, or version binding could permit replay in
  another context.
- Low-entropy nonces could permit brute-force discovery of moves.
- Endianness, signedness, Unicode, or number precision differences could split
  Rust and TypeScript behavior.
- An out-of-range move could be normalized differently by clients and the
  program.
- Logging preimages or nonces before reveal could disclose moves.
- A future format change without version separation could make old commitments
  valid under new semantics.

Canonical encoding addresses representation risk, not nonce secrecy, hash
implementation defects, or reveal liveness.

## Consequences

- Cross-language behavior becomes reproducible and reviewable.
- Encoding changes require an explicit version and migration strategy.
- Human debugging requires tooling to decode binary preimages.
- Client implementations cannot use convenient ad hoc serialization.
- Golden vectors become protocol artifacts and must be reviewed like code.

## Validation gates

- A normative field table fixes order, widths, endianness, bounds, domain
  separator, version, and hash function.
- Rust and TypeScript independently generate identical preimage bytes and hashes
  for every golden vector.
- Each language verifies vectors produced by the other implementation rather
  than sharing one serializer.
- Boundary vectors cover minimum and maximum discriminants, all-zero and
  high-byte identifiers, and invalid lengths or ranges.
- Mutation tests show that changing any bound semantic field changes the
  preimage and expected commitment.
- Fuzz tests compare both implementations over generated valid inputs and reject
  malformed encodings consistently.
- Tests confirm nonce generation uses an appropriate cryptographic random source
  and required entropy.
- Protocol review confirms replay domains and version migration behavior before
  real-value use.

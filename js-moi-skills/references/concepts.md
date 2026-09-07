# MOI & Coco concepts (what the SDK models)

Background for everything else. MOI is the chain; Coco is the smart-contract
language; js-moi-sdk is the client. Verified against the js-moi-sdk sources
(v0.7.1).

## The chain in one paragraph

MOI is an **account-based, state-sharded** blockchain. State is partitioned per
*participant* (an account, an asset, or a logic). Each interaction declares the
participants it touches and a **lock type** per participant; non-overlapping
interactions run in parallel. A "block" is a **tesseract** — but there is no
single global chain of blocks: **each participant has its own chain of
tesseracts and its own monotonic `height`**. Smart contracts are **logics**,
written in **Coco**, invoked through **routines** (a.k.a. callsites/endpoints).

## Identifiers (32-byte)

Every account, asset, and logic is a **32-byte Identifier**, rendered as `0x` +
64 hex chars. Byte 0 encodes the *kind* (high nibble) and *version* (low
nibble). Observed leading bytes:

| Kind | Byte-0 nibble | Typical prefix | Example |
|---|---|---|---|
| Participant / account | `0` | `0x00000000…` | user & sub-account ids |
| Asset (MAS token) | `1` | `0x10…` / `0x1003…` | `KMOI_ASSET_ID` starts `0x1080…` |
| Logic | `2` | `0x20…` / `0x20000000…` | deployed logic ids |

`KMOI` (the native fuel token) is just an asset id — `KMOI_ASSET_ID` is exported
by the SDK. See `identifiers.md` for the full byte layout (tag, flags,
standard, fingerprint, variant) and the typed wrappers.

## Accounts: primary vs inherited sub-accounts

- A **primary account** is derived from a mnemonic + BIP-44 path (SDK default
  `m/44'/6174'/0'/0/0`).
- A primary can create **inherited sub-accounts** *under a logic*. A
  sub-account's address = the primary's first **28 bytes** + a 4-byte
  big-endian **sub-account index** (the identifier "variant"). So sub-account
  *n*'s address is the primary with its last 4 bytes replaced by *n*, and you
  can recover the index from the last 4 bytes of a sub-account address.
- **Why sub-accounts exist:** an inherited sub-account has its own *actor
  state* under the logic. Coco logics that keep per-caller state (`Sender.*`)
  require the caller to be an account inherited under that logic — a bare
  primary has no actor slot there. Read-only or purely-stateless routines don't.
- Created with the **`AccountInherit`** builder (see `assets.md`), targeting the
  logic id at an index, seeded with KMOI so it can pay fuel.
- In the SDK, a wallet acts as a sub-account via `wallet.setSubAccountId(index)`
  (this sets the identifier `variant`). Omit / index 0 = the primary.
- An account is "linked" to a logic when its `getContextInfo(id)` shows the
  logic among its context nodes.

## Assets (MAS standard)

Assets implement a MAS standard (`AssetStandard`: `MAS0=0, MAS1=1, MAS2=2,
MASX=65535`). MAS0 endpoints include `Transfer`, `TransferFrom`, `Mint`,
`Burn`, `Approve`/`Revoke`, `Lockup`/`Release`, `BalanceOf`, and metadata
getters/setters. Balances live **on the holder accounts**, not in the asset's
own state — so in an interaction the asset is usually listed as a participant
with `NO_LOCK`, while the accounts whose balances change are `MUTATE_LOCK`.

- `Lockup(beneficiary, amount)` escrows the caller's balance;
  `Release(benefactor, beneficiary, amount)` un-escrows. Used for escrow flows.
- Holdings: `provider.getTDU(addr)` → `[{asset_id, token_id, amount}]`; a single balance:
  `provider.getBalance(addr, assetId)`.

The `MAS0AssetLogic` / `MAS1AssetLogic` / `MAS2AssetLogic` classes wrap these —
see `assets.md`.

## Lock types

Each participant in an interaction declares a lock (`LockType` in
`js-moi-utils`; lower number = stronger):

| Lock | Value | Meaning |
|---|---|---|
| `MUTATE_LOCK` | 0 | read+write; serializes with other mutators of that participant |
| `READ_LOCK` | 1 | read-only consistent snapshot |
| `NO_LOCK` | 2 | no consistency lock — maximal parallelism |

Conventions: a stateless logic → `NO_LOCK`; assets in transfers → `NO_LOCK`
(but still *listed*); accounts whose state changes → `MUTATE_LOCK`. **The sender
is auto-added as `MUTATE_LOCK` by the SDK** — don't duplicate it. Getting locks
wrong is a common failure: too strong stalls/serializes; a missing participant
gives "actor not found" at execution. The SDK also auto-derives some
participants from the op type (see `interactions.md`).

## Fuel and nonces

- **Fuel is paid in KMOI.** `fuel_price` defaults to `1` (`DEFAULT_FUEL_PRICE`),
  `fuel_limit` defaults to `10000` (`DEFAULT_FUEL_LIMIT`). The chain **reserves
  the full `fuel_limit`** (price × limit) up front and refunds the unused part —
  so `fuel_limit` must be ≤ the signer's KMOI balance even when the op is cheap.
- **Nonce / sequence is per (account, key).** `.send()` auto-fetches it. Two
  concurrent sends from one signer grab the same nonce → the chain rejects one.
  Serialize sends per signer, or pass an explicit `sequence` in the send option
  to replace a stuck one (with a higher fuel_limit).
- The logic `.send()` path **auto-estimates `fuel_limit`** when you omit it
  (calls `estimateFuel`); pass it explicitly to skip the estimate.

## Events and logs

Coco `emit` produces logs. A log is
`{ id, topics: string[], data, ix_hash, ts_hash, participants }`.

- **`topics[0..]` are signature hashes** (`topicHash(eventName)` and per
  `topic`-declared fields), **not** the field values. Identify the event by
  matching `topicHash(name)` against the topics.
- The **canonical field values live in the POLO-encoded `data` document** —
  decode it with the event schema (`ManifestCoder.decodeEventOutput`, or a
  hand-built `js-polo` `Document` schema). Reading a field from `topics[N]`
  gives a hash-of-a-value, not the value.
- Because a `NO_LOCK` logic's own height never advances, you generally **cannot
  list "all logs for logic X"** by the logic id. Two working patterns: subscribe
  to new tesseracts / `newLogs` over WebSocket for live discovery; or read one
  **known sender's** history with a ranged `getLogs({ id: sender, height:[0,
  head] })`. See `patterns.md`.

## Interaction lifecycle (SDK view)

1. Build an operation via a high-level helper. `driver.routines.X(...)` and
   `new MAS0AssetLogic(id, signer).transfer(...)` return an
   `InteractionContext` directly; builder-style helpers like
   `new AccountInherit(signer).target().value().index()` need a final
   `.build()` to produce one (the builder's own `.send()` takes NO options —
   see `assets.md`).
2. On the context: `.send(option)` commits it (signs + broadcasts, returns
   `{hash, wait, result}`); `.call(option)` simulates read-only;
   `.estimateFuel(option)` estimates; `.ixData(option)` returns the assembled
   interaction object.
3. Confirm with `await resp.wait(timeoutSeconds)` (polls the receipt) and/or
   `await resp.result()` (decoded per-op output). See `logic.md` and
   `patterns.md`.

## Routine / callsite flavors (Coco)

A manifest routine has `kind` (`invoke` | `enlist` | `deploy`) and `mode`
(`static` | `dynamic`). Loosely:

- **dynamic** — may read and mutate state → use `.send()`.
- **static** — read-only state access → use `.call()`.
- ("pure" endpoints that touch no state — e.g. a hash computation or a pure
  broadcast that only emits — are `static` and are used via `.call()` or `.send()`
  depending on whether they emit.)

The SDK exposes `routine.isMutable()` (true for `dynamic`) but does not force
the choice — you decide `.send()` vs `.call()`.

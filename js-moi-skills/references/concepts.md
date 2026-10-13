# MOI & Coco concepts (what the SDK models)

Background for everything else. MOI is the chain; Coco is the smart-contract
language; js-moi-sdk is the client. Verified against the js-moi-sdk sources
(v0.9.0-rc2); chain-side facts are taken from the SDK's own source comments and
release notes, which mirror the node (go-moi) rules.

## The chain in one paragraph

MOI is an **account-based, state-sharded** blockchain. State is partitioned per
*participant* (an account, an asset, or a logic). Each interaction declares the
participants it touches and a **lock type** per participant; non-overlapping
interactions run in parallel. A "block" is a **tesseract**, but there is no
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
| Asset (MAS token) | `1` | `0x10…` | `KMOI_ASSET_ID` starts `0x1080fffe…` |
| Logic | `2` | `0x20…` / `0x20000000…` | deployed logic ids |

`KMOI` (the native fuel token) is just an asset id; `KMOI_ASSET_ID` is exported
by the SDK and **its value changed in 0.9.0** (bytes 2 and 3 now carry its
standard, `0xfffe`). A new logic or asset id is derived from the creating
interaction's sender, sequence and key id, so it can be **predicted before the
interaction lands** (`deriveLogicId`/`deriveAssetId`, `identifiers.md`). See
`identifiers.md` for the full byte layout (tag, flags, standard, fingerprint,
variant) and the typed wrappers.

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
  require the caller to be an account inherited under that logic; a bare
  primary has no actor slot there. Read-only or purely-stateless routines don't.
- Created with the **`AccountInherit`** builder (see `assets.md`), targeting the
  logic id at an index, seeded with KMOI so it can pay fuel.
- In the SDK, a wallet acts as a sub-account via `wallet.setSubAccountId(index)`
  (this sets the identifier `variant`). Omit / index 0 = the primary.
- An account is "linked" to a logic when its `getContextInfo(id)` shows the
  logic among its context nodes.
- Accounts do not exist until something creates them: a `PARTICIPANT_CREATE`
  from a funded account, the wallet app, or the Voyage faucet for an account
  that is already on chain. After a devnet reset every old account is gone
  (`"account not found"`).

## Assets (MAS standards)

Assets implement a MAS standard (`AssetStandard`: `MAS0=0, MAS1=1, MAS2=2,
MASN=65534, MASX=65535`):

- **MAS0**: fungible. Endpoints `Transfer`, `TransferFrom`, `Mint`,
  `MintWithMetadata`, `Burn`, `Approve`/`Revoke`, `Lockup`/`Release`, reads
  `Symbol`, `BalanceOf`, `Creator`, `Manager`, `Decimals`, `MaxSupply`,
  `CirculatingSupply`, metadata getters/setters.
- **MAS1**: single-unit tokens (NFT-like), every op moves a `token_id`,
  `max_supply` fixed at 1, no decimals.
- **MAS2**: semi-fungible, `token_id` + `amount`.
- **MASN** (new in 0.9.0): KMOI only. Created once at genesis; `Mint`, `Burn`
  and the metadata setters are reserved and rejected. Clients cannot create a
  MASN asset.
- **MASX**: custom, logic-backed assets deployed from your own Coco `coco asset`
  manifest via `AssetFactory.create`.

Balances live **on the holder accounts**, not in the asset's own state, so in an
interaction the asset is usually listed as a participant with `NO_LOCK`, while
the accounts whose balances change are `MUTATE_LOCK`. Assets may declare
`decimals` (0 to 18); KMOI has 9, and its smallest unit is the **anu**
(`1 KMOI = 1_000_000_000 anu`; `formatKmoi`/`parseKmoi`). All SDK amounts are
in the smallest unit.

- `Lockup(beneficiary, amount)` escrows the caller's balance;
  `Release(benefactor, beneficiary, amount)` un-escrows. Used for escrow flows.
- Holdings: `provider.getTDU(addr)` → `[{asset_id, token_id, amount}]`; a single
  balance: `provider.getBalance(addr, assetId)`.

The `MAS0AssetLogic` / `MAS1AssetLogic` / `MAS2AssetLogic` / `MASNAssetLogic`
classes wrap these; see `assets.md`.

## Storage is paid for (new in 0.8.0)

Logic and asset accounts **pay for their own storage** from the moment they are
created, billed against their own KMOI balance. A brand-new account holds
nothing, so every `LogicFactory.deploy` and every asset `create` bundles a
second operation: a KMOI `Transfer` of `DEFAULT_STORAGE_FUND` (10 KMOI) to the
predicted new id. Raise it with `RoutineOption({ storageFund })` for big
manifests. Two more primitives exist for ongoing storage:

- **Storage deposits** (`StorageDeposit`/`StorageWithdraw`, ops
  `STORAGE_DEPOSIT`/`STORAGE_WITHDRAW`): a participant deposits KMOI on a
  logic/asset account to receive a byte **allowance** there ("granted storage"),
  and can later release unused bytes. `provider.getStorageMetric(target, user)`
  reads `{storage_granted, storage_consumed, tokens_deposited}`;
  `provider.getStoragePricing()` reads the network's per-byte price.
- **Access policies** (`Access`, ops `ACCESS_CREATE`/`UPDATE`/`DELETE`): the
  owner of a resource (today only `ResourceType.STORAGE`) grants actions
  (`AccessAction` bitmask) to callers/origins (`CallerKind.ANY` or an explicit
  `SET`), optionally within key prefixes. Read back with
  `provider.getAccessPolicy`/`getAccessPolicies`.

Whether a Coco state write is billed to the logic itself or to the caller's
grant is decided in the Coco source (`payer Logic`); see the companion Coco
skill.

## Lock types and participants

Each participant in an interaction declares a lock (`LockType` in
`js-moi-utils`; lower number = stronger):

| Lock | Value | Meaning |
|---|---|---|
| `MUTATE_LOCK` | 0 | read+write; serializes with other mutators of that participant |
| `READ_LOCK` | 1 | read-only consistent snapshot |
| `NO_LOCK` | 2 | no consistency lock; maximal parallelism |

Conventions: a stateless logic → `NO_LOCK`; assets in transfers → `NO_LOCK`
(but still *listed*); accounts whose state changes → `MUTATE_LOCK`. **Since
0.9.0-rc1 the sender is not listed as a participant at all** (the node derives
it, and the SDK drops any entry with the sender's id); the same goes for a plain
fee payer. A participant may carry `notary: true` (a fee payer that also
co-signs as a participant; must be `MUTATE_LOCK`). Getting locks wrong is a
common failure: too strong stalls/serializes; a missing participant gives
"actor not found" at execution. The SDK auto-derives some participants from the
op type (see `interactions.md`).

## Fuel, fee payer and nonces

- **Fuel is paid in KMOI (anu).** `fuel_price` defaults to **`50`**
  (`DEFAULT_FUEL_PRICE`, raised from 1 in 0.9.0-rc1 to match the node's floor),
  `fuel_limit` defaults to **`100000`** (`DEFAULT_FUEL_LIMIT`). The chain
  **reserves `fuel_limit × fuel_price`** anu up front and refunds the unused
  part, so that product must be ≤ the payer's KMOI balance even when the op is
  cheap. A `fuel_price` below the node's floor is rejected as underpriced.
- **Fee payer** (new in 0.9.0-rc1): a different account can cover the fuel. The
  sender sets `payer` (rc3: `fee_payer`), the payer signs the same interaction
  object with `signRawInteractionObject`, and both signatures are sent together
  (`interactions.md`).
- **Nonce / sequence is per (account, key).** `.send()` auto-fetches it. Two
  concurrent sends from one signer grab the same nonce → the chain rejects one.
  Serialize sends per signer, or pass an explicit `sequence` in the send option
  to replace a stuck one (with a higher fuel_limit).
- The logic `.send()` path and the asset driver **auto-estimate `fuel_limit`**
  when you omit it (`estimateFuel`); the asset wrappers (`MAS0AssetLogic` etc.)
  and builders fall back to `DEFAULT_FUEL_LIMIT` instead.

## Events and logs

Coco `emit` produces logs. A log is
`{ id, topics: string[], data, ix_hash, ts_hash, participants }`.

- **`topics[0..]` are signature hashes** (`topicHash(eventName)` and per
  `topic`-declared fields), **not** the field values. Identify the event by
  matching `topicHash(name)` against the topics.
- The **canonical field values live in the POLO-encoded `data` document**;
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
   `.build()` to produce one (the builder's own `.send()` takes NO options in
   rc2; see `assets.md`). Asset **driver** routines (`getAssetDriver`) execute
   themselves (`assets.md`).
2. On the context: `.send(option)` commits it (signs + broadcasts, returns
   `{hash, wait, result}`); `.call(option)` simulates read-only;
   `.estimateFuel(option)` estimates; `.ixData(option)` returns the assembled
   interaction object, including any bundled funding operation.
3. Confirm with `await resp.wait(timeoutSeconds)` (polls the receipt) and/or
   `await resp.result()` (decoded per-op output). See `logic.md` and
   `patterns.md`.

## Routine / callsite flavors (Coco)

A manifest routine has `kind` (`invoke` | `enlist` | `deploy`) and `mode`
(`static` | `dynamic`). Loosely:

- **dynamic**: may read and mutate state → use `.send()`.
- **static**: read-only state access → use `.call()`.
- ("pure" endpoints that touch no state, e.g. a hash computation or a pure
  broadcast that only emits, are `static` and are used via `.call()` or `.send()`
  depending on whether they emit.)

Coco state blocks are `state logic:` (shared by all callers; the SDK calls this
**logic state**, `driver.logicState`, formerly "persistent") and `state actor:`
(one slot per calling participant; **actor state**, `driver.actorState`,
formerly "ephemeral"). Coco 0.9.2 and later no longer compile `endpoint enlist`;
actors need no registration step because unset actor state reads as its zero
value. The SDK still carries `LOGIC_ENLIST`/`RoutineType.ENLIST` for older
manifests.

The SDK exposes `routine.isMutable()` (true for `dynamic`) but does not force
the choice on logic drivers; you decide `.send()` vs `.call()`.

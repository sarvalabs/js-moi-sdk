# js-moi-asset: create, transfer, mint, escrow assets

Verified against `packages/js-moi-asset/src.ts/` (v0.9.0-rc2). Exports
(`index.ts`): the standard wrappers `MAS0AssetLogic` / `MAS1AssetLogic` /
`MAS2AssetLogic` and (new in 0.9.0) **`MASNAssetLogic`** for KMOI, their
`MAS0`/`MAS1`/`MAS2` namespaces, `AssetFactory`, `AssetDriver`/`getAssetDriver`,
and the MAS0 schemas. (`AssetId`/`AssetDescriptor`/`AssetBase` and
`mas1-schema.ts`/`mas2-schema.ts` exist in the source but are not exported.) The
`AccountInherit` builder (used to seed sub-accounts) lives in
`js-moi-interactions` and is documented here because it's part of the same
asset/account flow.

## What changed since 0.7.1 (read this first)

| 0.7.1 | 0.9.0-rc2 |
|---|---|
| `MAS0AssetLogic.create(signer, symbol, supply, manager, enableEvents)` | adds **`decimals?`** then **`option?: RoutineOption`** (0.9.0-rc1: `decimals` was inserted *before* `option`) |
| `MAS1AssetLogic.create(signer, symbol, supply, manager, enableEvents)` | **`create(signer, symbol, manager, enableEvents, option?)`**: no supply (fixed at 1), no decimals |
| `MAS2AssetLogic.create(... enableEvents)` | adds `decimals?`, `option?`; new `getAssetInfo()` |
| create = one `ASSET_CREATE` op | create = `ASSET_CREATE` **plus a bundled KMOI `Transfer`** (10 KMOI default) funding the new asset account's storage |
| `AssetFactory.create(..., manifest?, callsite?, ...calldata)` | `manifest` **required**; `callsite` required when the manifest has a deploy routine; MASX only |
| KMOI handled as a MAS0 asset | KMOI is **MASN**; use `MASNAssetLogic(signer)`; `Mint`/`Burn`/`Set*Metadata` on KMOI rejected client-side |
| `driver.persistentState` / `ephemeralState` | `driver.logicState` / `driver.actorState` |
| `AssetStandard.MASX = 65535` | plus `MASN = 65534` |

## MAS0AssetLogic: the common fungible case

```ts
const asset = new MAS0AssetLogic(assetId, signer);
```

Every mutating/read method returns an **`InteractionContext<ASSET_INVOKE>`**,
so you chain `.send(option?)` / `.call(option?)` / `.estimateFuel(option?)`
(`IxOption`, snake_case; see `interactions.md`). The op payload is `{ asset_id,
callsite, calldata }` with participants pre-filled; you can still pass extra
participants / fuel in the `.send()` option.

The signer's account must exist on chain. For an unregistered wallet, read its
balance with `provider.getBalance` instead (`references/patterns.md` section 9).

```ts
await new MAS0AssetLogic(assetId, wallet).transfer(to, 100n).send({ fuel_limit: 100_000 });
await new MAS0AssetLogic(assetId, wallet).mint(to, 1_000_000n).send({ fuel_limit: 100_000 });
const raw = await (await new MAS0AssetLogic(assetId, wallet).balanceOf(addr).call()).result();
```

### Creation (bundles a storage fund)

```ts
// build-and-send in one step → returns a bound MAS0AssetLogic on the new asset
const asset = await MAS0AssetLogic.newAsset(signer, "TKA", 1_000_000n, managerAddr, /*enableEvents*/ true, /*decimals*/ 6);
// or build the ASSET_CREATE context yourself:
const ix = MAS0AssetLogic.create(signer, "TKA", supply, managerAddr, enableEvents, decimals?, option?);
const resp = await ix.send({ fuel_limit: 200_000 });
const [{ asset_id }] = await resp.result();          // op 0 = the create
```

- Signature (`mas0-asset.ts:41`): `create(signer, symbol, supply: number |
  bigint, manager, enableEvents, decimals?: number, option?: RoutineOption)`.
  `decimals` is validated (integer, 0 to 18) and written to the payload only when
  given; the chain's default applies otherwise.
- **Two operations go out.** The context's `fundingOperations` adds an
  `ASSET_INVOKE` `Transfer` of `option?.storageFund ?? DEFAULT_STORAGE_FUND`
  (10_000_000_000 anu = 10 KMOI) from the sender to the **predicted** asset id
  (`deriveAssetId(sender, standard)`, `identifiers.md`), because a new asset
  account pays for its own storage the moment it exists. Your KMOI balance must
  cover `fuel_limit × fuel_price` **plus** the storage fund. The receipt has two
  `ix_operations`; `resp.result()[0]` is the `AssetCreationResult`.
- `max_supply` must be `> 0` (client validator; `0` is rejected since
  0.9.0-rc1). `number` and `bigint` are both accepted; the 0.8.0 release notes
  list "Fixed BigInt asset supply handling", so the 0.7.1-era "pass a Number"
  rule in the examples is kept only as history.
- `newAsset` sends with no options (auto fuel from `DEFAULT_FUEL_LIMIT`) and
  returns `new MAS0AssetLogic(results[0].asset_id, signer)`.

### Methods (exact casing: the source mixes cases)

| Method | callsite | participants (auto) |
|---|---|---|
| `mint(beneficiary, amount)` | `Mint` | asset MUTATE, beneficiary MUTATE |
| `mintWithMetadata(beneficiary, amount, staticMetadata: Record<string, Uint8Array>)` | `MintWithMetadata` | asset MUTATE, beneficiary MUTATE |
| `burn(amount)` | `Burn` | asset MUTATE |
| `transfer(beneficiary, amount)` | `Transfer` | beneficiary MUTATE, asset NO_LOCK |
| `transferFrom(benefactor, beneficiary, amount)` | `TransferFrom` | beneficiary MUTATE, benefactor MUTATE, asset NO_LOCK |
| `approve(beneficiary, amount, expiresAt: number)` | `Approve` | beneficiary MUTATE, asset NO_LOCK |
| `revoke(beneficiary)` | `Revoke` | beneficiary MUTATE, asset NO_LOCK |
| `lockup(beneficiary, amount)` | `Lockup` | beneficiary MUTATE, asset NO_LOCK, SARGA_ADDRESS MUTATE |
| `release(benefactor, beneficiary, amount)` | `Release` | beneficiary MUTATE, benefactor MUTATE, asset NO_LOCK |
| `SetStaticMetadata(key, value: Uint8Array)` / `SetDynamicMetadata(key, value)` | `Set*Metadata` | none |
| Reads (`.call()`): `symbol()`, `balanceOf(id)`, `creator()`, `manager()`, `Decimals()`, `MaxSupply()`, `CirculatingSupply()`, `GetStaticMetadata(key)`, `GetDynamicMetadata(key)` | respective | none |

> Casing is still inconsistent: camelCase for `mint`, `burn`, `transfer`,
> `transferFrom`, `mintWithMetadata`, `approve`, `revoke`, `lockup`, `release`,
> `symbol`, `balanceOf`, `creator`, `manager`; PascalCase for `Decimals`,
> `MaxSupply`, `CirculatingSupply`, `SetStaticMetadata`, `GetDynamicMetadata`, …
> Use exactly as written. Amounts are `number | bigint` (use `bigint` for U256).
> Note the asset is listed `MUTATE_LOCK` by `processParticipants` for every
> `ASSET_INVOKE` anyway; the wrapper's `NO_LOCK` entry is what the merge keeps
> because explicit entries override.

> **Read-only results are raw POLO in rc2.** `await (await
> asset.balanceOf(addr).call()).result()` resolves to `[{ outputs: "0x…", error:
> "0x…" }]` with `outputs` still POLO-encoded. Decode with a one-field struct
> schema via `js-polo`: `new Depolorizer(hexToBytes(outputs)).depolorize({ kind:
> "struct", fields: { balance: { kind: "integer" } } })` (field names: `symbol`,
> `balance`, `creator`/`manager` as `bytes`, `decimals`, `max_supply`,
> `circulating_supply`, metadata `value` as `bytes`). **rc3 adds
> `asset.decodeResult(MAS0.Endpoint.BALANCEOF, result[0])` → `{ output, error }`**
> and exports the matching `*_RESULT_SCHEMA` constants. For a quick balance read
> prefer `provider.getBalance(addr, assetId)`, which is already decoded.

`MAS0.Endpoint` is a string enum of the callsites (`TRANSFER="Transfer"`, …) if
you need the raw callsite name. The POLO calldata schemas (`TRANSFER_SCHEMA`,
`MINT_SCHEMA`, `APPROVE_SCHEMA` with `expires_at`, …) are exported from
`mas0-schema.ts`.

## MASNAssetLogic: KMOI (new in 0.9.0)

KMOI has its own standard, `AssetStandard.MASN` (65534), created once at
genesis. `new MASNAssetLogic(signer)` takes **no asset id**; every call targets
`KMOI_ASSET_ID`. Methods: `transfer`, `transferFrom`, `approve`, `revoke`,
`lockup`, `release` and the reads `symbol`, `balanceOf`, `creator`, `manager`,
`Decimals`, `MaxSupply`, `CirculatingSupply`, `GetStaticMetadata`,
`GetDynamicMetadata`, with the same signatures and participant rules as MAS0.
There is **no** `mint`, `burn`, `mintWithMetadata` or `Set*Metadata`: those
callsites are reserved on KMOI and `validateAssetAction` throws if you build
them by hand. You can still drive KMOI through `new MAS0AssetLogic(KMOI_ASSET_ID,
signer)` for the shared callsites; the MASN class just removes the footguns.

```ts
await new MASNAssetLogic(wallet).transfer(to, parseKmoi("1.5")).send({ fuel_limit: 100_000 });
```

## MAS1AssetLogic / MAS2AssetLogic: do NOT mirror MAS0

Both are **tokenId-centric** with different signatures (`mas1-asset.ts`,
`mas2-asset.ts`):

- **MAS1** (single-unit, NFT-like): `create(signer, symbol, manager,
  enableEvents, option?)` / `newAsset(...)` take **no supply and no decimals**
  (0.9.0-rc1 removed `decimals`; `max_supply` is fixed at 1 and the payload
  carries `logic_payload: { manifest: "0x", callsite: "Init" }`). Then
  `mint(beneficiary)` (no amount), `mintWithMetadata(beneficiary,
  staticMetadata)`, `burn(tokenId)`, `transfer(tokenId, beneficiary)`,
  `transferFrom(tokenId, benefactor, beneficiary)`, `approve(tokenId,
  beneficiary, expiresAt)`, `revoke(tokenId, beneficiary)`, `lockup(tokenId,
  beneficiary)`, `release(tokenId, benefactor, beneficiary)`,
  `SetStaticTokenMetadata(tokenId, key, value)` /
  `SetDynamicTokenMetadata(tokenId, key, value)`, reads `symbol()`,
  `isOwner(tokenId, address: Uint8Array)`, `creator()`, `manager()`,
  `GetStaticMetadata(key)`, `GetDynamicMetadata(key)`,
  `GetStaticTokenMetadata(tokenId, key)`, `GetDynamicTokenMetadata(tokenId,
  key)`. **No** `Decimals`/`MaxSupply`/`CirculatingSupply`.
- **MAS2** (semi-fungible: tokenId + amount): `create(signer, symbol, supply,
  manager, enableEvents, decimals?, option?)` / `newAsset(...)`;
  `transfer(tokenId, beneficiary, amount)`, `transferFrom(tokenId, benefactor,
  beneficiary, amount)`, `mint(beneficiary, amount)`,
  `mintWithMetadata(beneficiary, amount, staticMetadata)`, `burn(tokenId,
  amount)`, `approve(tokenId, beneficiary, amount, expiresAt)`, `revoke(tokenId,
  beneficiary)`, `lockup(tokenId, beneficiary, amount)`, `release(tokenId,
  benefactor, beneficiary, amount)`, metadata setters, and **`async
  getAssetInfo(): Promise<AssetInfo>`** (new; wraps
  `provider.getAssetInfoByAssetID`, so `decimals` comes back as raw hex). Also
  lacks `Decimals`/`MaxSupply`/`CirculatingSupply` callsites.
- Both bundle the same storage-funding `Transfer` as MAS0 on create.

Read the `mas1-asset.ts` / `mas2-asset.ts` source for the exact signatures
before using them.

## AssetFactory (logic-backed / MASX assets)

`AssetFactory.create(signer, symbol, supply, manager, enableEvents, manifest,
callsite?, ...calldata)` (`asset-factory.ts:18`) builds an `ASSET_CREATE`
context with `standard: AssetStandard.MASX` and the POLO-encoded manifest in
`logic_payload`.

- **`manifest` is required** (type `LogicManifest.Manifest`). MASX is the only
  standard that takes a client-supplied manifest; MAS0/1/2 manifests are built
  into the chain and are created through their own `create()`.
- **`callsite`** must name a `deploy` routine whenever the manifest defines one
  or more; omitting it then throws `MISSING_ARGUMENT` "Manifest defines one or
  more deploy routines - a callsite is required to select one." A name that
  matches no deploy routine throws `INVALID_ARGUMENT`. Only a manifest with no
  deploy routine may omit `callsite`.
- `...calldata` is positional and must match the Coco deploy routine's params
  in order; too few throw `MISSING_ARGUMENT`. A trailing `RoutineOption`
  instance is peeled off (not counted, not encoded) and only its `storageFund`
  is read.
- Same storage-funding `Transfer` bundled as the native standards.

## AssetDriver (interact with a deployed asset logic)

`getAssetDriver(assetId, signer, options?)` fetches the asset's manifest
(`provider.getLogicManifest(assetId, "JSON", options)`) and returns an
`AssetDriver` with dynamic `.routines` (each with
`.isMutable()`/`.accepts()`/`.returns()`), **`.logicState`**, **`.actorState`**
(renamed in 0.8.0 from `persistentState`/`ephemeralState`), the asset analogue
of `getLogicDriver`. Descriptor methods on the instance: `getAssetId()` (a
`LogicId`-style object; `.hex()`), `getEngine()`, `getManifest()`,
`getEncodedManifest()`, `isSealed()`, `isAssetLogic()`, `isStateful()`,
`allowsInteractions()`, `hasLogicState()`/`hasActorState()`.

> **Driver routines execute immediately; do not chain `.send()`/`.call()`.**
> `asset-driver.ts` makes every `.routines.X(...)` an `async` function: a
> `dynamic` routine runs `.send()` itself and resolves to an `InteractionResponse`
> (`{ hash, wait, result }`, with `result()` decoding `{ output, error }`); a
> `static` routine runs `.call()` and `.result()` itself (`unwrap()`) and
> resolves **directly** to `{ output, error }`. This differs from the
> `MAS0AssetLogic`/`MAS1AssetLogic` wrapper methods, which return a context you
> `.send()`. **Do not mix the two paths** on one routine. A trailing
> `RoutineOption` **is honoured here** (`fuelLimit`, `fuelPrice`, `sequence`,
> `sender`, `participants`); without `fuelLimit` the driver estimates.

> **Coco-side landmine (surfaces as SDK receipt `status: 1`).** A pure Coco
> endpoint that reads *dynamic* state reverts. That's a contract bug, not an SDK
> one; see the companion Coco skill. From the SDK you only see
> `receipt.status !== 0`, so pre-check ownership with `provider.getTDU(holder)`
> for a clearer error.

## AccountInherit: create & fund an inherited sub-account

Lives in `js-moi-interactions`. Creates a sub-account under a target logic and
seeds it (typically with KMOI so it can pay fuel). This is how a user gets actor
state under a logic (see `concepts.md`).

```ts
await new AccountInherit(primaryWallet)
  .target(logicId)                          // the logic to inherit under
  .index(subAccountIndex)                   // which sub-account slot
  .value(KMOI_ASSET_ID, inheritedAddress, amount /* bigint, anu */)  // seed transfer
  .build()                                  // → InteractionContext
  .send({ fuel_limit });                    // options go HERE, on the context
```

- `.target(account)` sets `target_account`; `.index(i)` sets
  `sub_account_index`; `.value(assetId, beneficiary, amount)` builds an asset
  `Transfer` payload (not a bare number). `.build()` throws if any of
  target/index/value is missing.
- **The builder's own `.send()` takes no arguments** (defaults: fuel 50/100000);
  to pass `fuel_limit`/`sequence`/participants call `.build()` first and
  `.send(option)` on the returned `InteractionContext`.
- Auto-adds `KMOI_ASSET_ID` as a `NO_LOCK` participant. Op type
  `ACCOUNT_INHERIT`. Its receipt op decodes to `AccountInheritResult
  { sub_account, error }` (new in 0.8.0).

Related builders (also `js-moi-interactions`): `ParticipantCreate` (register a
primary account / add keys / seed value → `PARTICIPANT_CREATE`),
`AccountConfigure` (`addKey`/`revokeKey` → `ACCOUNT_CONFIGURE`),
`StorageDeposit`/`StorageWithdraw`, `Access`. See `interactions.md`.

## Legacy `AssetId` (internal, not exported)

`asset-id.ts` in this package contains a variable-length legacy `AssetId` wrapper
(distinct from the 32-byte `AssetId` in `js-moi-identifiers`) used internally by
the asset descriptor. It is **not exported from the package index**; importing
`AssetId` from `js-moi-sdk` gives you the `js-moi-identifiers` one, which is
what new code should use anyway (`identifiers.md`).

# js-moi-asset — create, transfer, mint, escrow assets

Verified against `packages/js-moi-asset/src.ts/` (v0.7.1). Exports the three
standard wrappers `MAS0AssetLogic` / `MAS1AssetLogic` / `MAS2AssetLogic`, their
`MAS0`/`MAS1`/`MAS2` namespaces, `AssetFactory`, `AssetDriver`/`getAssetDriver`,
and the MAS0 schemas. (The legacy `AssetId` and `AssetDescriptor` classes exist
in the source but are NOT exported from the package index; `mas1-schema.ts` /
`mas2-schema.ts` exist but are unexported too.) The `AccountInherit` builder
(used to seed sub-accounts) lives in `js-moi-interactions` and is documented
here because it's part of the same asset/account flow.

## MAS0AssetLogic — the common case

```ts
const asset = new MAS0AssetLogic(assetId, signer);
```

Every mutating/read method returns an **`InteractionContext<ASSET_INVOKE>`** —
so you chain `.send(option?)` / `.call(option?)` / `.estimateFuel(option?)`. The
op payload is `{ asset_id, callsite, calldata }` with participants pre-filled;
you can still pass extra participants / fuel in the `.send()` option.

```ts
await new MAS0AssetLogic(assetId, wallet).transfer(to, 100n).send({ fuel_limit: 50000 });
await new MAS0AssetLogic(assetId, wallet).mint(to, 1_000_000n).send({ fuel_limit: 50000 });
const bal = await (await new MAS0AssetLogic(assetId, wallet).balanceOf(addr).call()).result();
```

Static creation:

```ts
// build-and-send in one step → returns a bound MAS0AssetLogic on the new asset
const asset = await MAS0AssetLogic.newAsset(signer, "TKA", 1_000_000n, managerAddr, /*enableEvents*/ true);
// or build the ASSET_CREATE context yourself:
const ix = MAS0AssetLogic.create(signer, "TKA", supply, managerAddr, enableEvents);
await ix.send({ fuel_limit: 50000 });
```

### Methods (exact casing — the source mixes cases)

| Method | callsite | participants (auto) |
|---|---|---|
| `mint(beneficiary, amount)` | `Mint` | asset MUTATE, beneficiary MUTATE |
| `mintWithMetadata(beneficiary, amount, staticMetadata)` | `MintWithMetadata` | asset MUTATE, beneficiary MUTATE |
| `burn(amount)` | `Burn` | asset MUTATE |
| `transfer(beneficiary, amount)` | `Transfer` | beneficiary MUTATE, asset NO_LOCK |
| `transferFrom(benefactor, beneficiary, amount)` | `TransferFrom` | beneficiary MUTATE, benefactor MUTATE, asset NO_LOCK |
| `approve(beneficiary, amount, expiresAt)` | `Approve` | beneficiary MUTATE, asset NO_LOCK |
| `revoke(beneficiary)` | `Revoke` | beneficiary MUTATE, asset NO_LOCK |
| `lockup(beneficiary, amount)` | `Lockup` | beneficiary MUTATE, asset NO_LOCK, SARGA_ADDRESS MUTATE |
| `release(benefactor, beneficiary, amount)` | `Release` | beneficiary MUTATE, benefactor MUTATE, asset NO_LOCK |
| `SetStaticMetadata(key, value)` / `SetDynamicMetadata(key, value)` | `Set*Metadata` | none |
| Reads (`.call()`): `symbol()`, `balanceOf(id)`, `creator()`, `manager()`, `Decimals()`, `MaxSupply()`, `CirculatingSupply()`, `GetStaticMetadata(key)`, `GetDynamicMetadata(key)` | respective | none |

> Casing is inconsistent in 0.7.x: some methods are camelCase (`mint`, `burn`,
> `transfer`, `transferFrom`, `mintWithMetadata`, `approve`, `revoke`, `lockup`,
> `release`, `symbol`, `balanceOf`, `creator`, `manager`), others PascalCase
> (`Decimals`, `MaxSupply`, `CirculatingSupply`, `SetStaticMetadata`,
> `GetDynamicMetadata`, …). Use exactly as written in the table above.
> Amounts are `number | bigint` (use `bigint` for U256).

`MAS0.Endpoint` is a string enum of the callsites (`TRANSFER="Transfer"`, …) if
you need the raw callsite name. The POLO calldata schemas
(`TRANSFER_SCHEMA`, `MINT_SCHEMA`, `APPROVE_SCHEMA` with `expires_at`, …) are
exported from `mas0-schema.ts`.

## MAS1AssetLogic / MAS2AssetLogic — do NOT mirror MAS0

Both are **tokenId-centric** (NFT-style) with different signatures — don't
assume the MAS0 method shapes:

- **MAS1**: `create`/`newAsset` take **no supply**; `mint(beneficiary)` (no
  amount); `burn(tokenId)`; `transfer(tokenId, beneficiary)`;
  `transferFrom(tokenId, benefactor, beneficiary)`; `approve(tokenId,
  beneficiary, expiresAt)` (no amount); adds `isOwner(tokenId, id)` and
  per-token metadata getters/setters; **no**
  `Decimals`/`MaxSupply`/`CirculatingSupply`.
- **MAS2**: tokenId-first signatures on most ops (semi-fungible: tokenId +
  amount); also lacks `Decimals`/`MaxSupply`/`CirculatingSupply`.

Read the `mas1-asset.ts` / `mas2-asset.ts` source for the exact signatures
before using them.

## AssetFactory (logic-backed / MASX assets)

`AssetFactory.create(signer, symbol, supply, manager, enableEvents, manifest?,
callsite?, ...calldata)` builds an `ASSET_CREATE` context using
`AssetStandard.MASX`. If given a `manifest` + deploy `callsite`, it attaches the
logic payload (encoded via `ManifestCoder.encodeManifest`) and constructor
calldata. Use this for custom logic-backed assets; use `MAS0AssetLogic.create`
for a plain MAS0 token.

> **Devnet landmine — `supply` on create must be a `Number`, not `bigint`.** The
> parameter type is `number | bigint`, so a `bigint` compiles, but Voyage devnet
> **rejects the bigint form at sign time** ("Failed to sign interaction"). Pass a
> plain `Number` for `max_supply` on `create`. (Transfer/mint amounts elsewhere
> can still be `bigint`.) The trailing `...calldata` is positional and must match
> the Coco deploy routine's params in order.

## AssetDriver (interact with a deployed asset logic)

`getAssetDriver(assetId, signer, options?)` fetches the asset's manifest and
returns an `AssetDriver` with dynamic `.routines` (each with `.isMutable()`/
`.accepts()`/`.returns()`), `.persistentState`, `.ephemeralState` — the asset
analogue of `getLogicDriver`. Descriptor methods available **on the driver
instance** (the `AssetDescriptor` class itself is not exported):
`getAssetId()`, `getEngine()`, `getManifest()`, `getEncodedManifest()`,
`isAssetLogic()`, `isStateful()`, `allowsInteractions()`,
`hasPersistentState()`/`hasEphemeralState()`, etc.

> **Dynamic `.routines.X(...)` AUTO-SEND — do not chain `.send()`.** An asset
> driver routine backed by a `dynamic` Coco endpoint submits the interaction
> itself and resolves the result directly (`{ output, error }`); calling
> `.send()` on it is wrong. This differs from the `MAS1AssetLogic`/`MAS0AssetLogic`
> wrapper methods (e.g. `.transfer(...).send({ fuel_limit })`), which DO use
> `.send()`. **Do not mix the two paths** — mixing produces "asset not found" /
> pure-endpoint errors. Read-only (`static`) routines are called the same way and
> spend no on-chain fuel.

> **Coco-side landmine (surfaces as SDK receipt `status: 1`).** A pure Coco
> endpoint that reads *dynamic* state reverts — e.g. a `Transfer` endpoint that
> calls `get_token_count()`. That's a contract bug, not an SDK one; see the
> companion Coco skill. From the SDK you only see `receipt.status !== 0`, so
> pre-check ownership with `provider.getTDU(holder)` for a clearer error.

## AccountInherit — create & fund an inherited sub-account

Lives in `js-moi-interactions`. Creates a sub-account under a target logic and
seeds it (typically with KMOI so it can pay fuel). This is how a user gets actor
state under a logic (see `concepts.md`).

```ts
await new AccountInherit(primaryWallet)
  .target(logicId)                          // the logic to inherit under
  .index(subAccountIndex)                   // which sub-account slot
  .value(KMOI_ASSET_ID, inheritedAddress, amount /* bigint */)  // seed transfer
  .build()                                  // → InteractionContext
  .send({ fuel_limit });                    // options go HERE, on the context
```

- `.target(account)` sets `target_account`; `.index(i)` sets
  `sub_account_index`; `.value(assetId, beneficiary, amount)` builds an asset
  `Transfer` payload (not a bare number). `.build()` throws if any of
  target/index/value is missing.
- **The builder's own `.send()` takes no arguments** (defaults: fuel 1/10000) —
  to pass `fuel_limit`/`sequence`/participants you must call `.build()` first
  and `.send(option)` on the returned `InteractionContext`.
- Auto-adds `KMOI_ASSET_ID` as a `NO_LOCK` participant. Op type
  `ACCOUNT_INHERIT`.

Related builders (also `js-moi-interactions`): `ParticipantCreate` (register a
primary account / add keys / seed value → `PARTICIPANT_CREATE`),
`AccountConfigure` (`addKey`/`revokeKey` → `ACCOUNT_CONFIGURE`). See
`interactions.md`.

## Legacy `AssetId` (internal — not exported)

`asset-id.ts` contains a variable-length legacy `AssetId` wrapper (distinct
from the 32-byte `AssetId` in `js-moi-identifiers`) used internally by the
asset descriptor. It is **not exported from the package index** — importing
`AssetId` from `js-moi-sdk` gives you the `js-moi-identifiers` one, which is
what new code should use anyway (`identifiers.md`).

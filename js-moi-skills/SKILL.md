---
name: js-moi-sdk
description: Reference and working patterns for js-moi-sdk, the JavaScript/TypeScript SDK for the MOI Protocol blockchain (Coco logics, MAS0/MAS1/MAS2/MASX assets, KMOI as MASN, tesseracts, accounts, fuel, storage funding, fee payer). Use whenever code imports from js-moi-sdk or its sub-packages (js-moi-providers, js-moi-wallet, js-moi-signer, js-moi-logic, js-moi-manifest, js-moi-utils, js-moi-asset, js-moi-identifiers, js-moi-interactions, js-moi-hdnode, js-moi-bip39, js-moi-constants), or when a task involves reading MOI chain state, signing/sending interactions, deploying or calling a logic, creating/transferring assets, wallets/mnemonics/keystores/sub-accounts, storage deposits and access policies, decoding events, or fuel/nonce/participant handling. Covers the full v0.9.0-rc2 public API plus gotchas learned building real apps against it.
homepage: https://github.com/sarvalabs/js-moi-sdk
metadata:
  openclaw:
    emoji: "⛓️"
    requires:
      bins: ["node"]
---

# js-moi-sdk

`js-moi-sdk` (npm `latest` = `0.9.0-rc2`; pin `0.9.0-rc2` exactly, the rc3 tag
on GitHub renames a field) is a monorepo that re-exports 12 sub-packages. Import
everything from the umbrella `js-moi-sdk`; the sub-package names only matter
for understanding where a symbol lives.

```js
import {
  JsonRpcProvider, WebsocketProvider, VoyageProvider,   // js-moi-providers
  Wallet,                                               // js-moi-wallet (extends Signer)
  getLogicDriver, LogicFactory, RoutineOption,          // js-moi-logic
  ManifestCoder,                                        // js-moi-manifest
  MAS0AssetLogic, MAS1AssetLogic, MASNAssetLogic, AssetFactory, getAssetDriver,   // js-moi-asset
  AccountInherit, StorageDeposit, Access, access,       // js-moi-interactions
  OpType, LockType, AssetStandard, ResourceType, AccessAction, ErrorCode,         // js-moi-utils (enums)
  topicHash, hexToBytes, bytesToHex, hexToBN, formatKmoi, parseKmoi,             // js-moi-utils (helpers)
  deriveAssetId, deriveLogicId,                         // js-moi-identifiers
  KMOI_ASSET_ID, ZERO_ADDRESS, MOI_DERIVATION_PATH, DEFAULT_FUEL_PRICE, DEFAULT_STORAGE_FUND, // js-moi-constants
} from "js-moi-sdk";
```

MOI-native concepts (accounts, tesseracts, locks, fuel, storage funding,
sub-accounts, events) are summarized in `references/concepts.md`; read it first
if MOI is unfamiliar.

## Coming from 0.7.x? The breaking changes in 0.8.0 and 0.9.0

| Area | Was | Now (v0.9.0-rc2) |
|---|---|---|
| State accessors | `driver.persistentState` / `ephemeralState` | `driver.logicState` / `driver.actorState`; `ContextStateKind.LogicState/ActorState`; the `LogicState`/`RoutineKind` enums are gone |
| Native asset creation | `AssetFactory.create` for everything | `MAS0AssetLogic.create(signer, symbol, supply, manager, enableEvents, decimals?, option?)`, `MAS1AssetLogic.create(signer, symbol, manager, enableEvents, option?)` (no supply, no decimals), `MAS2AssetLogic.create(..., decimals?, option?)`; `AssetFactory.create` is MASX only and its `manifest` is required |
| Storage | nothing | every deploy/create bundles a 10 KMOI `Transfer` (`DEFAULT_STORAGE_FUND`) to the predicted new account; `StorageDeposit`/`StorageWithdraw`, `Access` builders; `getStorageMetric`/`getStoragePricing`/`getAccessPolicy(ies)` |
| Deploy | `deploy()` without a builder name allowed | builder name / `callsite` **required** when the manifest has any deploy routine |
| Ids | only `createParticipantId` | `deriveLogicId(sender)`, `deriveAssetId(sender, standard)` predict ids before creation |
| KMOI | a MAS0 asset, `KMOI_ASSET_ID = 0x10800000…` | standard **MASN** (65534), **`KMOI_ASSET_ID = 0x1080fffe…`** (new value), `MASNAssetLogic(signer)`; `Mint`/`Burn`/`Set*Metadata` on KMOI rejected |
| Fuel | `DEFAULT_FUEL_PRICE = 1`, `DEFAULT_FUEL_LIMIT = 10000` | **50** and **100000** |
| Participants | sender auto-listed `MUTATE_LOCK` | sender (and a plain fee payer) **not listed**; the node derives them. Needs a node with that change (devnet 0.13.0 has it) |
| Fee payer | none | `IxOption.payer` + `participantSignatures`, `wallet.signRawInteractionObject`, `ctx.payer(id)` (rc3 renames the field `fee_payer`) |
| Validation | mostly server-side | client-side: `max_supply > 0`, `decimals ≤ 18`, MASN not creatable, KMOI reserved callsites, storage deposit floor |
| Amount helpers | none | `formatAmount`/`parseAmount`/`formatKmoi`/`parseKmoi`, `KMOI_DECIMALS = 9` |

## Read the reference that matches the task

This SKILL.md is the map; each reference is verified against the v0.9.0-rc2
`src.ts/` sources and names the files it covers. Read on demand; you rarely
need all.

| Task | Reference |
|---|---|
| MOI model: accounts, sub-accounts, tesseracts, locks, fuel, storage, events | `references/concepts.md` |
| Read chain state; subscriptions; filters; RPC method list; storage/access reads | `references/providers.md` |
| Wallets, mnemonics, keys, sub-accounts, HDNode, bip39, signing, fee-payer signatures | `references/wallet-signer.md` |
| Call/deploy a logic: `getLogicDriver`, routines, `LogicFactory`, `logicState`/`actorState`, storage fund | `references/logic.md` |
| Encode/decode calldata & manifests; the MOI type grammar | `references/manifest.md` |
| Create/transfer/mint/lockup assets; MAS0/1/2/N/X; `AssetDriver`; `AccountInherit` | `references/assets.md` |
| Op model: `OpType`, payloads, participants, fee payer, storage & access builders, the raw path | `references/interactions.md` |
| 32-byte Identifier types, byte layout, `deriveAssetId`/`deriveLogicId` | `references/identifiers.md` |
| Every helper, enum, error type, constant (new values!) | `references/utils-constants.md` |
| Hard-won patterns & gotchas (fuel cap, nonce, receipts, storage fund, fee payer, WS logs) | `references/patterns.md` |
| **Voyage devnet** demo: NFT mint→transfer, path 7020, `VoyageProvider`, the landmines | `examples/nft-mint-transfer.md` |
| Deploy/drive a logic: `LogicFactory` + `getLogicDriver`, `dynamic` vs `static` endpoints, logic vs actor state | `examples/flipper-logic-and-actor-state.md` |
| Create assets: MAS0 token + logic-backed MASX `TaxToken` (fee-on-transfer) via `AssetFactory.create` | `examples/native-assets-and-taxtoken.md` |
| Account-to-account swap with native `lockup`/`release` (two wallets, irrevocable offers) | `examples/lockup-release-swap.md` |

> **Deploying to Voyage devnet?** The generic defaults below (path
> `m/44'/6174'/0'/0/0`, `JsonRpcProvider("localhost:1600")`) derive an
> unfunded/absent account and fail in ways that look like broken wallet
> creation. Read `examples/nft-mint-transfer.md` first; it pins the devnet
> path (`7020`) and `VoyageProvider("devnet")`. Devnet was reset on 11
> September 2026: accounts from before then no longer exist.

## Setting up a project

- `npm install js-moi-sdk@0.9.0-rc2`, plus `dotenv` if you load a `.env` file
  (it is not a js-moi-sdk dependency).
- Set `"type": "module"` in `package.json` (the snippets use `import`).
- Use Node 20.10 or later: the examples load manifests with import attributes
  (`import manifest from "./x.json" with { type: "json" }`).
- The examples import companion files that are not shipped with this skill
  (compiled Coco manifests, a `.env.example`). Compile the Coco source to JSON
  first.
- Any write needs a funded devnet account: register it in MOI Wallet, then use
  the faucet at voyage.moi.technology.

## The 60-second flow

> **On Voyage devnet** (the MOI Builders default), swap steps 1 and 2 for
> `const provider = new VoyageProvider("devnet")` and
> `await Wallet.fromMnemonic(mnemonic, "m/44'/6174'/7020'/0/0")`; the localhost
> host and path-`0` below are for a **local** node and will land an unfunded
> account on devnet. See `examples/nft-mint-transfer.md`.

```js
// 1. Provider: reads the chain. LOCAL node here; on devnet use VoyageProvider("devnet").
const provider = new JsonRpcProvider("http://localhost:1600");

// 2. Wallet: a Signer built from a mnemonic. fromMnemonic is ASYNC.
//    LOCAL default path; on Voyage devnet pass "m/44'/6174'/7020'/0/0" (funded faucet index).
const wallet = await Wallet.fromMnemonic(mnemonic);   // default path m/44'/6174'/0'/0/0
wallet.connect(provider);
const me = String(await wallet.getIdentifier());       // 32-byte 0x… address

// 3. Read state (amounts are in the smallest unit; KMOI has 9 decimals, "anu")
const kmoi = await provider.getBalance(me, KMOI_ASSET_ID);   // number|bigint, anu
console.log(formatKmoi(BigInt(kmoi)), "KMOI");
const holdings = await provider.getTDU(me);                  // [{asset_id, token_id, amount}]

// 4. Move an asset: MAS0AssetLogic wraps ASSET_INVOKE ops
await new MAS0AssetLogic(assetId, wallet)
  .transfer(beneficiary, 100n)                               // amounts are BigInt for U256
  .send({ fuel_limit: 100_000 });                            // fuel_price defaults to 50; returns {hash, wait, result}

// 5. Call a logic
const driver = await getLogicDriver(logicId, wallet);        // manifest fetched from chain
const resp   = await driver.routines.SomeEndpoint(arg1, arg2).send({ fuel_limit: 60_000 });
const receipt = await resp.wait(60);                         // seconds; poll receipt
const { output, error } = await resp.result();               // decoded logic output

// 6. Read-only endpoint (no state change, no fuel spent on chain)
const { output: v } = await (await driver.routines.GetThing(arg).call()).result();

// 7. Create something (bundles a 10 KMOI storage fund automatically; needs fuel + 10 KMOI)
const created = await MAS0AssetLogic.create(wallet, "TKA", 1_000_000n, me, true, 6).send({ fuel_limit: 200_000 });
const [{ asset_id }] = await created.result();
```

## Cross-cutting facts that bite people (details in the references)

- **`Wallet.fromMnemonic` / `createRandom` / `mnemonicToSeed` are async.** Sync
  variants exist (`fromMnemonicSync`, …). Default derivation path is
  `m/44'/6174'/0'/0/0` (`MOI_DERIVATION_PATH`); apps that want a different
  account must pass the path explicitly.
- **Keystores:** `wallet.generateKeystore(password)` and
  `Wallet.fromKeystore(keystore, password, options?)` (plus
  `HDNode.fromPrivateKey`). `Wallet.fromPrivateKey` does NOT exist. Only the
  primary key is persisted; no mnemonic, and `addKey` keys must be re-added. See
  `references/wallet-signer.md`.
- **Amount params (U256) accept `number | bigint`; use `bigint`** for anything
  that can exceed 53 bits; timestamps (U64 nanoseconds) are `BigInt`. `hexToBN`
  returns `number` when it fits in 53 bits, else `bigint`; handle the union.
  Amounts are in the asset's smallest unit (`formatAmount`/`parseAmount`).
  `nowNs = BigInt(Date.now()) * 1_000_000n`.
- **Fuel is paid in KMOI and the chain reserves `fuel_limit × fuel_price` up
  front** (`fuel_price` defaults to **50**, a default and not an SDK floor; limit to
  100000). The node rejects lower prices as underpriced. Cap the limit; see `references/patterns.md` §1.
- **Every deploy/create moves 10 KMOI to the new account** (`DEFAULT_STORAGE_FUND`)
  in the same interaction, so the sender needs fuel **plus** 10 KMOI, the
  receipt has two `ix_operations`, and `result()[0]` is yours. Override with a
  trailing `new RoutineOption({ storageFund })`. See `patterns.md` §15.
- **`KMOI_ASSET_ID` changed value in 0.9.0.** Import it; never hardcode. KMOI is
  standard MASN; `Mint`/`Burn`/`Set*Metadata` on it are rejected client-side.
- **Builder name / callsite is required on deploy and on `AssetFactory.create`**
  whenever the manifest defines a deploy routine.
- **One interaction in flight per signer.** `.send()` auto-fetches the nonce;
  two concurrent sends grab the same sequence and the chain rejects one.
  Serialize sends per signer, or pass an explicit `sequence`.
- **A returned receipt does NOT mean success.** Check `receipt.status` (0 = ok)
  and each `ix_operations[i].status`/`.data`. `LOGIC_DEPLOY` can commit yet
  produce no `logic_id`.
- **`.send()` vs `.call()` is caller-chosen on logic drivers.** `.send()`
  commits an on-chain, fuel-paying interaction; `.call()` is a read-only
  simulate for static endpoints. The logic driver does not auto-route by the
  routine's `mode`; you pick. **Asset driver routines (`getAssetDriver`) do
  auto-route and execute immediately**; never chain `.send()` on them.
- **The sender is not a participant any more.** Don't add it; the node derives
  it. Fee payers are not listed either unless `notary: true`.
- **Event `log.topics[N]` are signature hashes, not field values.** Decode the
  POLO `log.data` document for canonical values. See `references/patterns.md`.
- **`provider.sendInteraction` wants an already-signed request**
  (`{ ix_args, signatures }`), not a raw ix object, on `JsonRpcProvider` AND
  `BrowserProvider` alike. Prefer the driver / `MAS0AssetLogic` / builder
  `.send()`, which sign for you (signing happens in `Signer.signInteraction`,
  never in the provider).
- **rc2 says `payer`, rc3 says `fee_payer`.** Check `VERSION` before writing
  fee-payer code (`patterns.md` §19).

## Verifying against the source

The authoritative code for this environment is the `js-moi-sdk` repo at tag
**v0.9.0-rc2**, sources under each package's `src.ts/`. When a claim here
matters, grep the `src.ts/` for the symbol; the references name the source files
(and occasionally file:line) so you can jump straight to them. Published npm
docs sometimes describe APIs that differ from this version. APIs have changed
**between release candidates** (rc1 moved `decimals` before `option`, rc3
renamed `payer`), so whenever these docs are revalidated against a new release,
update the "verified against" version stamps here and in each reference.

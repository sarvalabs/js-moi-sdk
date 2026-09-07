---
name: js-moi-sdk
description: Reference and working patterns for js-moi-sdk, the JavaScript/TypeScript SDK for the MOI Protocol blockchain (Coco logics, MAS0 assets, tesseracts, accounts, fuel/KMOI). Use whenever code imports from js-moi-sdk or its sub-packages (js-moi-providers, js-moi-wallet, js-moi-signer, js-moi-logic, js-moi-manifest, js-moi-utils, js-moi-asset, js-moi-identifiers, js-moi-interactions, js-moi-hdnode, js-moi-bip39, js-moi-constants), or when a task involves reading MOI chain state, signing/sending interactions, deploying or calling a logic, creating/transferring assets, wallets/mnemonics/keystores/sub-accounts, decoding events, or fuel/nonce/participant handling. Covers the full v0.7.1 public API plus gotchas learned building real apps against it.
homepage: https://github.com/sarvalabs/js-moi-sdk
metadata:
  openclaw:
    emoji: "⛓️"
    requires:
      bins: ["node"]
---

# js-moi-sdk

`js-moi-sdk` (npm; pinned around `^0.7.1`) is a monorepo that re-exports 12
sub-packages. Import everything from the umbrella `js-moi-sdk`; the sub-package
names only matter for understanding where a symbol lives.

```js
import {
  JsonRpcProvider, WebsocketProvider,          // js-moi-providers
  Wallet,                                       // js-moi-wallet (extends Signer)
  getLogicDriver, LogicFactory,                 // js-moi-logic
  ManifestCoder,                                // js-moi-manifest
  MAS0AssetLogic, AccountInherit,               // js-moi-asset / js-moi-interactions
  OpType, LockType, AssetStandard, ErrorCode,   // js-moi-utils (enums)
  topicHash, hexToBytes, bytesToHex, hexToBN,   // js-moi-utils (helpers)
  KMOI_ASSET_ID, ZERO_ADDRESS, MOI_DERIVATION_PATH, // js-moi-constants
} from "js-moi-sdk";
```

MOI-native concepts (accounts, tesseracts, locks, fuel, sub-accounts, events)
are summarized in `references/concepts.md` — read it first if MOI is unfamiliar.

## Read the reference that matches the task

This SKILL.md is the map; each reference is verified against the v0.7.1
`src.ts/` sources and names the files it covers. Read on demand — you rarely
need all.

| Task | Reference |
|---|---|
| MOI model: accounts, sub-accounts, tesseracts, locks, fuel, events | `references/concepts.md` |
| Read chain state; subscriptions; filters; RPC method list | `references/providers.md` |
| Wallets, mnemonics, keys, sub-accounts, HDNode, bip39, signing | `references/wallet-signer.md` |
| Call/deploy a logic: `getLogicDriver`, routines, `LogicFactory`, state reads | `references/logic.md` |
| Encode/decode calldata & manifests; the MOI type grammar | `references/manifest.md` |
| Create/transfer/mint/lockup assets; `AccountInherit`; MAS0/1/2 | `references/assets.md` |
| Op model: `OpType`, payloads, participants, the raw interaction path | `references/interactions.md` |
| 32-byte Identifier types (asset/logic/participant), byte layout | `references/identifiers.md` |
| Every helper, enum, error type, constant | `references/utils-constants.md` |
| Hard-won patterns & gotchas from real apps (fuel cap, nonce, receipts, WS logs) | `references/patterns.md` |
| **Voyage devnet** demo: working NFT mint→transfer, path 7020, `VoyageProvider`, Number `max_supply`, the 5 landmines | `examples/nft-mint-transfer.md` |
| Deploy/drive a logic: `LogicFactory` + `getLogicDriver`, `dynamic` vs `static` endpoints, logic vs actor state | `examples/flipper-logic-and-actor-state.md` |
| Create assets: MAS0 token + logic-backed MASX `TaxToken` (fee-on-transfer) via `AssetFactory.create` | `examples/native-assets-and-taxtoken.md` |
| Account-to-account swap with native `lockup`/`release` (two wallets, irrevocable offers) | `examples/lockup-release-swap.md` |

> **Deploying to Voyage devnet?** The generic defaults below (path
> `m/44'/6174'/0'/0/0`, `JsonRpcProvider("localhost:1600")`, "use bigint")
> derive an unfunded/absent account and fail in ways that look like broken
> wallet creation. Read `examples/nft-mint-transfer.md` first — it pins the
> devnet path (`7020`), `VoyageProvider("devnet")`, and Number `max_supply`.

## The 60-second flow

> **On Voyage devnet** (the MOI Builders default), swap steps 1–2 for
> `const provider = new VoyageProvider("devnet")` and
> `await Wallet.fromMnemonic(mnemonic, "m/44'/6174'/7020'/0/0")` — the localhost
> host and path-`0` below are for a **local** node and will land an unfunded
> account on devnet. See `examples/nft-mint-transfer.md`.

```js
// 1. Provider — reads the chain. LOCAL node here; on devnet use VoyageProvider("devnet").
const provider = new JsonRpcProvider("http://localhost:1600");

// 2. Wallet — a Signer built from a mnemonic. fromMnemonic is ASYNC.
//    LOCAL default path; on Voyage devnet pass "m/44'/6174'/7020'/0/0" (funded faucet index).
const wallet = await Wallet.fromMnemonic(mnemonic);   // default path m/44'/6174'/0'/0/0
wallet.connect(provider);
const me = String(await wallet.getIdentifier());       // 32-byte 0x… address

// 3. Read state
const kmoi = await provider.getBalance(me, KMOI_ASSET_ID);   // number|bigint
const holdings = await provider.getTDU(me);                  // [{asset_id, token_id, amount}]

// 4. Move an asset — MAS0AssetLogic wraps ASSET_INVOKE ops
await new MAS0AssetLogic(assetId, wallet)
  .transfer(beneficiary, 100n)                               // amounts are BigInt for U256
  .send({ fuel_limit: 50000 });                              // returns {hash, wait, result}

// 5. Call a logic
const driver = await getLogicDriver(logicId, wallet);        // manifest fetched from chain
const resp   = await driver.routines.SomeEndpoint(arg1, arg2).send({ fuel_limit: 20000 });
const receipt = await resp.wait(60);                         // seconds; poll receipt
const { output, error } = await resp.result();               // decoded logic output

// 6. Read-only endpoint (no state change, no fuel spent on chain)
const { output } = await (await driver.routines.GetThing(arg).call()).result();
```

## Cross-cutting facts that bite people (details in the references)

- **`Wallet.fromMnemonic` / `createRandom` / `mnemonicToSeed` are async.** Sync
  variants exist (`fromMnemonicSync`, …). Default derivation path is
  `m/44'/6174'/0'/0/0` (`MOI_DERIVATION_PATH`) — NOT `.../0/1`; apps that want a
  different account must pass the path explicitly.
- **Keystores exist as of 0.7.1:** `wallet.generateKeystore(password)` and
  `Wallet.fromKeystore(keystore, password, options?)` (plus
  `HDNode.fromPrivateKey`). `Wallet.fromPrivateKey` still does NOT exist. Only
  the primary key is persisted — no mnemonic, and `addKey` keys must be
  re-added. See `references/wallet-signer.md`.
- **Amount params (U256) accept `number | bigint` — use `bigint`** for anything
  that can exceed 53 bits; timestamps (U64 nanoseconds) are `BigInt`. `hexToBN`
  returns `number` when it fits in 53 bits, else `bigint` — handle the union.
  `nowNs = BigInt(Date.now()) * 1_000_000n`.
- **Fuel is paid in KMOI and the chain reserves the entire `fuel_limit` up
  front** (`fuel_price` defaults to 1). `fuel_limit` must be ≤ the signer's KMOI
  balance even for a cheap op. Cap it; see `references/patterns.md`.
- **One interaction in flight per signer.** `.send()` auto-fetches the nonce;
  two concurrent sends grab the same sequence and the chain rejects one.
  Serialize sends per signer, or pass an explicit `sequence`.
- **A returned receipt does NOT mean success.** Check `receipt.status` (0 = ok)
  and each `ix_operations[i].status`/`.data`. `LOGIC_DEPLOY` can commit yet
  produce no `logic_id`.
- **`.send()` vs `.call()` is caller-chosen.** `.send()` commits an on-chain,
  fuel-paying interaction; `.call()` is a read-only simulate for static
  endpoints. The SDK does not auto-route by the routine's `mode` — you pick.
- **Event `log.topics[N]` are signature hashes, not field values.** Decode the
  POLO `log.data` document for canonical values. See `references/patterns.md`.
- **`provider.sendInteraction` wants an already-signed request**
  (`{ ix_args, signatures }`), not a raw ix object — on `JsonRpcProvider` AND
  `BrowserProvider` alike. Prefer the driver / `MAS0AssetLogic` / builder
  `.send()`, which sign for you (signing happens in `Signer.signInteraction`,
  never in the provider).

## Verifying against the source

The authoritative code for this environment is the `js-moi-sdk` repo (main
branch, v0.7.1), sources under each package's `src.ts/`. When a claim here
matters, grep the `src.ts/` for the symbol — the references name the source
files (and occasionally file:line) so you can jump straight to them. Published
npm docs sometimes describe APIs that
differ from this version. APIs have changed **within** the 0.7.x series (e.g.
keystore support appeared in 0.7.1), so whenever these docs are revalidated
against a new release, update the "verified against" version stamps here and
in each reference.

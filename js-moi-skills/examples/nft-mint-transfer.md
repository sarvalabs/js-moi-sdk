# Voyage devnet: NFT mint → transfer (working demo)

A **lived, end-to-end** example against the Voyage **devnet**, in plain
JavaScript. The rest of this skill is the correct *generic* v0.7.1 API reference;
this file bridges "correct SDK" → "works on Voyage today" by pinning the
devnet-specific choices the generic docs leave open. **Every landmine below looks
like "wallet/signing is broken" but is a different one-line fix.**

> Use plain `.js` for live demos — no TypeScript, no `config.ts`/`provider.ts`
> scaffolding, no YAML manifests. Speed over abstraction on stage.

## Voyage-specific defaults (differ from the generic skill)

| Generic skill default | What Voyage devnet needs |
|---|---|
| derivation path `m/44'/6174'/0'/0/0` | **`m/44'/6174'/7020'/0/0`** (account index 7020) |
| `new JsonRpcProvider("http://localhost:1600")` | **`new VoyageProvider("devnet")`** |
| "use `bigint` for U256" | `max_supply` on **create** must be a **`Number`**, not `bigint` |
| MAS0 `transfer(beneficiary, amount)` | MAS1 `transfer(tokenId, beneficiary)` — **tokenId first** |

`VoyageProvider("devnet")` targets `https://dev.voyage-rpc.moi.technology/devnet/`
(`voyage-provider.ts:16-17`). Only `"devnet"` is accepted — any other string
throws `Unsupported network`.

> **Why `7020`?** Account index `7020` is the one the MOI Builders / Voyage
> **faucet funds**. The generic default `.../0'/0/0` derives a perfectly valid but
> *unfunded* account — do not "fix" the path back to `0`. If your mnemonic was
> funded at a different index, set that index; the point is it must match the
> funded account, not the SDK default.

## The five traps, in the order you hit them

1. **Wrong derivation path → "wallet doesn't exist / no KMOI."** The generic
   default path `.../0'/0/0` derives a *valid* address that simply isn't your
   funded Voyage account. Use account index **7020**:
   `m/44'/6174'/7020'/0/0`. Symptom looks like broken wallet creation; it's the
   wrong account.
2. **`bigint` `max_supply` → "Failed to sign interaction."** The SDK *type* is
   `number | bigint` (`operation.d.ts:75`), so this compiles — but devnet
   rejects the bigint form at sign time. Pass a plain `Number` on
   `ASSET_CREATE`. (Transfer/mint amounts elsewhere can still be bigint.)
3. **`fuel_limit` > KMOI balance → "insufficient funds."** The chain reserves
   the *entire* `fuel_limit` up front (`fuel_price=1`) even for a cheap op, and
   refunds the remainder. Cap `fuel_limit` to your KMOI balance. See
   `references/patterns.md` §1.
4. **YAML manifest → `ManifestCoder` breaks on unquoted `0x` literals.** Deploy
   from the **JSON** manifest, not YAML — unquoted hex scalars parse wrong.
5. **Pure endpoint touching dynamic state → receipt `status: 1`.** A Coco
   `Transfer` that calls e.g. `get_token_count()` (which reads dynamic state)
   from a *pure* endpoint reverts. Keep pure endpoints pure; don't read dynamic
   state in them. **This is a Coco-side bug, not an SDK one** — see the
   companion Coco skill: a `Transfer` endpoint must not call
   `get_token_count()` (or any dynamic-state reader). We only found this by
   trial and error; the receipt just says `status: 1`.

### Operational notes from the live demos

- **The recipient must already exist on devnet.** Transfer/mint does **not**
  auto-create the beneficiary account — fund it at
  <https://voyage.moi.technology> first, or the op fails. Check with
  `provider.getAccountMetaInfo(addr)` (throws if the account was never on chain).
- **Pre-check ownership with `getTDU` before transferring** — a `getTDU(me)`
  that doesn't list the `asset_id`/`token_id` you're about to send gives a clear
  "you don't hold this" error instead of an opaque receipt `status: 1`.
- **Re-mint before re-transferring** a token you already moved — once a token_id
  is transferred you no longer own it, so a second transfer of the same id
  reverts. Mint a fresh token for another run.
- **Save `asset_id` (and `logic_id`) to a `deployment.json` right after mint** —
  the transfer step needs the `asset_id`, and re-deriving it means re-deploying.

## Which mint / transfer path to use

Two documented paths — **do not mix them** (mixing is what produced
"asset not found" and pure-endpoint errors early on):

- **`getAssetDriver(assetId, signer).routines.Mint(...)`** — dynamic routines
  **auto-send**; do **not** chain `.send()`.
- **`new MAS1AssetLogic(assetId, signer).transfer(tokenId, beneficiary).send({ fuel_limit })`**
  — the wrapper path *does* use `.send()`.

For the on-stage NFT demo: mint via the driver routine, transfer via
`MAS1AssetLogic`.

## Full flow (plain JS, complete)

This matches the companion `NFTCollection` Coco contract, whose mint routine is
`Mint(beneficiary Identifier, name String, image_uri String)`. Deploy the
logic-backed MAS1 asset from its **JSON** manifest, then mint and transfer.

```js
import 'dotenv/config'
import { writeFileSync } from 'node:fs'
import {
  Wallet, VoyageProvider, AssetFactory, MAS1AssetLogic, getAssetDriver, KMOI_ASSET_ID,
} from "js-moi-sdk";
import manifest from "../coco/nft_collection.json" with { type: 'json' };

const VOYAGE_PATH = "m/44'/6174'/7020'/0/0";   // funded faucet account index (see "Why 7020")

const provider = new VoyageProvider("devnet");
const wallet = await Wallet.fromMnemonic(process.env.MOI_MNEMONIC, VOYAGE_PATH);  // async
wallet.connect(provider);
const me = String(await wallet.getIdentifier());

// cap fuel to KMOI so a cheap op can't ask for more than you hold
const kmoi = BigInt(String(await provider.getBalance(me, KMOI_ASSET_ID)));
const fuel = (want) => Number(kmoi < BigInt(want) ? kmoi : BigInt(want));

// 1. create the logic-backed MAS1 asset — max_supply is a plain Number here,
//    and the trailing args are the Coco `Init()` calldata (none for this contract).
const createIx = await AssetFactory.create(
  wallet, "NFTCollection", 1000 /* Number, not 1000n */, me, true, manifest, "Init",
).send();
const [{ asset_id }] = await createIx.result();
writeFileSync("deployment.json", JSON.stringify({ asset_id }, null, 2));  // transfer needs this

// 2. mint — dynamic driver routine AUTO-SENDS (no .send()); args match the Coco Mint()
const driver = await getAssetDriver(asset_id, wallet);
const mintResp = await driver.routines.Mint(me, "Pip #0", "ipfs://QmExample");
await mintResp.wait(60);
const { output } = await mintResp.result();
const tokenId = output?.token_id ?? 0;   // Mint returns the new token_id

// 3. transfer — MAS1AssetLogic, tokenId FIRST, this path DOES use .send()
const beneficiary = process.env.RECIPIENT;                 // must already exist on devnet
// ownership pre-check → clearer error than an opaque receipt status:1
const tdu = await provider.getTDU(me);
if (!tdu.some((t) => t.asset_id === asset_id)) throw new Error("you don't hold this asset");

const resp = await new MAS1AssetLogic(asset_id, wallet)
  .transfer(tokenId, beneficiary)          // (tokenId, beneficiary) — not (beneficiary, amount)
  .send({ fuel_limit: fuel(50000) });
const receipt = await resp.wait(60);
if (receipt.status !== 0) throw new Error(`transfer failed, status ${receipt.status}`);
```

> Splitting this across `mint.js` / `transfer.js`? Have `mint.js` write
> `deployment.json` (`{ asset_id, token_id }`) and `transfer.js` read it back —
> the transfer step needs the `asset_id` and the specific `token_id`.

## Registering the recipient (and a Babylon devnet landmine)

"The recipient must already exist on devnet" has a concrete fix: if the account
has never appeared on chain, **create it with a `PARTICIPANT_CREATE`
interaction** before transferring. A convenient demo pattern is to derive both
accounts from **one mnemonic at two paths** — owner `m/44'/6174'/7020'/0/0`,
recipient `m/44'/6174'/7020'/0/1`.

```js
import { InteractionContext, OpType, KMOI_ASSET_ID, LockType } from "js-moi-sdk";

async function accountExists(provider, address) {
  try { await provider.getAccountMetaInfo(address); return true; }
  catch (err) { if ((err?.message ?? err?.reason) === "account not found") return false; throw err; }
}

async function ensureRecipientRegistered(provider, ownerWallet, recipientWallet, recipient) {
  if (await accountExists(provider, recipient)) return;
  const owner = String(await ownerWallet.getIdentifier());
  const { fuelLimit } = await cappedFuel(provider, owner, 200_000);   // see patterns.md §1
  const resp = await new InteractionContext({
    opType: OpType.PARTICIPANT_CREATE,
    payload: {
      id: recipient,
      keys_payload: [{ public_key: recipientWallet.getPublicKey(), weight: 1000, signature_algorithm: 0 }],
      value: { asset_id: KMOI_ASSET_ID, callsite: "Symbol" },   // ← see landmine below
    },
    participants: [{ id: KMOI_ASSET_ID, lock_type: LockType.NO_LOCK }],
    signer: ownerWallet,
  }).send({ fuel_limit: fuelLimit });
  const receipt = await resp.wait(120);
  if (receipt.status !== 0) throw new Error(`PARTICIPANT_CREATE failed: status ${receipt.status}`);
}
```

> **Babylon landmine:** seeding the new account with KMOI via
> `PARTICIPANT_CREATE`'s `value` using a **`Transfer`** callsite **fails on
> Babylon devnet**. Using `callsite: "Symbol"` (a read-only no-op) registers the
> account without the failing transfer. This one cost real time and is worth
> flagging to the protocol team — the register-with-transfer path may be a
> devnet bug, not intended behavior.

## Confirming ownership: `IsOwner` (logic read) + `getTDU`

Two independent checks — the collection logic's own `IsOwner` static routine, and
the native `getTDU`. Use both after a transfer for a defense-in-depth verify:

```js
// logic read — static routine on the asset driver, resolves { output, error } directly
const res = await driver.routines.IsOwner(tokenId, address);
const isOwner = res?.output?.is_owner ?? res?.output ?? false;

// native holdings — note TDU entries carry token_id (not just asset_id + amount)
const tdu = await provider.getTDU(holder);
const holds = tdu.some((e) => e.asset_id === assetId
  && BigInt(e.token_id) === BigInt(tokenId) && Number(e.amount) > 0);
```

> **Mint/read output shapes aren't stable — extract defensively.** A dynamic
> routine's decoded output can arrive as a `bigint`/`number`, a positional array,
> or an object (`{ token_id }` / `{ is_owner }`). Handle all three rather than
> assuming one, e.g. `decoded?.token_id ?? (Array.isArray(decoded) ? decoded[0] : decoded)`.

## Why this file matters

Reading the generic skill alone, an agent follows the documented defaults
(`.../0'/0/0`, `localhost:1600`, "use bigint") and lands a wallet that's either
absent on devnet or unfunded — which *looks* like broken wallet creation but is
just the wrong path. The API in the references is right; this file records the
Voyage choices and the five landmines so the demo is reliable the first time.

# Voyage devnet: NFT mint → transfer (working demo)

A **lived, end-to-end** example against the Voyage **devnet**, in plain
JavaScript, first run with js-moi-sdk 0.7.1 and re-checked against the
v0.9.0-rc2 sources. The rest of this skill is the correct *generic* API
reference; this file bridges "correct SDK" → "works on Voyage today" by pinning
the devnet-specific choices the generic docs leave open. **Every landmine below
looks like "wallet/signing is broken" but is a different one-line fix.**

> Devnet was reset on 11 September 2026 (node 0.13.0). Accounts, assets and
> logics from before then are gone; a mnemonic that was funded in the summer
> answers `account not found` until the account is created again.

> Use plain `.js` for live demos ; no TypeScript, no `config.ts`/`provider.ts`
> scaffolding, no YAML manifests. Speed over abstraction on stage.

## Voyage-specific defaults (differ from the generic skill)

| Generic skill default | What Voyage devnet needs |
|---|---|
| derivation path `m/44'/6174'/0'/0/0` | **`m/44'/6174'/7020'/0/0`** (account index 7020) |
| `new JsonRpcProvider("http://localhost:1600")` | **`new VoyageProvider("devnet")`** |
| "the create is one op" | every create also sends **10 KMOI** to the new asset as a storage fund (0.8.0); budget fuel + 10 KMOI |
| MAS0 `transfer(beneficiary, amount)` | MAS1 `transfer(tokenId, beneficiary)` ; **tokenId first** |

`VoyageProvider("devnet")` targets `https://dev.voyage-rpc.moi.technology/devnet/`
(`voyage-provider.ts:16-17`). Only `"devnet"` is accepted ; any other string
throws `Unsupported network`.

> **Why `7020`?** Account index `7020` is the one the MOI Builders / Voyage
> **faucet funds**. The generic default `.../0'/0/0` derives a perfectly valid but
> *unfunded* account ; do not "fix" the path back to `0`. If your mnemonic was
> funded at a different index, set that index; the point is it must match the
> funded account, not the SDK default.

## The five traps, in the order you hit them

1. **Wrong derivation path → "wallet doesn't exist / no KMOI."** The generic
   default path `.../0'/0/0` derives a *valid* address that simply isn't your
   funded Voyage account. Use account index **7020**:
   `m/44'/6174'/7020'/0/0`. Symptom looks like broken wallet creation; it's the
   wrong account.
2. **Not enough KMOI for the storage fund → the create reverts.** Since 0.8.0
   every `AssetFactory.create` / `MASx.create` bundles a `Transfer` of
   `DEFAULT_STORAGE_FUND` (10 KMOI) to the new asset account in the same
   interaction. A faucet account with 5 KMOI cannot create anything. (The 0.7.1
   landmine here was "`bigint` `max_supply` fails at sign time"; 0.8.0 lists
   "Fixed BigInt asset supply handling" and the validator takes `number | bigint`,
   so pass whichever you like, but `> 0`.)
3. **`fuel_limit × fuel_price` > KMOI balance → "insufficient funds."** The chain
   reserves the *entire* product up front (`fuel_price` defaults to **50**
   since 0.9.0; a price of 1 is rejected as underpriced) even for a cheap op,
   and refunds the remainder. Cap `fuel_limit` to `(balance - storageFund) / 50`.
   See `references/patterns.md` §1.
4. **YAML manifest → `ManifestCoder` breaks on unquoted `0x` literals.** Deploy
   from the **JSON** manifest, not YAML ; unquoted hex scalars parse wrong.
5. **Pure endpoint touching dynamic state → receipt `status: 1`.** A Coco
   `Transfer` that calls e.g. `get_token_count()` (which reads dynamic state)
   from a *pure* endpoint reverts. Keep pure endpoints pure; don't read dynamic
   state in them. **This is a Coco-side bug, not an SDK one** ; see the
   companion Coco skill: a `Transfer` endpoint must not call
   `get_token_count()` (or any dynamic-state reader). We only found this by
   trial and error; the receipt just says `status: 1`.

### Operational notes from the live demos

- **The recipient must already exist on devnet.** Transfer/mint does **not**
  auto-create the beneficiary account ; fund it at
  <https://voyage.moi.technology> first, or the op fails. Check with
  `provider.getAccountMetaInfo(addr)` (throws if the account was never on chain).
- **Pre-check ownership with `getTDU` before transferring** ; a `getTDU(me)`
  that doesn't list the `asset_id`/`token_id` you're about to send gives a clear
  "you don't hold this" error instead of an opaque receipt `status: 1`.
- **Re-mint before re-transferring** a token you already moved ; once a token_id
  is transferred you no longer own it, so a second transfer of the same id
  reverts. Mint a fresh token for another run.
- **Save `asset_id` (and `logic_id`) to a `deployment.json` right after mint** ;
  the transfer step needs the `asset_id`, and re-deriving it means re-deploying.

## Which mint / transfer path to use

Two documented paths ; **do not mix them** (mixing is what produced
"asset not found" and pure-endpoint errors early on):

- **`getAssetDriver(assetId, signer).routines.Mint(...)`**: dynamic routines
  **execute themselves** (the driver calls `.send()`); do **not** chain
  `.send()`. Static ones resolve straight to `{ output, error }`. A trailing
  `new RoutineOption({ fuelLimit })` is honoured on this path.
- **`new MAS1AssetLogic(assetId, signer).transfer(tokenId, beneficiary).send({ fuel_limit })`**:
  the wrapper path *does* use `.send()` with a snake_case `IxOption`.

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
  Wallet, VoyageProvider, AssetFactory, MAS1AssetLogic, getAssetDriver,
  KMOI_ASSET_ID, DEFAULT_FUEL_PRICE, DEFAULT_STORAGE_FUND, formatKmoi,
} from "js-moi-sdk";
import manifest from "../coco/nft_collection.json" with { type: 'json' };

const VOYAGE_PATH = "m/44'/6174'/7020'/0/0";   // funded faucet account index (see "Why 7020")

const provider = new VoyageProvider("devnet");
const wallet = await Wallet.fromMnemonic(process.env.MOI_MNEMONIC, VOYAGE_PATH);  // async
wallet.connect(provider);
const me = String(await wallet.getIdentifier());

// cap fuel to what KMOI can reserve (fuel_limit × fuel_price), leaving the storage fund aside
const kmoi = BigInt(String(await provider.getBalance(me, KMOI_ASSET_ID)));        // anu
const fuel = (want, reserve = 0n) => {
  const max = (kmoi - reserve) / BigInt(DEFAULT_FUEL_PRICE);
  if (max <= 0n) throw new Error(`need more KMOI: have ${formatKmoi(kmoi)}`);
  return Number(max < BigInt(want) ? max : BigInt(want));
};

// 1. create the logic-backed MAS1 asset. manifest + callsite are required (0.8.0);
//    the trailing args are the Coco `Init()` calldata (none for this contract).
//    The SDK bundles a 10 KMOI storage-funding transfer as a second op.
const createIx = await AssetFactory.create(
  wallet, "NFTCollection", 1000n, me, true, manifest, "Init",
).send({ fuel_limit: fuel(2_000_000, BigInt(DEFAULT_STORAGE_FUND)) });
const createReceipt = await createIx.wait(120);
if (createReceipt.status !== 0) throw new Error(`create failed, status ${createReceipt.status}`);
const [{ asset_id }] = await createIx.result();            // op 0 = create, op 1 = funding
writeFileSync("deployment.json", JSON.stringify({ asset_id }, null, 2));  // transfer needs this

// 2. mint: a dynamic asset-driver routine EXECUTES ITSELF (no .send()); args match the Coco Mint()
const driver = await getAssetDriver(asset_id, wallet);
const mintResp = await driver.routines.Mint(me, "Pip #0", "ipfs://QmExample");
if ((await mintResp.wait(60)).status !== 0) throw new Error("mint failed");
const { output } = await mintResp.result();
const tokenId = output?.token_id ?? (Array.isArray(output) ? output[0] : output) ?? 0;   // Mint returns the new token_id

// 3. transfer: MAS1AssetLogic, tokenId FIRST, this path DOES use .send()
const beneficiary = process.env.RECIPIENT;                 // must already exist on devnet
// ownership pre-check → clearer error than an opaque receipt status:1
const tdu = await provider.getTDU(me);
if (!tdu.some((t) => t.asset_id === asset_id)) throw new Error("you don't hold this asset");

const resp = await new MAS1AssetLogic(asset_id, wallet)
  .transfer(tokenId, beneficiary)          // (tokenId, beneficiary), not (beneficiary, amount)
  .send({ fuel_limit: fuel(100_000) });
const receipt = await resp.wait(60);
if (receipt.status !== 0) throw new Error(`transfer failed, status ${receipt.status}`);
```

> Splitting this across `mint.js` / `transfer.js`? Have `mint.js` write
> `deployment.json` (`{ asset_id, token_id }`) and `transfer.js` read it back ;
> the transfer step needs the `asset_id` and the specific `token_id`.

## Registering the recipient (and a Babylon devnet landmine)

"The recipient must already exist on devnet" has a concrete fix: if the account
has never appeared on chain, **create it with a `PARTICIPANT_CREATE`
interaction** before transferring. A convenient demo pattern is to derive both
accounts from **one mnemonic at two paths** ; owner `m/44'/6174'/7020'/0/0`,
recipient `m/44'/6174'/7020'/0/1`.

```js
import { InteractionContext, OpType, KMOI_ASSET_ID, LockType, DEFAULT_FUEL_PRICE, DEFAULT_STORAGE_FUND } from "js-moi-sdk";

// Fuel-cap helper, copied from references/patterns.md section 1.
const cappedFuel = async (provider, address, wantFuel, { fuelPrice = DEFAULT_FUEL_PRICE, reserve = 0n } = {}) => {
  let kmoi = 0n;                                   // anu
  try { kmoi = BigInt(String(await provider.getBalance(address, KMOI_ASSET_ID))); }
  catch { kmoi = 0n; }
  const spendable = kmoi - BigInt(reserve);        // reserve = storage fund on create/deploy
  if (spendable <= 0n) throw new Error(`${address} has no KMOI to pay fuel.`);
  const maxLimit = spendable / BigInt(fuelPrice);
  const want = BigInt(wantFuel);
  const fuelLimit = maxLimit < want ? Number(maxLimit) : Number(want);
  return { fuelLimit, kmoi, capped: maxLimit < want };
};

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
      keys_payload: [{ public_key: recipientWallet.getPublicKey(), weight: 1000, signature_algorithm: 0 }],  // weight ≥ 1000 (node rule; rc3 enforces client-side)
      value: { asset_id: KMOI_ASSET_ID, callsite: "Symbol" },   // ← see landmine below
    },
    participants: [{ id: KMOI_ASSET_ID, lock_type: LockType.NO_LOCK }],   // also auto-derived; harmless
    signer: ownerWallet,
  }).send({ fuel_limit: fuelLimit });   // the ParticipantCreate builder cannot do this: its .value() always emits the "Transfer" callsite, so it has no Symbol workaround
  const receipt = await resp.wait(120);
  if (receipt.status !== 0) throw new Error(`PARTICIPANT_CREATE failed: status ${receipt.status}`);
}
```

> **Babylon landmine:** seeding the new account with KMOI via
> `PARTICIPANT_CREATE`'s `value` using a **`Transfer`** callsite **fails on
> Babylon devnet**. Using `callsite: "Symbol"` (a read-only no-op) registers the
> account without the failing transfer. This one cost real time and is worth
> flagging to the protocol team ; the register-with-transfer path may be a
> devnet bug, not intended behavior.

## Confirming ownership: `IsOwner` (logic read) + `getTDU`

Two independent checks ; the collection logic's own `IsOwner` static routine, and
the native `getTDU`. Use both after a transfer for a defense-in-depth verify:

```js
// logic read ; static routine on the asset driver, resolves { output, error } directly
const res = await driver.routines.IsOwner(tokenId, address);
const isOwner = res?.output?.is_owner ?? res?.output ?? false;

// native holdings ; note TDU entries carry token_id (not just asset_id + amount)
const tdu = await provider.getTDU(holder);
const holds = tdu.some((e) => e.asset_id === assetId
  && BigInt(e.token_id) === BigInt(tokenId) && Number(e.amount) > 0);
```

> **Mint/read output shapes aren't stable ; extract defensively.** A dynamic
> routine's decoded output can arrive as a `bigint`/`number`, a positional array,
> or an object (`{ token_id }` / `{ is_owner }`). Handle all three rather than
> assuming one, e.g. `decoded?.token_id ?? (Array.isArray(decoded) ? decoded[0] : decoded)`.

## Why this file matters

Reading the generic skill alone, an agent follows the documented defaults
(`.../0'/0/0`, `localhost:1600`) and lands a wallet that's either absent on
devnet or unfunded, which *looks* like broken wallet creation but is just the
wrong path. The API in the references is right; this file records the Voyage
choices and the five landmines so the demo is reliable the first time.

**Re-verification status (13 October 2026):** every SDK call on this page was
checked against the v0.9.0-rc2 sources and exercised offline and syntax-checked
against the installed `js-moi-sdk@0.9.0-rc2` package; the on-chain run was last performed with 0.7.1
before the September devnet reset. Re-run it with a funded post-reset account
before relying on the transfer landmines.

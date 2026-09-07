# Working patterns & gotchas (learned building real apps)

Distilled from building real apps against js-moi-sdk. These are the things that
cost hours the first time. Copy/adapt the snippets.
SDK-side claims verified against the js-moi-sdk sources (v0.7.1).

## 1. Cap fuel to the KMOI balance

The chain reserves the **entire** `fuel_limit` (× `fuel_price=1`) up front, even
if the op is cheap, and refunds the remainder. So an account can't submit an IX
whose `fuel_limit` exceeds its KMOI balance. Cap it and fail clearly when broke:

```js
import { KMOI_ASSET_ID } from "js-moi-sdk";

export const cappedFuel = async (provider, address, wantFuel) => {
  let kmoi = 0n;
  try { kmoi = BigInt(String(await provider.getBalance(address, KMOI_ASSET_ID))); }
  catch { kmoi = 0n; }
  if (kmoi <= 0n) throw new Error(`${address} has no KMOI to pay fuel.`);
  const want = BigInt(wantFuel);
  const fuelLimit = kmoi < want ? Number(kmoi) : Number(want);
  return { fuelLimit, kmoi, capped: kmoi < want };
};
```

Rough guidance: cheap ops ~20000; heavier logic calls 2–8×; deploy can need
hundreds of thousands to millions. Prefer `.estimateFuel()` when unsure (the
logic `.send()` auto-estimates if you omit `fuel_limit`), but still cap to KMOI.

## 2. One send in flight per signer (nonce serialization)

`.send()` auto-fetches the nonce. Two concurrent sends from one signer grab the
same sequence → the chain rejects one ("replacement ix underpriced" / "invalid
nonce"). Serialize:

```js
let gate = Promise.resolve();
const serializeSend = (fn) => {
  const q = gate.then(fn, fn);
  gate = q.then(() => {}, () => {});
  return q;
};
// await serializeSend(() => driver.routines.X(...).send(opts));
```

To deliberately replace a stuck IX, pass an explicit `{ sequence }` (and a
higher `fuel_limit`) in the send option.

## 3. A receipt does NOT mean success — check status AND op error

```js
const resp = await driver.routines.DoThing(...).send({ fuel_limit });
const receipt = await resp.wait(60);          // seconds; throws on timeout
// receipt.status: 0 = ok, non-zero = failure (e.g. out-of-fuel)
if (receipt.status !== 0) throw new Error(`ix failed, status ${receipt.status}`);
for (const op of receipt.ix_operations ?? []) {
  if (op.status !== 0) throw new Error(`op ${op.tx_type} failed`);
  // op.data carries the op result; a reverted logic op has an error to decode
}
```

Robust polling alternative (survives RPC blips) — an unmined ix has
`ts_hash === ZERO_HASH`:

```js
const ZERO_HASH = "0x" + "0".repeat(64);
const tx = await provider.getInteractionByHash(resp.hash);
const mined = tx?.ts_hash && tx.ts_hash !== ZERO_HASH;
const ops = (tx.receipt ?? tx)?.ix_operations ?? (tx.receipt ?? tx)?.op_results ?? [];
const errHex = ops.map(o => o?.error ?? o?.data?.error).find(e => e && e !== "0x");
// errHex truthy → the op reverted; decode with ManifestCoder.decodeException(errHex)
```

## 4. Deploy: committed ≠ created — check for a logic_id

`LOGIC_DEPLOY` can pass consensus (nonce burns) yet materialize no logic on a
misconfigured node. Two-layer check:

```js
const resp = await new LogicFactory(manifest, wallet).deploy(callsite).send({ fuel_limit });
const receipt = await resp.wait(120);
const op = receipt?.ix_operations?.[0];
const { logic_id } = await resp.result();     // driver-decoded
if (!logic_id && !op?.data?.logic_id) {
  // interaction landed but NO logic was created — inspect the node/storage config
  throw new Error("deploy committed but returned no logic_id");
}
```

`callsite` = the deploy/constructor routine name, or `undefined` to deploy
without invoking any constructor (useful to isolate deploy vs constructor bugs).
You can also find the fresh logic id as the `0x20…`-prefixed, height-`0x0` entry
in `getInteractionByHash(hash).participants` (the field is `participants`;
`participants_state` does not exist).

## 5. Decode events from the DATA document, not the topics

`log.topics[N]` are signature hashes (`topicHash(name)` and per-`topic` fields),
**not** the field values. The canonical values live in the POLO-encoded
`log.data`. Two ways to decode:

```js
// (a) via ManifestCoder (needs the logic manifest)
const evt = coder.decodeEventOutput("IntentAnnounced", log.data);

// (b) via a hand-built js-polo schema (no manifest needed)
import { topicHash } from "js-moi-utils";
import { Document } from "js-polo";
const SCHEMA = { kind: "struct", fields: {
  owner: { kind: "bytes" }, intent_id: { kind: "bytes" },
  offered_amount: { kind: "integer" }, /* … all fields, incl. topic fields … */
}};
const EVENT_TOPICS = { [topicHash("IntentAnnounced")]: "IntentAnnounced" };
const name = (log.topics ?? []).map(t => EVENT_TOPICS[t]).find(Boolean);
if (name) {
  const bytes = hexToBytes(log.data);
  const decoded = new Document(bytes, SCHEMA).getData();
}
```

Struct field schemas are keyed by field label; `identifier`/`bytes` → `{ kind:
"bytes" }`, integers → `{ kind: "integer" }`, bools → `{ kind: "bool" }`,
strings → `{ kind: "string" }`.

## 6. The js-polo readUInt patch (nanosecond timestamps)

`js-polo`'s `ReadBuffer.readUInt` returns a JS `Number` and **loses precision on
integers wider than 6 bytes** — which silently corrupts nanosecond timestamps
(U64) and any hash computed over them. If you decode events/build hashes with
POLO, install this patch once (import it before decoding):

```js
import { ReadBuffer } from "js-polo/dist/readbuffer.js";
if (ReadBuffer?.prototype?.readUInt && !ReadBuffer.prototype.__u256Patched) {
  const orig = ReadBuffer.prototype.readUInt;
  ReadBuffer.prototype.readUInt = function (data) {
    if (data.length <= 6) return orig.call(this, data);
    return BigInt("0x" + Array.from(data).map(b => b.toString(16).padStart(2, "0")).join(""));
  };
  ReadBuffer.prototype.__u256Patched = true;
}
```

## 7. Live log discovery over WebSocket (raw frame)

A `NO_LOCK` logic's own height never advances, so you can't list all its logs by
id. For live discovery, subscribe to `newLogs`. **Some nodes reject the SDK's
object-form subscription** (`provider.on({event:"newLogs", params:{address}})`)
with "invalid identifier" — the node wants `{ id }`, not `{ address }`. Send the
raw frame yourself over a plain WebSocket:

```js
socket.send(JSON.stringify({
  jsonrpc: "2.0", id: "sub-1", method: "moi.Subscribe",
  params: ["newLogs", { id: LOGIC_ID }],
}));
// server → { id: "sub-1", result: <subId> }, then per-log:
//   { method: "moi.subscription", params: { subscription: <subId>, result: <Log|Log[]> } }
```

The stream can carry co-emitted logs from **other** logics in the same
interaction (e.g. an asset `Lockup` log emitted while a routine ran) — filter by
`log.logic_id` (or `log.id`) before decoding, and dedupe on
`ts_hash:ix_hash:topics:data`.

## 8. Per-account history (ranged getLogs)

To read one account's own past events (it must be the *sender* that emitted
them):

```js
const meta = await provider.getAccountMetaInfo(accountId);   // throws if never on chain
const head = parseInt(String(meta.height), 16);
const logs = await provider.getLogs({ id: accountId, height: [0, head], topics: [] });
// filter by logic_id, then decode (see §5)
```

Note the server limits the height span per call (docstring: >10 rejected) — page
in chunks for long histories.

## 9. "account not found" is normal, not an error

`getAccountMetaInfo` / `getContextInfo` / `getSubAccountCount` / `getBalance`
throw when the account/asset hasn't appeared on chain yet. Treat that specific
error as "not yet" rather than fatal:

```js
const orNull = async (fn) => {
  try { return await fn(); }
  catch (e) {
    if (e?.message === "account not found" || e?.reason === "account not found") return null;
    if (e?.message === "asset not found"   || e?.reason === "asset not found")   return null;
    throw e;
  }
};
```

## 10. AssetInfo numeric fields come back as hex

`provider.getAssetInfoByAssetID(id)` returns `symbol`, `decimals`, `max_supply`,
`circulating_supply`, … with numeric fields as **raw `0x` hex strings** (the SDK
doesn't decode them). Convert yourself:

```js
const info = await provider.getAssetInfoByAssetID(assetId);
const decimals = Number(BigInt(info.decimals ?? "0x0"));
const maxSupply = BigInt(info.max_supply ?? "0x0");
```

Discover an account's asset symbols by walking `getTDU` and looking each up:

```js
const tdu = await provider.getTDU(holder);           // [{ asset_id, token_id, amount }]
for (const { asset_id } of tdu) {
  const { symbol } = await provider.getAssetInfoByAssetID(asset_id);
}
```

## 11. Sub-account address arithmetic

A sub-account address = primary's first 28 bytes + 4-byte big-endian index. So
you can enumerate/derive without a round-trip, or use the wallet:

```js
// derive via wallet (authoritative)
wallet.setSubAccountId(index);
const subAddr = String(await wallet.getIdentifier());
wallet.setSubAccountId(0);                           // back to primary

// recover index from an address
const index = parseInt(subAddr.slice(-8), 16);
```

Detect which sub-account is inherited under a logic by scanning
`getSubAccountCount(primary)` indices and checking each candidate's
`getContextInfo` for the logic id.

## 12. Fixed 32-byte args (Identifier / U256 hash)

Some routines take an `identifier`/`u256` that must be exactly 32 bytes. Convert
a hash/bigint/hex to a 32-byte big-endian `Uint8Array`:

```js
export const u256bytes = (value) => {
  if (value instanceof Uint8Array && value.length === 32) return value;
  const big = typeof value === "bigint" ? value : BigInt(value);
  const hex = big.toString(16).padStart(64, "0");
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
};
// e.g. driver.routines.AcceptProposal(u256bytes(proposalHash)).send({ fuel_limit })
```

## 13. Serializing BigInt in JSON / logs

Amounts and timestamps are `BigInt`; `JSON.stringify` throws on them. Use a
replacer:

```js
const bigintReplacer = (_, v) => typeof v === "bigint" ? v.toString() : v;
JSON.stringify(obj, bigintReplacer, 2);
```

## 14. ESM & imports

The SDK ships dual builds — CJS (`main` → `lib.cjs`) and ESM (`module` →
`lib.esm`); ESM apps set `"type": "module"`. Import the common surface
from `js-moi-sdk`; only import a sub-package directly for something the umbrella
doesn't re-export or to deep-import an internal (e.g. `js-polo/dist/readbuffer.js`
for the patch above). `js-polo` (`Document`, `Polorizer`, `Depolorizer`) is its
own package (a regular dependency of `js-moi-manifest`, not a peer dep) — add it
to your app's dependencies for hand-rolled POLO encode/decode.

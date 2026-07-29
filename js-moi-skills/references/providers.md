# js-moi-providers — reading the chain, submitting, subscribing

Verified against `packages/js-moi-providers/src.ts/` (v0.7.1). Line refs are
relative to that package.

## Quick start — Voyage devnet (the default for MOI Builders)

For the hosted Voyage **devnet**, this is the whole setup:

```js
import { VoyageProvider, Wallet } from "js-moi-sdk";
const provider = new VoyageProvider("devnet");   // https://dev.voyage-rpc.moi.technology/devnet/
const wallet = await Wallet.fromMnemonic(mnemonic, "m/44'/6174'/7020'/0/0"); // funded faucet index
wallet.connect(provider);
```

Only `"devnet"` is accepted (any other string throws `Unsupported network`).
Use `JsonRpcProvider("http://localhost:1600")` + path `m/44'/6174'/0'/0/0` only
for a **local** node — those defaults land an unfunded account on devnet. See
`examples/nft-mint-transfer.md` for the full devnet flow and its landmines.

## Classes

`EventEmitter → AbstractProvider → BaseProvider →` the four concrete providers.
`BaseProvider` implements **every** read/query/submit method; the concrete
classes differ only in transport, so all methods below exist on all of them.
(`AbstractProvider` is exported too — extend it for a custom transport.)

| Class | Constructor | Use |
|---|---|---|
| `JsonRpcProvider` | `new JsonRpcProvider(host: string)` | HTTP(S) transport. Accepts `http(s)://` and, by regex only, `ws(s)://` — but it **POSTs over HTTP**; it does NOT do real WebSocket. `jsonrpc-provider.ts:12` |
| `WebsocketProvider` | `new WebsocketProvider(host, options?: WebsocketConnection)` | Real WS transport + subscriptions. `host` must be `ws(s)://`. `websocket-provider.ts:33` |
| `VoyageProvider` | `new VoyageProvider("devnet")` | Hosted devnet; only `"devnet"` supported. `voyage-provider.ts:12` |
| `BrowserProvider` | `new BrowserProvider(transport)` | Wraps an injected wallet (e.g. `globalThis.moi`); wallet signs. `browser-provider.ts:27` |

`WebsocketConnection` (`websocket-provider.ts:11`): `{ protocols?, headers?,
requestOptions?, clientConfig?, reconnect?: { delay, maxAttempts }, timeout? }`.
Auto-reconnect on non-1000 close happens **only if you pass the `reconnect`
option** (up to `maxAttempts`, polling every `delay` ms) — without it a drop
just emits `'close'`. RPC calls made before the socket is OPEN queue until
`connect`. `disconnect(): Promise<void>` closes cleanly.

## `Options` (tesseract selector)

Most reads take an optional `options?: Options` =
`{ tesseract_number?: number; tesseract_hash?: string }`, default
`{ tesseract_number: -1 }` (latest). Pass it to pin a read to a past tesseract.

## Read / account methods

Numeric fields are hex on the wire; the methods marked "hex→BN" decode with
`hexToBN` and return `number | bigint`. **Many methods do NOT decode** (see
Gotchas) — you get raw hex strings.

| Method | Signature | RPC | Notes |
|---|---|---|---|
| `getBalance` | `(id, assetId, options?) → number\|bigint` | `moi.Balance` | one asset's balance, hex→BN |
| `getTDU` | `(id, options?) → TDU[]` | `moi.TDU` | everything held; `{asset_id, token_id, amount}` amounts hex→BN |
| `getContextInfo` | `(id, options?) → ContextInfo` | `moi.ContextInfo` | `{behaviour_nodes, random_nodes, storage_nodes}` — logic links |
| `getInteractionByHash` | `(ixHash) → Interaction` | `moi.InteractionByHash` | ix + `participants` (there is no `participants_state` field) |
| `getInteractionByTesseract` | `(id?, options?, ix_index=1)` | `moi.InteractionByTesseract` | overloaded by first-arg type |
| `getInteractionCount` | `(id, keyId, options?) → number\|bigint` | `moi.InteractionCount` | next nonce for that key; **keyId is required** |
| `getPendingInteractionCount` | `(id, keyId) → number\|bigint` | `moi.PendingInteractionCount` | includes ixpool |
| `getAccountState` | `(id, options?) → AccountState` | `moi.AccountState` | nonce, balance, roots… (raw hex) |
| `getAccountKeys` | `(id, options?) → AccountKey[]` | `moi.AccountKeys` | `{id, publicKey, weight, …}` |
| `getAccountMetaInfo` | `(id) → AccountMetaInfo` | `moi.AccountMetaInfo` | `{type, id, height, tesseract_hash, …}`; **ignores options** |
| `getSubAccountCount` | `(id, options?) → number\|bigint` | `moi.SubAccountCount` | how many sub-accounts a primary has |
| `getContentFrom` | `(id) → ContentFrom` | `ixpool.ContentFrom` | `{pending, queued}` as `Map<nonce, InteractionInfo>` |
| `getWaitTime` | `(id) → number\|bigint` | `ixpool.WaitTime` | declared return is `Promise<number\|bigint>` (seconds), not the `WaitTime` object |
| `getTesseract` | overloaded (below) | `moi.Tesseract` | a block by account+index or by hash/number |
| `getLogicIds` | `(id, options?) → string[]` | `moi.LogicIDs` | logics an account owns/deployed |
| `getRegistry` | `(id, options?) → Registry` | `moi.Deeds` | |
| `getSyncStatus` | `(id?) → SyncStatus` | `moi.Syncing` | |

### Overloads

```ts
// by account id  |  or by tesseract (via options.tesseract_hash/_number)
getTesseract(id: string, with_interactions: boolean, with_commit_info: boolean, options?): Promise<Tesseract>
getTesseract(with_interactions: boolean, with_commit_info: boolean, options: Options): Promise<Tesseract>
// e.g. full tesseract by hash:
await provider.getTesseract(true, true, { tesseract_hash: tsHash });
```

```ts
getInteractionByTesseract(address: string, options?, ix_index = 1)
getInteractionByTesseract(options: Options, ix_index = 1)
```

## Execution / submission

| Method | Signature | RPC | Notes |
|---|---|---|---|
| `call` | `(ixObject: InteractionObject, options?) → InteractionCallResponse` | `moi.Call` | read-only simulate; `{ receipt, result() }` |
| `estimateFuel` | `(ixObject, options?) → number\|bigint` | `moi.FuelEstimate` | |
| `sendInteraction` | `(request: InteractionRequest) → InteractionResponse` | `moi.SendInteractions` | **request must already be signed** (see below) |

- **`InteractionRequest` = `{ ix_args: string; signatures: string }`** — an
  already-serialized, already-signed interaction. You normally do NOT build this
  by hand: the driver / asset / builder `.send()` and `wallet.signInteraction`
  produce it. **`BrowserProvider.sendInteraction` takes the same signed
  `InteractionRequest`** (it forwards to `wallet.SendInteraction`) — signing
  always happens in `Signer.signInteraction`, never in a provider.
- **`InteractionResponse`** = `{ hash, wait(timeout?), result(timeout?) }`:
  - `wait(timeoutSeconds = 120)` polls `moi.InteractionReceipt` every 5s and
    resolves to an `InteractionReceipt`, or on timeout rejects with the object
    `{ message: "failed to fetch receipt" }` (not an `Error`).
  - `result(timeout?)` waits then decodes to per-operation `ExecutionResult[]`.
- **`InteractionReceipt`** = `{ ix_hash, status: number, fuel_used, ix_operations:
  OperationResult[], from, ix_index, ts_hash, participants }`.
  `OperationResult = { tx_type, status: number, data: ExecutionResult }`.
  `status` 0 = ok; `ReceiptStatus`: `RECEIPT_Ok=0, RECEIPT_STATE_REVERTED=1,
  RECEIPT_INSUFFICIENT_FUEL=2`. `OperationStatus`: `RESULT_OK=0,
  RESULT_EXCEPTION_RAISED=1, RESULT_DEFECT_RAISED=2`.

## Logic / asset / logs

| Method | Signature | RPC | Notes |
|---|---|---|---|
| `getAssetInfoByAssetID` | `(assetId, options?) → AssetInfo` | `moi.AssetInfoByAssetID` | `{symbol, decimals, max_supply, …}` — numeric fields stay **raw hex** |
| `getInteractionReceipt` | `(ixHash) → InteractionReceipt` | `moi.InteractionReceipt` | |
| `getStorageAt` | `(logicId, storageKey, options?)` / `(logicId, storageKey, address, options?)` | `moi.LogicStorage` | raw persistent/ephemeral slot; the logic driver's state API wraps this |
| `getLogicManifest` | `(logicId, encoding, options?)` | `moi.LogicManifest` | `"JSON"` → decoded `Manifest` object; `"POLO"` → hex |
| `getLogs` | `(filter: LogFilter) → Log[]` | `moi.GetLogs` | see below |

**`LogFilter`** = `{ id: string; height: [start, end]; topics?: NestedArray<string> }`.
`id` must be a valid 32-byte address; `topics` are hashed via `topicHash`.
Height span is limited server-side (docstring warns >10 is rejected). Start
inclusive, end exclusive per docstring. **`Log`** =
`{ id, topics: string[], data, ix_hash, ts_hash, participants }`.

## Filters (polling — works over HTTP)

Server-side filters (≈1-minute TTL, reset each poll) — an alternative to WS.

| Method | RPC |
|---|---|
| `getNewTesseractFilter()` | `moi.NewTesseractFilter` |
| `getNewTesseractsByAccountFilter(address)` | `moi.NewTesseractsByAccountFilter` |
| `getPendingInteractionFilter()` | `moi.PendingIxnsFilter` |
| `getLogsFilter(filter: LogFilter)` | `moi.NewLogFilter` |
| `getFilterChanges<T>(filter)` | `moi.GetFilterChanges` — **returns `null` when no changes** (does not throw) |
| `removeFilter(filter)` | `moi.RemoveFilter` → `{status}` |

`Filter = { id: string }`.

## Node / mempool

`getContent()` (`ixpool.Content`), `getStatus()` (`ixpool.Status` →
`{pending, queued}` hex→BN), `getInspect()`, `getPeers()` (`net.Peers`),
`getVersion()` (`net.Version`), `getNodeInfo()` (`net.Info` → `{krama_id}`).

## Subscriptions (`WebsocketProvider`)

`WebSocketEvent` enum (`websocket-events.ts`): `Close="close"`,
`Connect="connect"`, `Error="error"`, `Reconnect="reconnect"`,
`NewTesseracts="newTesseracts"`, `NewTesseractsByAccount="newTesseractsByAccount"`,
`NewPendingInteractions="newPendingInteractions"`, `NewLog="newLog"`.

Subscription-eligible event **names**: `"newTesseracts"`,
`"newTesseractsByAccount"`, `"newLogs"` (plural!), `"newPendingInteractions"`.

> **Gotcha:** the log subscription/emit key is the plural **`"newLogs"`**, even
> though the enum literal `WebSocketEvent.NewLog` is the singular `"newLog"`.
> Use the string `"newLogs"`.

```js
const ws = new WebsocketProvider("ws://localhost:1600");
ws.on("newTesseracts", (t) => { /* Tesseract */ });
ws.on("newPendingInteractions", (hash) => { /* 0x-hash */ });

// parameterized subscriptions use the object form:
ws.on({ event: "newTesseractsByAccount", params: { address } }, (t) => {});
ws.on({ event: "newLogs", params: { address, topics, height: [start, end] } }, (log) => {});
```

`once`, `off`, `removeListener`, `removeAllListeners`, `listeners`,
`listenerCount` all work. `getSubscription(event)` (`moi.Subscribe`) returns the
subscription id; `WebsocketProvider` dedupes it per event.

> Some nodes reject the SDK's object-form `newLogs` subscription (it sends
> `{ address, … }` while the node wants `{ id }`). If you hit "invalid
> identifier", send the raw frame yourself — see `patterns.md`.

## BrowserProvider extras (wallet dApps)

In addition to all BaseProvider reads: `request(method, params)`,
`getWalletAccounts()` (first = active), `getWalletAccount(id?)`,
`requestPermissions`/`getPermissions`/`revokePermissions`, `getNetwork()`,
`getWalletVersion()`, and `sendInteraction(signedRequest)` — same signed
`{ ix_args, signatures }` shape as the other providers, routed through
`wallet.SendInteraction`. Wallet events: `on("accountChange", cb)`,
`on("networkChange", cb)` (callback gets a `NetworkConfiguration`), plus
`addListener` delegation.

## Gotchas

- **Undecoded hex:** `AssetInfo`, `AccountState`, `InteractionReceipt.fuel_used`,
  `InteractionInfo` fields, wait-time, and tesseract fields come back as **raw
  `0x` hex strings** — decode with `hexToBN`/`BigInt` yourself. Only balances,
  counts, TDU amounts, fuel estimate, statuses are pre-decoded.
- **`getFilterChanges` returns `null`** (not `[]`, not throw) when nothing
  changed.
- **Errors** are thrown as `CustomError` with `.code` (`ErrorCode`), `.reason`,
  `.params`. Account-not-found style errors have `message`/`reason ===
  "account not found"` — catch and treat as "not on chain yet" (see
  `patterns.md`).
- **`JsonRpcProvider` won't subscribe** — it only POSTs. Use `WebsocketProvider`
  (or a raw `websocket` client) for live streams.
- `getAccountMetaInfo(id)` throws for an account that has never appeared on
  chain — use it to detect whether a primary needs registering.

# js-moi-logic: deploy & call Coco logics

Verified against `packages/js-moi-logic/src.ts/` (v0.9.0-rc2). This is the
high-level way to talk to a deployed logic; it wraps `js-moi-manifest`
(calldata) and `js-moi-providers` (transport).

Exports (`index.ts`): `getLogicDriver`, `LogicDriver`, `LogicFactory`,
`LogicContext`, `RoutineOption`/`createRoutineOption`, plus the
`LogicOps`/`LogicInteractionResponse`/`LogicCallResponse` and
`Routine`/`Routines` types. (`LogicBase`, `LogicDescriptor`, `LogicId`, and the
state accessor classes `LogicState`/`ActorState` are internal; reach them only
through a driver instance.)

## What changed since 0.7.1 (read this first)

| 0.7.1 | 0.9.0-rc2 |
|---|---|
| `driver.persistentState` / `driver.ephemeralState` | **`driver.logicState`** / **`driver.actorState`** (0.8.0 rename) |
| `hasPersistentState()` / `hasEphemeralState()` | **`hasLogicState()`** / **`hasActorState()`** |
| `factory.deploy()` with no builder name allowed | **Builder name required** whenever the manifest defines any `deploy` routine |
| deploy = one `LOGIC_DEPLOY` op | deploy = `LOGIC_DEPLOY` **plus a bundled KMOI `Transfer`** (10 KMOI by default) that funds the new logic account's storage |
| `fuel_price` defaults to 1 | defaults to **50** (`DEFAULT_FUEL_PRICE`) |
| sender auto-listed as `MUTATE_LOCK` participant | sender **not listed**; the node derives it |
| `RoutineOption` ignored by `.send()` | still ignored for fuel, but its new **`storageFund`** field is read on deploy |

## Get a driver for a deployed logic

```ts
const driver = await getLogicDriver(logicId, signer, options?);
```

- `getLogicDriver<T>(logicId, signer, options?)` (`logic-driver.ts:152`) always
  **fetches the manifest from chain** (`provider.getLogicManifest(logicId,
  "JSON", options)`) and returns `new LogicDriver(logicId, manifest, signer)`.
- `options` are provider tesseract options (`{ tesseract_number?,
  tesseract_hash? }`): pin the manifest read to a past tesseract if needed.
- **No "manifest-provided" overload.** If you already hold the manifest,
  construct directly: `new LogicDriver(logicId, manifest, signer)`.
- `T` (optional generic) is a map of routine name → signature, for typed
  `.routines`.

## Call a routine

```ts
// mutating (dynamic) endpoint → .send()
const resp = await driver.routines.Transfer(to, amount).send({ fuel_limit: 60_000 });
const receipt = await resp.wait(60);            // seconds
const { output, error } = await resp.result();  // decoded logic output / Exception|null

// read-only (static) endpoint → .call()
const { output } = await (await driver.routines.GetBalance(addr).call()).result();
```

- `driver.routines.<Name>(...args)` returns a **`LogicContext`** (extends
  `InteractionContext`). It validates arg count against the routine's `accepts`
  (throws `INVALID_ARGUMENT` "One or more required arguments are missing."). A
  trailing `RoutineOption` instance is not counted as an argument.
- Each routine fn also carries `.isMutable()` (true when `mode === "dynamic"`),
  `.accepts()`, `.returns()` (manifest `TypeField[]`).
- Only `invoke` and `enlist` routines appear on `.routines`; `deploy` routines
  are reached through `LogicFactory`.
- Arg types: `Identifier`/`address` → 32-byte hex string or `Uint8Array`;
  `u256`/`u64`/`i*`/`bigint` → `BigInt`; `bool` → boolean; `string` → string.
  Args are POLO-encoded by `ManifestCoder.encodeArguments(name, ...args)`.

### `LogicContext` methods

| Method | Returns | Notes |
|---|---|---|
| `.send(option?)` | `Promise<LogicInteractionResponse>` | commits; **auto-estimates `fuel_limit` if omitted**; `fuel_price` defaults to 50 |
| `.call(option?)` | `Promise<LogicCallResponse>` | read-only simulate |
| `.estimateFuel(option?)` | `Promise<number\|bigint>` | |
| `.ixData(option?)` | `Promise<InteractionObject>` | the assembled interaction (inspect before sending) |
| `.payer(id)` | `this` | set a fee payer (see `interactions.md`) |
| `.type()` / `.payload()` / `.participants()` | | introspection |

`.send()` returns `InteractionResponse` (`{ hash, wait, result }`) where
`result()` is enriched to decode this routine's output: a `LogicIxResult`
`{ logic_id?, output?, error: Exception | null }`. `.call()` returns
`{ receipt, result() }`, `result()` likewise decoded.

### Send options: `IxOption` (snake_case)

```ts
interface IxOption {
  sender?: { id: Hex; sequence: number; key_id: number };
  sequence?: number;                 // nonce override (replace a stuck ix)
  fuel_price?: number;               // default 50
  fuel_limit?: number;               // default: estimated
  participants?: { id: Hex; lock_type: LockType; notary?: boolean }[];
  payer?: Hex;                       // fee payer (rc3: fee_payer)
  participantSignatures?: Signature[];
}
```

```ts
await driver.routines.DoThing(a, b).send({
  fuel_limit: 60_000,
  participants: [
    { id: someAsset, lock_type: LockType.NO_LOCK },
    { id: counterparty, lock_type: LockType.MUTATE_LOCK },
  ],
});
```

- Sender/sequence/key_id are auto-derived from the signer unless overridden.
- `participants` you pass are **merged** with the SDK's auto-derived ones
  (deduped by id; yours override). The logic id is auto-added `MUTATE_LOCK` for
  LOGIC_INVOKE/ENLIST. **The sender is no longer added** (0.9.0-rc1); listing it
  yourself is harmless, the entry is dropped. List the other accounts/assets the
  routine touches, with locks per `concepts.md`.

> **Option gotcha:** the package also exports `RoutineOption` /
> `createRoutineOption` with **camelCase** fields (`fuelLimit`, `fuelPrice`,
> `sequence`, `sender`, `participants`, and since 0.8.0 `storageFund`). Passing a
> `RoutineOption` as the **last argument** of a routine or `deploy()` is
> recognised (`logic-base.ts`), but only `storageFund` is consumed, and only on
> deploy. `fuelLimit`/`fuelPrice` in a `RoutineOption` are **not** applied by
> `LogicContext.send()`, which reads `IxOption` (snake_case). Always pass
> `{ fuel_limit, fuel_price }` to `.send()`. (The asset driver in `js-moi-asset`
> is different: it does honour `RoutineOption.fuelLimit/fuelPrice`.)

## Deploy a logic: `LogicFactory`

```ts
const factory = new LogicFactory(manifest, signer);   // manifest = decoded JSON object
const ix = factory.deploy("Init", ...args);           // returns a LogicContext (LOGIC_DEPLOY)
const resp = await ix.send({ fuel_limit: 2_000_000 });
const { logic_id, error } = await resp.result();      // the new logic id
```

- Constructor POLO-encodes the manifest once (`ManifestCoder.encodeManifest`).
- `deploy(builderName?, ...args)`:
  - If the manifest defines **any** `deploy` routine, `builderName` is
    **required**: omitting it throws `MISSING_ARGUMENT` "Manifest defines one or
    more deploy routines - a builder name is required to select one." (The 0.7.x
    "deploy without a constructor" trick no longer works for such manifests; the
    node rejects an empty callsite the same as an unmatched one.)
  - Only a manifest with **no** deploy routine may be deployed with
    `deploy()`/`deploy(undefined)`.
  - An unknown name throws `INVALID_ARGUMENT` "Invalid builder name, builder not
    found!"; too few args throw `MISSING_ARGUMENT` "One or more required
    arguments are missing." (a trailing `RoutineOption` is not counted).
- **Storage funding is bundled automatically.** Logic accounts pay for their own
  storage from creation, so the deploy context adds a second op: an
  `ASSET_INVOKE` `Transfer` of `DEFAULT_STORAGE_FUND` (10_000_000_000 anu =
  10 KMOI) from the sender to the **predicted** logic id
  (`deriveLogicId(sender)`, see `identifiers.md`). Override the amount with
  `factory.deploy("Init", ...args, new RoutineOption({ storageFund: parseKmoi("25") }))`
  for a large manifest. The sender therefore needs `fuel_limit × fuel_price +
  storageFund` anu of KMOI. `resp.wait()` returns a receipt with **two**
  `ix_operations`; `resp.result()` decodes op 0 (the deploy).
- The source comments add a caveat you cannot fix from the SDK: if the deploy
  routine writes persistent state without a `payer Logic` clause in Coco, that
  write is billed to the sender's storage grant on the new logic, which cannot
  exist yet, so the deploy reverts. Manifests meant to deploy standalone should
  declare `payer Logic` on state their deploy routine writes.
- `getEncodedManifest()` → POLO hex of the manifest.
- **Getting the logic id:** `await resp.result()` → `.logic_id` (an empty
  string `""`, not `undefined`, when absent). Also present in the deploy op's
  receipt `data.logic_id`, discoverable as the fresh `0x20…`-prefixed entry in
  `getInteractionByHash(hash).participants` (the field is `participants`; there
  is no `participants_state`), and predictable in advance with
  `deriveLogicId({ id, sequence, key_id })`. See `patterns.md` for the "deploy
  committed but no logic_id" failure mode.

## Read logic state

State access is defined on the driver **only if the manifest declares it**:
`driver.logicState` (manifest state `mode: "logic"`, shared across callers)
and/or `driver.actorState` (`mode: "actor"`, per participant). These are the
0.8.0 names; `persistentState`/`ephemeralState` no longer exist.

```ts
// logic (shared) state
const total = await driver.logicState.get(b => b.entity("total_supply"));
const bal   = await driver.logicState.get(b => b.entity("balances").property(addr));
const n     = await driver.logicState.get(b => b.entity("items").length());

// actor (per-account) state: first arg is the account address
const mine  = await driver.actorState.get(myAddr, b => b.entity("orders").at(0));
```

Accessor builder chain (on the `EntityBuilder` → `AccessorBuilder`):
`.entity(label)` selects a top-level state field, then `.property(key)` (map
value), `.at(index)` (array element), `.field(name)` (class field),
`.length()`. Under the hood it computes a storage key and calls
`provider.getStorageAt(logicId, slot, address?)`, then depolorizes. `get()`
throws "Logic state is not present" / "Actor state is not present" when the
manifest lacks that mode.

Descriptor helpers on the driver: `getManifest()`, `getEncodedManifest()`,
`getLogicId()` (returns a **`LogicId` object**; call `.hex()` / `.string()`
for the string), `getEngine()`, `isSealed()`, `isAssetLogic()`, `isStateful()`,
`allowsInteractions()`, `hasLogicState()` / `hasActorState()` (each
`[ptr, exists]`).

## Reading logic events

There is **no** event-fetch method on the driver. Get logs from the provider
(`provider.getLogs`, WS `newLogs`), then decode with
`ManifestCoder.decodeEventOutput(eventName, log.data)` (see `manifest.md`) or a
hand-built `js-polo` schema (see `patterns.md`). Match the event by
`topicHash(name)` against `log.topics`.

## Response shapes

- `.wait(timeout=120s)` → `InteractionReceipt` `{ ix_hash, status, fuel_used,
  ix_operations: [{ tx_type, status, data }], ts_hash, participants, … }`. A
  deploy receipt has two operations (deploy, then the funding transfer).
- `.result()` (base) → `ExecutionResult[]`; for logic ops each is
  `{ outputs, error }` (invoke/enlist) or `{ logic_id?, error }` (deploy).
- `.result()` (driver-enriched) → `LogicIxResult` `{ logic_id?, output?, error:
  Exception|null }`; `output` is the decoded routine return.

Always check `receipt.status === 0` **and** the per-op status / `error` before
treating a send as successful (`patterns.md`).

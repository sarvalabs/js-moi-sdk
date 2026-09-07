# js-moi-logic — deploy & call Coco logics

Verified against `packages/js-moi-logic/src.ts/` (v0.7.1). This is the
high-level way to talk to a deployed logic; it wraps `js-moi-manifest`
(calldata) and `js-moi-providers` (transport).

Exports: `getLogicDriver`, `LogicDriver`, `LogicFactory`, `LogicContext`,
`RoutineOption`/`createRoutineOption` (legacy — see the option note), plus the
`Routine`/`Routines`/`LogicOps`/`LogicInteractionResponse`/`LogicCallResponse`
types. (`LogicBase`, `LogicDescriptor`, `LogicId`, and the state accessor
classes are internal — reach them only through a driver instance.)

## Get a driver for a deployed logic

```ts
const driver = await getLogicDriver(logicId, signer, options?);
```

- `getLogicDriver<T>(logicId, signer, options?)` (`logic-driver.ts:146`) always
  **fetches the manifest from chain** (`provider.getLogicManifest(logicId,
  "JSON", options)`) and returns `new LogicDriver(logicId, manifest, signer)`.
- `options` are provider tesseract options (`{ tesseract_number?,
  tesseract_hash? }`) — pin the manifest read to a past tesseract if needed.
- **No "manifest-provided" overload.** If you already hold the manifest,
  construct directly: `new LogicDriver(logicId, manifest, signer)`.
- `T` (optional generic) is a map of routine name → signature, for typed
  `.routines`.

## Call a routine

```ts
// mutating (dynamic) endpoint → .send()
const resp = await driver.routines.Transfer(to, amount).send({ fuel_limit: 20000 });
const receipt = await resp.wait(60);            // seconds
const { output, error } = await resp.result();  // decoded logic output / Exception|null

// read-only (static) endpoint → .call()
const { output } = await (await driver.routines.GetBalance(addr).call()).result();
```

- `driver.routines.<Name>(...args)` returns a **`LogicContext`** (extends
  `InteractionContext`). It validates arg count against the routine's `accepts`
  (throws `INVALID_ARGUMENT` "One or more required arguments are missing.").
- Each routine fn also carries `.isMutable()` (true when `mode === "dynamic"`),
  `.accepts()`, `.returns()` (manifest `TypeField[]`).
- Arg types: `Identifier`/`address` → 32-byte hex string or `Uint8Array`;
  `u256`/`u64`/`i*`/`bigint` → `BigInt`; `bool` → boolean; `string` → string.
  Args are POLO-encoded by `ManifestCoder.encodeArguments(name, ...args)`.

### `LogicContext` methods

| Method | Returns | Notes |
|---|---|---|
| `.send(option?)` | `Promise<LogicInteractionResponse>` | commits; **auto-estimates `fuel_limit` if omitted**; `fuel_price` defaults to 1 |
| `.call(option?)` | `Promise<LogicCallResponse>` | read-only simulate |
| `.estimateFuel(option?)` | `Promise<number\|bigint>` | |
| `.ixData(option?)` | `Promise<InteractionObject>` | the assembled interaction (inspect before sending) |
| `.type()` / `.payload()` / `.participants()` | | introspection |

`.send()` returns `InteractionResponse` (`{ hash, wait, result }`) where
`result()` is enriched to decode this routine's output — a `LogicIxResult`:
`{ logic_id?, output?, error: Exception | null }`. `.call()` returns
`{ receipt, result() }`, `result()` likewise decoded.

### Send options — `IxOption` (snake_case)

```ts
interface IxOption {
  sender?: { id: Hex; sequence: number; key_id: number };
  sequence?: number;                 // nonce override (replace a stuck ix)
  fuel_price?: number;
  fuel_limit?: number;
  participants?: { id: Hex; lock_type: LockType; notary?: boolean }[];
}
```

```ts
await driver.routines.DoThing(a, b).send({
  fuel_limit: 40000,
  participants: [
    { id: someAsset, lock_type: LockType.NO_LOCK },
    { id: counterparty, lock_type: LockType.MUTATE_LOCK },
  ],
});
```

- Sender/sequence/key_id are auto-derived from the signer unless overridden.
- `participants` you pass are **merged** with the SDK's auto-derived ones
  (deduped by id; yours override). The logic id is auto-added `MUTATE_LOCK` for
  LOGIC_INVOKE/ENLIST; the sender is always auto `MUTATE_LOCK`. List the other
  accounts/assets the routine touches, with locks per `concepts.md`.

> **Option gotcha:** the package also exports `RoutineOption` /
> `createRoutineOption` with **camelCase** fields (`fuelLimit`, `fuelPrice`).
> These are **not** consumed by `.send()` in 0.7.x — the send path reads
> `IxOption` (snake_case). Always pass `{ fuel_limit, fuel_price }`.

## Deploy a logic — `LogicFactory`

```ts
const factory = new LogicFactory(manifest, signer);   // manifest = decoded JSON object
const ix = factory.deploy(builderName?, ...args);      // returns a LogicContext (LOGIC_DEPLOY)
const resp = await ix.send({ fuel_limit: 2_000_000 });
const { logic_id, error } = await resp.result();       // the new logic id
```

- Constructor POLO-encodes the manifest once (`ManifestCoder.encodeManifest`).
- `deploy(builderName?, ...args)`:
  - Omit / `undefined` → deploy with the anonymous deploy routine (no
    constructor call). Useful to isolate deploy problems from constructor logic.
  - Pass a `builderName` → the `deploy`-kind routine of that name; args are
    validated against its `accepts` (missing args throw `MISSING_ARGUMENT`
    here, vs `INVALID_ARGUMENT` on driver routines) and encoded as calldata.
- `getEncodedManifest()` → POLO hex of the manifest.
- **Getting the logic id:** it comes from `await resp.result()` →
  `.logic_id` (an empty string `""`, not `undefined`, when absent). Also
  present in the deploy op's receipt `data.logic_id`, and discoverable as the
  fresh `0x20…`-prefixed entry (height `0x0`) in
  `getInteractionByHash(hash).participants` (the field is `participants` —
  there is no `participants_state`). See `patterns.md` for the "deploy
  committed but no logic_id" failure mode.

## Read logic state

State access is defined on the driver **only if the manifest declares it**:
`driver.persistentState` (manifest state `mode: "logic"`) and/or
`driver.ephemeralState` (`mode: "actor"`, per-participant).

```ts
// persistent (global) state
const total = await driver.persistentState.get(b => b.entity("total_supply"));
const bal   = await driver.persistentState.get(b => b.entity("balances").property(addr));
const n     = await driver.persistentState.get(b => b.entity("items").length());

// ephemeral (per-account) state — first arg is the account address
const mine  = await driver.ephemeralState.get(myAddr, b => b.entity("orders").at(0));
```

Accessor builder chain (on the `EntityBuilder` → `AccessorBuilder`):
`.entity(label)` selects a top-level state field, then `.property(key)` (map
value), `.at(index)` (array element), `.field(name)` (class field),
`.length()`. Under the hood it computes a storage key and calls
`provider.getStorageAt(logicId, slot, address?)`, then depolorizes.

Descriptor helpers on the driver: `getManifest()`, `getEncodedManifest()`,
`getLogicId()` (returns a **`LogicId` object** — call `.hex()` / `.string()`
for the string), `getEngine()`, `isStateful()`, `allowsInteractions()`,
`hasPersistentState()` / `hasEphemeralState()` (each `[ptr, exists]`).

## Reading logic events

There is **no** event-fetch method on the driver. Get logs from the provider
(`provider.getLogs`, WS `newLogs`), then decode with
`ManifestCoder.decodeEventOutput(eventName, log.data)` (see `manifest.md`) or a
hand-built `js-polo` schema (see `patterns.md`). Match the event by
`topicHash(name)` against `log.topics`.

## Response shapes

- `.wait(timeout=120s)` → `InteractionReceipt` `{ ix_hash, status, fuel_used,
  ix_operations: [{ tx_type, status, data }], ts_hash, participants, … }`.
- `.result()` (base) → `ExecutionResult[]`; for logic ops each is
  `{ outputs, error }` (invoke/enlist) or `{ logic_id?, error }` (deploy).
- `.result()` (driver-enriched) → `LogicIxResult` `{ logic_id?, output?, error:
  Exception|null }` — `output` is the decoded routine return.

Always check `receipt.status === 0` **and** the per-op status / `error` before
treating a send as successful (`patterns.md`).

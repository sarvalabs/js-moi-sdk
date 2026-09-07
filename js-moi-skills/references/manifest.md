# js-moi-manifest — calldata & manifest (de)coding

Verified against `packages/js-moi-manifest/src.ts/` (v0.7.1). This package does
the POLO encode/decode between JS values and the MOI wire format, driven by a
logic's **manifest** (its ABI). The logic driver uses it under the hood; reach
for `ManifestCoder` directly when you build raw interactions or decode
events/outputs yourself.

Exports: `ManifestCoder`, `ManifestCoderFormat`, `ContextStateMatrix` /
`ContextStateKind`, `ElementDescriptor`, `Schema` (+ `isPrimitiveType`,
`isArray`, `isMap`, `isClass`), and the `LogicManifest` / `Exception` types.

## ManifestCoder

```ts
const coder = new ManifestCoder(manifest);   // manifest = decoded JSON Manifest object
```

Only one constructor form in 0.7.x: it takes a decoded JSON manifest object
(from `provider.getLogicManifest(id, "JSON")` or a `.json` file). No
`(elements, classDefs)` overload.

### Instance methods

| Method | Signature | Purpose |
|---|---|---|
| `encodeArguments` | `(routine: string, ...args) → string` | POLO-encode a routine's `accepts` fields → `0x` calldata (args positional by slot) |
| `decodeArguments` | `<T>(routine, calldata) → T \| null` | inverse; returns a **positional array** of values (indexed by slot, not a labeled object); `null` if routine accepts nothing |
| `decodeOutput` | `<T>(routine, output) → T \| null` | decode a routine's `returns`; `null` for `"0x"`/empty |
| `decodeEventOutput` | `<T>(event, logData) → T \| null` | decode an event's log `data` by event name; `"builtin.Log"` → `{ value: string }` |

```js
const calldata = coder.encodeArguments("Transfer", to, 100n);
const decoded  = coder.decodeOutput("GetIntent", outputHex);       // → typed object
const evt      = coder.decodeEventOutput("IntentAnnounced", log.data);
```

### Static methods

| Method | Signature | Purpose |
|---|---|---|
| `ManifestCoder.decodeException` | `(errorHex) → Exception \| null` | decode a reverted op's `error`; `null` for `"0x"`/empty |
| `ManifestCoder.encodeManifest` | `(manifest: string \| Manifest) → string` | object → JSON coder, string → YAML coder; returns POLO hex |
| `ManifestCoder.decodeManifest` | `(manifest: string\|Uint8Array, format: ManifestCoderFormat) → Manifest \| string` | `JSON` → object, `YAML` → string |

`Exception = { class: string; error: string; revert: boolean; trace: string[] }`.
`ManifestCoderFormat = { JSON = "JSON", YAML = "YAML" }`. POLO is always the
encoded on-wire form; there is no `POLO` member (encode→POLO hex, decode→JSON or
YAML view).

## The manifest shape (`LogicManifest` namespace)

```ts
Manifest { syntax: number; engine: { kind, flags[], version? }; kind: "logic"|"asset"; elements: Element[] }
Element<K> { ptr: number; kind: string; deps?: number[]; data: K }
```

(Real manifests also carry `engine.version`, even though the TS type omits it.)

`element.kind` selects `data`:

| `kind` | `data` | Notes |
|---|---|---|
| `"state"` | `{ mode: "logic"\|"actor"; fields: TypeField[] }` | `logic`=persistent, `actor`=ephemeral |
| `"literal"` | `{ type, value }` | constants — the kind string is `"literal"`, NOT `"constant"` |
| `"typedef"` | `string` | |
| `"class"` | `{ name; fields?: TypeField[]; methods?: MethodField[] }` | |
| `"method"` | `{ name; class; mutable; accepts?; returns?; executes; catches? }` | |
| `"callable"` | `Routine` | the invokable endpoints |
| `"event"` | `{ name; topics: number; fields: TypeField[] }` | |
| `"interface"` | external routine declarations | |
| `"asset"` | asset element (asset-kind manifests) | |

```ts
Routine { name; kind: "invoke"|"enlist"|"deploy"; mode: "static"|"dynamic";
          accepts?: TypeField[]; returns?: TypeField[]; executes; catches? }
TypeField { slot: number; label: string; type: string }   // slot = positional index
```

- `kind` maps to `OpType` (`invoke→LOGIC_INVOKE`, `enlist→LOGIC_ENLIST`,
  `deploy→LOGIC_DEPLOY`).
- `mode`: `dynamic` may mutate (`.send()`), `static` is read-only (`.call()`).

## The MOI / Coco type grammar (`type` strings)

Parsed/encoded in `schema.ts`. Primitive types:

```
null  bool  bytes  identifier  string  u64  u256  i64  i256  bigint
```

POLO wire mapping: `bool→bool`; `bytes`/`identifier`→`bytes`; `string→string`;
`u64/u256/i64/i256/bigint→integer`; `null→null`.

Composite grammar:

- **Array**: `[]T` (or `[N]T`) — e.g. `[]u64`, `[]bytes`, `[][]identifier`.
- **Map**: `map[K]V` — e.g. `map[u64]string`, `map[identifier]u256`.
- **Class**: class types are keyed **`class.<Name>`** (e.g. `class.Token`) —
  `ElementDescriptor` registers class defs under that prefixed key, and
  `isClass(type, classDefs)` expects it; a bare class name won't resolve.

> Note: `address` is **not** in the primitive set — addresses travel as
> `identifier`/`bytes` on the wire. A raw `address` type string never resolves:
> `Schema.parseDataType` only handles primitives, arrays, maps, and
> `class.`-prefixed class defs, and throws `Unsupported data type` for
> everything else (`schema.ts:466-494`).

Type helpers: `isPrimitiveType(type)`, `isArray(type)`, `isMap(type)`,
`isClass(type, classDefs)`.

## ElementDescriptor & Schema (lower level)

`ElementDescriptor` (base of `LogicBase`/`LogicDriver`/`LogicFactory` and used
inside `ManifestCoder`) indexes a manifest's elements: `getElements()` (by
`ptr`), `getCallsites()` (routine name → `{ptr, kind}`), `getClassDefs()`
(keyed `class.<Name>`), `getEvents()`, `getMethodDefs()`,
`getRoutineElement(name)`, `getClassElement(name)`, `getEventElement(name)`,
`getMethodElement(name)`, `getClassMethods(className)`, `getStateMatrix()`.

`Schema` builds POLO schemas from manifest type strings:
`Schema.parseDataType(type, classDef, elements)`, `parseClassFields(...)`,
`extractArrayDataType`, `extractMapDataType`, `convertPrimitiveDataType`, plus
static `PISA_*_SCHEMA` constants for (de)serializing the manifest and results
(e.g. `PISA_RESULT_SCHEMA = { outputs: bytes, error: bytes }`,
`PISA_EXCEPTION_SCHEMA`). You rarely call these directly.

`ContextStateMatrix` maps declared state: `ContextStateKind` `{ PersistentState=0,
EphemeralState=1 }`; `.persistent()`, `.ephemeral()`, `.get(kind)`.

## When to use ManifestCoder directly

- Building a **raw** interaction (no driver) — encode calldata with
  `encodeArguments`, then hand it to a LOGIC_INVOKE payload (see
  `interactions.md`).
- Decoding a **static** endpoint's raw output, or an event log's `data`, outside
  the driver's `result()`.
- Decoding a reverted op's `error` into a human message
  (`ManifestCoder.decodeException`).

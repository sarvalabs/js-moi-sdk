# js-moi-utils & js-moi-constants — helpers, enums, errors, constants

Verified against `src.ts/` (v0.7.1). All of these are re-exported from
`js-moi-sdk`. **Watch the naming** — several "expected" names don't exist (see
the absences box).

## Hex / number conversion (`hex.ts`)

| Function | Signature | Behavior |
|---|---|---|
| `withHexPrefix` | `(hex: string) → Hex` | add `0x` if missing (the "ensureHexPrefix") |
| `trimHexPrefix` | `(data: string) → string` | remove `0x` (only if it's hex) |
| `numToHex` | `(value: NumberLike) → string` | **UPPERCASE**, **no** `0x`; throws on negatives |
| `toQuantity` | `(value: NumberLike) → string` | `"0x" + numToHex` (0x + uppercase) |
| `encodeToString` | `(data: Uint8Array) → string` | `0x`-prefixed lowercase hex |
| `bytesToHex` | `(data: Uint8Array) → string` | lowercase hex, **no** `0x` (contrast `encodeToString`) |
| `hexToBytes` | `(str: string) → Uint8Array` | strips `0x`; throws on odd length |
| `hexToBN` | `(hex: string) → number \| bigint` | **`bigint` if >53 bits, else `number`** (the "hexToBigInt") |
| `isHex` | `(data: string) → boolean` | `/^(0x)?[0-9A-Fa-f]+$/` |

`NumberLike = string | number | bigint | BN | Buffer | Uint8Array | number[]`.
Types: `Hex = \`0x${string}\``, `Quantity = Hex`, `Address = Hex`.

## Bytes (`bytes.ts`)

`isBytes(v)`, `isHexString(v, length?)` (**requires `0x`** prefix, optional byte
length), `hexDataLength(hex)`, `randomBytes(size)` (CSPRNG), `bufferToUint8(buf)`
(the "bytesToUint8"), `isInteger(n)`.

## Base64 / JSON (`base64.ts`, `json.ts`)

`encodeBase64(u8)`, `decodeBase64(str)`; `marshal(obj) → Uint8Array` (JSON +
UTF-8), `unmarshal(bytes) → any` (used by the provider to decode a JSON
manifest). Plain JSON — **no bigint handling**.

## Object / properties

`deepCopy(obj)`, `defineReadOnly(object, name, value)`.

## Address / hashing

- `isValidAddress(address)` → true for `/^0x[0-9a-fA-F]{64}$/` (32-byte). (Only
  this — no `ensureValidAddress`.)
- `topicHash(topic: string)` → `0x…` 32-byte hash: POLO-encodes the string then
  `blake2b` (dkLen 32). Use it to match event names against `log.topics`.
  (`blake2b`/`Polorizer` themselves are internal — not re-exported.)

## Errors (`errors.ts`)

Everything the SDK throws is a `CustomError` (extends `Error`) with `.code`
(`ErrorCode`), `.reason` (= message), `.params`. Catch and switch on `.code`.

```js
try { await something(); }
catch (e) {
  if (e.code === ErrorCode.INSUFFICIENT_FUNDS) { … }
  // e.reason, e.params also available
}
```

`ErrorUtils.throwError(message, code?, params?)` and
`ErrorUtils.throwArgumentError(message, name, value)` are how the SDK raises.

`ErrorCode` (string enum) members: `UNKNOWN_ERROR`, `NOT_IMPLEMENTED`,
`UNSUPPORTED_OPERATION`, `NETWORK_ERROR`, `SERVER_ERROR`, `TIMEOUT`,
`BUFFER_OVERRUN`, `NUMERIC_FAULT`, `MISSING_NEW`, `INVALID_ARGUMENT`,
`MISSING_ARGUMENT`, `UNEXPECTED_ARGUMENT`, `NOT_INITIALIZED`,
`PROPERTY_NOT_DEFINED`, `CALL_EXCEPTION`, `INSUFFICIENT_FUNDS`, `NONCE_EXPIRED`,
`INTERACTION_UNDERPRICED`, `UNPREDICTABLE_FUEL_LIMIT`, `ACTION_REJECTED`,
`INVALID_SIGNATURE` (values are `"ERROR_…"` strings).

## Enums (`enums.ts`) — all live in js-moi-utils

- **`OpType`** (0–15): `INVALID_IX, PARTICIPANT_CREATE, ACCOUNT_CONFIGURE,
  ACCOUNT_INHERIT, ASSET_CREATE, ASSET_INVOKE, GUARDIAN_REGISTER/STAKE/UNSTAKE/
  WITHDRAW/CLAIM, LOGIC_DEPLOY, LOGIC_INVOKE, LOGIC_ENLIST, LOGIC_INTERACT,
  LOGIC_UPGRADE`.
- **`LockType`**: `MUTATE_LOCK=0, READ_LOCK=1, NO_LOCK=2`.
- **`AssetStandard`**: `MAS0=0, MAS1=1, MAS2=2, MASX=65535`.
- **`AccountType`**: `SARGA_ACCOUNT=0, LOGIC_ACCOUNT=2, ASSET_ACCOUNT=3,
  REGULAR_ACCOUNT=4`.
- **`ReceiptStatus`**: `RECEIPT_Ok=0, RECEIPT_STATE_REVERTED=1,
  RECEIPT_INSUFFICIENT_FUEL=2`.
- **`OperationStatus`**: `RESULT_OK=0, RESULT_EXCEPTION_RAISED=1,
  RESULT_DEFECT_RAISED=2`.
- **`InteractionStatus`**: `PENDING=0, FINALIZED=1`.
- **`EngineKind`**: `PISA="PISA", MERU="MERU"`.
- **`LogicState`**: `PERSISTENT="persistent", EPHEMERAL="ephemeral"`.
- **`RoutineKind`**: `PERSISTENT="persistent", EPHEMERAL="ephemeral",
  READ_ONLY="readonly"`.
- **`RoutineType`**: `INVOKE="invoke", DEPLOY="deploy", ENLIST="enlist"`.
- **`ElementType`**: `CONSTANT/TYPEDEF/CLASS/STATE/ROUTINE("callable")/METHOD/
  EVENT` (note `ROUTINE` = the string `"callable"`).
- **`Chain`**: `TEST_NET=111, DEV_NET=112, MAIN_NET=113`.

## POLO schemas (`schema.ts`)

Plain-object POLO descriptors used by the serializers: `logicSchema`,
`assetCreateSchema`, `assetActionSchema`, `keyAddSchema`, `keyRevokeSchema`,
`participantCreateSchema`, `accountConfigureSchema`, `accountInheritSchema`,
`ixObjectSchema` (full interaction), `ixSignatureSchema`, `ixSignaturesSchema`,
`builtInLogEventSchema`. Rarely used directly.

## Re-exported types

`Interaction`, `Participant`, `Participants`, `Tesseract`, and receipt results
`AssetCreationResult {asset_id, address}`, `AssetSupplyResult {total_supply}`,
`LogicDeployResult {logic_id?, error}`, `LogicInvokeResult {outputs, error}`,
`LogicEnlistResult {outputs, error}`. (`ConsensusInfo` is NOT exported — it's
only reachable as the nested `Tesseract.consensus_info` field. `Interaction`
carries `participants: Participant[]` — there is no `participants_state`
field.)

## js-moi-constants

| Constant | Value |
|---|---|
| `MOI_DERIVATION_PATH` | `"m/44'/6174'/0'/0/0"` (default BIP-44 path, coin type 6174) |
| `MOI_DERIVATION_BASE_PATH` | `"m/44'/6174'/0'/0"` |
| `VERSION` | `"0.7.1"` |
| `ZERO_ADDRESS` | `0x` + 64 zeros (32-byte zero) — the default `payer` |
| `SARGA_ADDRESS` | `0x20800000a6ba9853…00000000` (system account) |
| `KMOI_ASSET_ID` | `0x108000004cd973c4…00000000` (native fuel token) |
| `DEFAULT_FUEL_PRICE` | `1` |
| `DEFAULT_FUEL_LIMIT` | `10000` |

Only one asset-id constant (`KMOI_ASSET_ID`); no per-network asset ids.

## Absences — DO NOT reference these (they don't exist in these packages)

`toBeArray`, `hexToBigInt` (use `hexToBN`), `ensureHexPrefix` (use
`withHexPrefix`), `bytesToUint8` (use `bufferToUint8`), `padLeft`/`zeroPad`,
`setBit`/`getBit`, `keccak` (only internal `blake2b`), `ZERO_HASH` (only
`ZERO_ADDRESS`), `ensureValidAddress`, `IdentifierKind` (that's in
js-moi-identifiers), JSON-bigint helpers, a `setDefaultWordlist`. If you need
`ZERO_HASH`, define it locally: `"0x" + "0".repeat(64)`.

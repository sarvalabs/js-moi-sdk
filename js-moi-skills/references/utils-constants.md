# js-moi-utils & js-moi-constants: helpers, enums, errors, constants

Verified against `src.ts/` (v0.9.0-rc2). All of these are re-exported from
`js-moi-sdk`. **Watch the naming**: several "expected" names don't exist (see
the absences box), and several values moved in 0.9.0 (`KMOI_ASSET_ID`,
`DEFAULT_FUEL_PRICE`, `DEFAULT_FUEL_LIMIT`).

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

## Amounts and decimals (`units.ts`, new in 0.9.0)

KMOI has 9 decimals; its smallest unit is the **anu**. Every `amount`,
`fuel_price`, balance and `storageFund` the SDK handles is in anu (or the
asset's own smallest unit), never in whole KMOI.

| Function | Signature | Behavior |
|---|---|---|
| `formatAmount` | `(value: bigint, decimals: number) → string` | smallest unit → decimal string (ethers `formatUnits`); throws on negative or >2^256-1 |
| `parseAmount` | `(value: string, decimals: number) → bigint` | decimal string → smallest unit (ethers `parseUnits`); rejects more fraction digits than `decimals` |
| `formatKmoi` | `(anu: bigint) → string` | `formatAmount(v, 9)` |
| `parseKmoi` | `(kmoi: string) → bigint` | `parseAmount(v, 9)`; e.g. `parseKmoi("1.5") === 1_500_000_000n` |
| `validateDecimals` | `(decimals: number) → void` | throws unless a non-negative integer ≤ `MAX_DECIMALS` (18) |

> rc3 adds `formatFuelFee(fuelUsed: bigint, fuelPrice: bigint) → string`
> (`formatKmoi(fuelUsed * fuelPrice)`). Not in rc2.

## Bytes (`bytes.ts`)

`isBytes(v)`, `isHexString(v, length?)` (**requires `0x`** prefix, optional byte
length), `hexDataLength(hex)`, `randomBytes(size)` (CSPRNG), `bufferToUint8(buf)`
(the "bytesToUint8"), `isInteger(n)`.

## Base64 / JSON (`base64.ts`, `json.ts`)

`encodeBase64(u8)`, `decodeBase64(str)`; `marshal(obj) → Uint8Array` (JSON +
UTF-8), `unmarshal(bytes) → any` (used by the provider to decode a JSON
manifest). Plain JSON: **no bigint handling**.

## Object / properties

`deepCopy(obj)`, `defineReadOnly(object, name, value)`.

## Address / hashing

- `isValidAddress(address)` → true for `/^0x[0-9a-fA-F]{64}$/` (32-byte). (Only
  this; no `ensureValidAddress`.)
- `topicHash(topic: string)` → `0x…` 32-byte hash: POLO-encodes the string then
  `blake2b` (dkLen 32). Use it to match event names against `log.topics`.
  (`blake2b`/`Polorizer` themselves are internal, not re-exported.)

## Errors (`errors.ts`)

Everything the SDK throws is a `CustomError` (extends `Error`) with `.code`
(`ErrorCode`), `.reason` (= message), `.params`. Catch and switch on `.code`.

```js
try { await something(); }
catch (e) {
  if (e.code === ErrorCode.INSUFFICIENT_FUNDS) { /* … */ }
  // e.reason, e.params also available
}
```

`ErrorUtils.throwError(message, code?, params?)` and
`ErrorUtils.throwArgumentError(message, name, value)` are how the SDK raises.
The 0.9.0 client-side validators in `js-moi-providers/src.ts/interaction.ts`
and the builders throw plain `Error`s (no `.code`) with messages such as
`"max_supply must be greater than zero"`, so also match on `.message`.

`ErrorCode` (string enum) members: `UNKNOWN_ERROR`, `NOT_IMPLEMENTED`,
`UNSUPPORTED_OPERATION`, `NETWORK_ERROR`, `SERVER_ERROR`, `TIMEOUT`,
`BUFFER_OVERRUN`, `NUMERIC_FAULT`, `MISSING_NEW`, `INVALID_ARGUMENT`,
`MISSING_ARGUMENT`, `UNEXPECTED_ARGUMENT`, `NOT_INITIALIZED`,
`PROPERTY_NOT_DEFINED`, `CALL_EXCEPTION`, `INSUFFICIENT_FUNDS`, `NONCE_EXPIRED`,
`INTERACTION_UNDERPRICED`, `UNPREDICTABLE_FUEL_LIMIT`, `ACTION_REJECTED`,
`INVALID_SIGNATURE` (values are `"ERROR_…"` strings).

## Enums (`enums.ts`), all in js-moi-utils

- **`OpType`** (0 to 20): `INVALID_IX, PARTICIPANT_CREATE, ACCOUNT_CONFIGURE,
  ACCOUNT_INHERIT, ASSET_CREATE, ASSET_INVOKE, GUARDIAN_REGISTER/STAKE/UNSTAKE/
  WITHDRAW/CLAIM, LOGIC_DEPLOY, LOGIC_INVOKE, LOGIC_ENLIST, LOGIC_INTERACT,
  LOGIC_UPGRADE` (0 to 15 as in 0.7.x) plus **new in 0.8.0**:
  `STORAGE_DEPOSIT=16, STORAGE_WITHDRAW=17, ACCESS_CREATE=18, ACCESS_UPDATE=19,
  ACCESS_DELETE=20`.
- **`LockType`**: `MUTATE_LOCK=0, READ_LOCK=1, NO_LOCK=2`.
- **`AssetStandard`**: `MAS0=0, MAS1=1, MAS2=2, MASN=65534, MASX=65535`.
  **`MASN` is new in 0.9.0**: it is KMOI's own standard, created once at genesis;
  `validateAssetCreate` rejects `standard: MASN` client-side.
- **`ResourceType`** (new): `STORAGE=1, ASSET=2, LOGIC=3, KEY=4`. Only
  `STORAGE` is implemented on the network; the others validate but are
  rejected server-side (source comment).
- **`AccessAction`** (new, bitmask): `STORAGE_MUTATE=1, ASSET_ACCESS=2,
  LOGIC_ACCESS=4`. OR them together.
- **`CallerKind`** (new): `ANY=0, SET=1`.
- **`AccountType`**: `SARGA_ACCOUNT=0, LOGIC_ACCOUNT=2, ASSET_ACCOUNT=3,
  REGULAR_ACCOUNT=4`.
- **`ReceiptStatus`**: `RECEIPT_Ok=0, RECEIPT_STATE_REVERTED=1,
  RECEIPT_INSUFFICIENT_FUEL=2`.
- **`OperationStatus`**: `RESULT_OK=0, RESULT_EXCEPTION_RAISED=1,
  RESULT_DEFECT_RAISED=2`.
- **`InteractionStatus`**: `PENDING=0, FINALIZED=1`.
- **`EngineKind`**: `PISA="PISA", MERU="MERU"`.
- **`RoutineType`**: `INVOKE="invoke", DEPLOY="deploy", ENLIST="enlist"`.
- **`ElementType`**: `CONSTANT/TYPEDEF/CLASS/STATE/ROUTINE("callable")/METHOD/
  EVENT` (note `ROUTINE` = the string `"callable"`).
- **`Chain`**: `TEST_NET=111, DEV_NET=112, MAIN_NET=113`.

> **Removed in 0.8.0:** the `LogicState` enum (`PERSISTENT`/`EPHEMERAL`) and the
> `RoutineKind` enum (`PERSISTENT`/`EPHEMERAL`/`READ_ONLY`) are gone from
> js-moi-utils. The name `LogicState` now refers to the **state accessor class**
> in js-moi-logic (`driver.logicState`, see `logic.md`), not an enum.

## POLO schemas (`schema.ts`)

Plain-object POLO descriptors used by the serializers: `logicSchema`,
`assetCreateSchema`, `assetActionSchema`, `keyAddSchema`, `keyRevokeSchema`,
`participantCreateSchema`, `accountConfigureSchema`, `accountInheritSchema`,
`ixObjectSchema` (full interaction), `ixSignatureSchema`, `ixSignaturesSchema`,
`builtInLogEventSchema`, plus (new in 0.8.0) `storagePayloadSchema`,
`callerConstraintSchema`, `accessPolicySchema`, `accessPayloadSchema`,
`accessDeletePayloadSchema`. Rarely used directly. (`ixObjectSchema` has a
`payer` field in rc2; rc3 renames it `fee_payer`.)

## Re-exported types

`Interaction`, `Participant`, `Participants`, `Tesseract`, and receipt results
`AssetCreationResult {asset_id, address}`, `AssetSupplyResult {total_supply}`,
`LogicDeployResult {logic_id?, error}`, `LogicInvokeResult {outputs, error}`,
`LogicEnlistResult {outputs, error}`, and (new) `AccountInheritResult
{sub_account, error}`. (`ConsensusInfo` is NOT exported; it's only reachable as
the nested `Tesseract.consensus_info` field. `Interaction` carries
`participants: Participant[]`; there is no `participants_state` field. Its
fee-payer field is `payer` in rc2 and `fee_payer` in rc3.)

## js-moi-constants

| Constant | Value (v0.9.0-rc2) | Source file |
|---|---|---|
| `MOI_DERIVATION_PATH` | `"m/44'/6174'/0'/0/0"` (default BIP-44 path, coin type 6174) | `path.ts` |
| `MOI_DERIVATION_BASE_PATH` | `"m/44'/6174'/0'/0"` | `path.ts` |
| `VERSION` | `"0.9.0-rc2"` | `version.ts` |
| `ZERO_ADDRESS` | `0x` + 64 zeros (32-byte zero), the default payer | `address.ts` |
| `SARGA_ADDRESS` | `0x20800000a6ba9853f131679d00da0f033516a2efe9cd53c3d54e1f9a00000000` (system account) | `address.ts` |
| `KMOI_ASSET_ID` | **`0x1080fffe4cd973c4eb83cdb8870c0de209736270491b7acc99873da100000000`** (native fuel token, standard MASN) | `asset.ts` |
| `DEFAULT_FUEL_PRICE` | **`50`** (was 1 in 0.7.x and 0.8.0) | `fuel.ts` |
| `DEFAULT_FUEL_LIMIT` | **`100000`** (was 10000) | `fuel.ts` |
| `KMOI_DECIMALS` | `9` | `kmoi.ts` |
| `KMOI_SCALE` | `10n ** 9n` (anu per KMOI) | `kmoi.ts` |
| `MAX_DECIMALS` | `18` (cap for an asset's `decimals`) | `kmoi.ts` |
| `UINT256_MAX` | `(1n << 256n) - 1n` | `kmoi.ts` |
| `DEFAULT_STORAGE_FUND` | `10_000_000_000` anu (= 10 KMOI) bundled into every logic deploy / asset create to fund the new account's storage | `storage.ts` |
| `MIN_STORAGE_DEPOSIT_AMOUNT` | `1_000_000` anu, the client-side floor for `StorageDeposit` | `storage.ts` |

> **`KMOI_ASSET_ID` changed value in 0.9.0-rc1.** The 0.7.x/0.8.0 id was
> `0x108000004cd973c4…`; the 0.9.0 id has bytes 2 and 3 set to `0xfffe`
> (standard MASN). Never hardcode it: import the constant, and treat any
> `0x10800000…` literal in old code as stale.

> rc3 adds `MIN_KEY_WEIGHT = 1000` (`key.ts`); `ParticipantCreate.addKey` and
> `AccountConfigure.addKey` throw `"weight cannot be less than 1000"` below it.
> rc2 has no such constant and accepts any weight client-side (the node still
> rejects weights under 1000).

Only one asset-id constant (`KMOI_ASSET_ID`); no per-network asset ids.

## Absences: DO NOT reference these (they don't exist in these packages)

`toBeArray`, `hexToBigInt` (use `hexToBN`), `ensureHexPrefix` (use
`withHexPrefix`), `bytesToUint8` (use `bufferToUint8`), `padLeft`/`zeroPad`,
`setBit`/`getBit`, `keccak` (only internal `blake2b`), `ZERO_HASH` (only
`ZERO_ADDRESS`), `ensureValidAddress`, `IdentifierKind` (that's in
js-moi-identifiers), JSON-bigint helpers, a `setDefaultWordlist`, the removed
`LogicState`/`RoutineKind` enums, `predictAssetId`/`predictLogicId` (the 0.8.0
release notes use those names; the exported functions are `deriveAssetId` /
`deriveLogicId` in js-moi-identifiers), `MIN_KEY_WEIGHT` and `formatFuelFee`
(rc3 only), `fee_payer` (rc3 only; rc2 says `payer`). If you need `ZERO_HASH`,
define it locally: `"0x" + "0".repeat(64)`.

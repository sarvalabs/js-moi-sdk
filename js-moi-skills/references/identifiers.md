# js-moi-identifiers: the 32-byte Identifier types

Verified against `packages/js-moi-identifiers/src.ts/` (v0.9.0-rc2). Every
account, asset, and logic on MOI is a 32-byte identifier. This package gives
typed wrappers; most SDK APIs accept a plain `0x…` hex string or `Uint8Array`,
so you rarely need these unless inspecting, constructing, or **predicting** ids.

Exports (`index.ts`): `Identifier` (+ `isIdentifier`), `AssetId`, `LogicId`,
`ParticipantId` (+ `createParticipantId`), the tags (`IdentifierTag`,
`ParticipantTagV0`, `AssetTagV0`, `LogicTagV0`), enums (`IdentifierKind`,
`IdentifierVersion`), `Flag`, the `KramaId` node-id subsystem (`KramaId`,
`KramaIdKind`, `NetworkZone`, …), and **new in 0.8.0**: `newAccountFingerprint`,
`deriveAssetId`, `deriveLogicId` and the `AccountIdSender` type (`account-id.ts`).

## Byte layout of a 32-byte Identifier

| Bytes | Meaning | Accessor |
|---|---|---|
| 0 | tag: high nibble = `IdentifierKind`, low nibble = version | `getTag()`, `getKind()`, `getVersion()` |
| 1 | flags bitfield | `getFlags()` (see `hasFlag` caveat below) |
| 2 to 3 | metadata (for `AssetId`: 16-bit big-endian **standard**) | `getMetadata()`, `AssetId.getStandard()` |
| 4 to 27 | fingerprint (24 bytes) | `getFingerprint()` |
| 28 to 31 | variant (32-bit big-endian), the **sub-account index** | `getVariant()` |

`IdentifierKind`: `Participant=0, Asset=1, Logic=2`. `IdentifierVersion`: `V0=0`.
Precomputed tags: `ParticipantTagV0` (0x00), `AssetTagV0` (0x10), `LogicTagV0`
(0x20), hence the `0x00…`, `0x10…`, `0x20…` prefixes you see.

Worked example, the 0.9.0 `KMOI_ASSET_ID`
`0x1080fffe4cd973c4eb83cdb8870c0de209736270491b7acc99873da100000000`: byte 0
`0x10` = asset v0, byte 1 `0x80` = flags, bytes 2 to 3 `0xfffe` = standard
65534 = `AssetStandard.MASN`, then the 24-byte fingerprint, then variant 0.
`new AssetId(KMOI_ASSET_ID).getStandard()` returns `65534`.

## Identifier (base class)

```ts
new Identifier(value: Uint8Array | Hex | Identifier)   // must be exactly 32 bytes, else TypeError
```

| Method | Returns |
|---|---|
| `getFingerprint()` | `Uint8Array` (bytes 4 to 27, i.e. 24 bytes) |
| `getTag()` / `getKind()` / `getVersion()` | tag / kind / version |
| `getFlags()` | `number` (byte 1) |
| `getMetadata()` | `Uint8Array` (bytes 2 to 3) |
| `getVariant()` | `number` (bytes 28 to 31 BE) |
| `createNewVariant(variant, set?: Flag[], unset?: Flag[])` | `Identifier`: rewrites variant, toggles flags |
| `toBytes()` / `toHex()` / `toString()` / `toJSON()` | bytes / hex / hex / hex |

> **`hasFlag(flag)` does NOT test the flags bit.** It is implemented as
> `flag.supports(this.getTag()) || getFlag(this.value[1], flag.index)`
> (`identifier.ts:147`), so it returns `true` for **any** flag whose kind/version
> supports this identifier, even when the bit is 0. To check whether a flag is
> actually set, test the bit on `getFlags()` yourself
> (`(id.getFlags() >> flag.index) & 1`).

Guard: `isIdentifier(value)` (`instanceof Identifier`).

## Subtypes

- **`AssetId extends Identifier`**: constructor validates kind===Asset (else
  `TypeError`). Adds `getStandard(): number` (bytes 2 to 3). Static
  `AssetId.validate(value) → InvalidReason|null`, `AssetId.isValid(value) →
  boolean`. **Since 0.8.0 `validate` also enforces the asset flag mask**
  (`0b01111100`): bits 0 (`AssetStateful`) and 1 (`AssetLogical`) are legal,
  bits 2 to 6 are reserved and fail validation. Every asset created through
  `ASSET_CREATE` carries flags `0x03` (source comment in `flags.ts`).
- **`LogicId extends Identifier`**: validates kind===Logic. `validate`/`isValid`;
  enforces the logic flag mask (`0b01111000`).
- **`ParticipantId extends Identifier`**: validates kind===Participant.
  `validate`/`isValid`.
  - **`createParticipantId(option)`** builds one:
    `option = { tag: IdentifierTag; fingerprint: Uint8Array(24); variant: number;
    flags?: Flag[] }`. Throws if fingerprint length ≠ 24. (This is what
    `Wallet.getIdentifier()` uses: fingerprint = `pubkey.slice(1,25)`, variant =
    `sub_account_index`, tag = `ParticipantTagV0`.)

## Predicting a new asset or logic id (new in 0.8.0, `account-id.ts`)

The chain derives every new logic/asset id from the **exact sender** of the
creating interaction: `fingerprint = blake2b256(BE64(sequence) || BE64(key_id)
|| sender_id)[:24]`. The SDK mirrors that so you can know the id before the
interaction lands (and it uses this internally to bundle the storage-funding
transfer into every create/deploy, see `assets.md` / `logic.md`).

```ts
import { deriveAssetId, deriveLogicId, newAccountFingerprint, AssetStandard } from "js-moi-sdk";

const sender = { id: senderHex, sequence: nonce, key_id: 0 };   // AccountIdSender
const logicId = deriveLogicId(sender);                 // LogicId, flags 0x00, variant 0
const assetId = deriveAssetId(sender, AssetStandard.MAS0);   // AssetId, flags 0x03, standard in bytes 2..3
const fp      = newAccountFingerprint(sender);         // Uint8Array(24)
```

- `AccountIdSender = { id: Hex | Uint8Array | Identifier; sequence: number |
  bigint; key_id: number | bigint }`.
- **The sequence must be the one the interaction is actually sent with.** The
  same account at another sequence yields an unrelated id. Read it with
  `provider.getPendingInteractionCount(id, keyId)` (what `signer.getNonce()`
  uses) right before you send, and pass that same `sequence` in the send option
  so the two cannot drift.
- Both return typed `LogicId`/`AssetId` instances; call `.toHex()` for the
  string.
- The 0.8.0 release notes call these `predictAssetId`/`predictLogicId`; **those
  names do not exist**, the exports are `deriveAssetId`/`deriveLogicId`.

> There are no other factories: build `AssetId`/`LogicId` from a known hex via
> `new AssetId(hexOrBytes)` / `new LogicId(...)`. Only participants have a
> generator (`createParticipantId`). Most SDK calls just take the `0x…` string.

## Flags

`Flag` class: `new Flag(kind: IdentifierKind, index: 0..7, version: 0..15)`;
`.supports(tag): boolean`. (The helpers `setFlag`/`getFlag`/`flagMasks` exist
in `flags.ts` but are **not exported** from the package; only `Flag` is.
Masks of *unsupported* bits, for reference: Participant `0b01111111`, Logic
`0b01111000`, Asset `0b01111100` (changed in 0.8.0 from `0b01111111`).)
`IdentifierTag` wraps the byte-0 tag: `getKind()`, `getVersion()`, static
`getTag(kind, version)`, `validate(value)`.

## Practical id handling

In practice most code passes lowercase `0x…` strings around and only reaches for
these types to inspect an id. Common ad-hoc helpers (from real apps):

```js
// prefix tells you the kind without constructing an Identifier:
const isAccount = id.startsWith("0x00000000");
const isAsset   = id.startsWith("0x10");
const isLogic   = id.startsWith("0x20");

// sub-account index = last 4 bytes of a participant id (big-endian)
const subIndex = parseInt(id.slice(-8), 16);

// or use the typed wrapper
import { Identifier, AssetId } from "js-moi-sdk";
new Identifier(id).getVariant();   // sub-account index
new AssetId(id).getStandard();     // 0 = MAS0, 65534 = MASN (KMOI), 65535 = MASX
```

`KramaId` (peer/node identifiers) is a separate subsystem (`KramaId`,
`KramaIdKind`, `KramaIdVersion`, `NetworkZone`, `KramaIdMetadata`,
`KramaIdTag`), only relevant when working with node ids, not accounts/assets/
logics. `KramaId` statics: `fromPrivateKey`, `fromPeerId`,
`peerIdFromPrivateKey`, `validate`; instance: `getPeerId`, `getDecodedPeerId`,
`getMetadata`, `getTag`.

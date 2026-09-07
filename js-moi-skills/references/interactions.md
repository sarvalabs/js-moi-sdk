# The interaction model — ops, payloads, participants, the raw path

Verified against `packages/js-moi-utils/src.ts/enums.ts`,
`packages/js-moi-providers/{src.ts/interaction.ts,types/*}`, and
`packages/js-moi-interactions/src.ts/` (v0.7.1).

> Naming note: the op **model** (enums, payload types, POLO serialization,
> validators) lives in **js-moi-utils** (enums/schemas) and **js-moi-providers**
> (payload interfaces + serializers). The `js-moi-interactions` package only has
> high-level **builders** (`InteractionContext`, `ParticipantCreate`,
> `AccountConfigure`, `AccountInherit`).

## OpType (js-moi-utils, numeric)

| Member | Value | | Member | Value |
|---|---|---|---|---|
| `INVALID_IX` | 0 | | `GUARDIAN_WITHDRAW` | 9 |
| `PARTICIPANT_CREATE` | 1 | | `GUARDIAN_CLAIM` | 10 |
| `ACCOUNT_CONFIGURE` | 2 | | `LOGIC_DEPLOY` | 11 |
| `ACCOUNT_INHERIT` | 3 | | `LOGIC_INVOKE` | 12 |
| `ASSET_CREATE` | 4 | | `LOGIC_ENLIST` | 13 |
| `ASSET_INVOKE` | 5 | | `LOGIC_INTERACT` | 14 |
| `GUARDIAN_REGISTER` | 6 | | `LOGIC_UPGRADE` | 15 |
| `GUARDIAN_STAKE` | 7 | | | |
| `GUARDIAN_UNSTAKE` | 8 | | | |

> There is a single `ASSET_INVOKE` — mint/burn/transfer/approve/lockup/… are all
> `ASSET_INVOKE` distinguished by the payload `callsite` string, not by op type.

> **Not every enum member is usable.** `LOGIC_INTERACT`, `LOGIC_UPGRADE`, and
> all `GUARDIAN_*` ops exist in the enum (and some in the payload types), but
> the SDK's serializers **throw** for them (`toRawOperation`: "Unsupported
> interaction type"; `processParticipants`: "Unsupported Ix type") — only `PARTICIPANT_CREATE`,
> `ACCOUNT_CONFIGURE`, `ACCOUNT_INHERIT`, `ASSET_CREATE`, `ASSET_INVOKE`,
> `LOGIC_DEPLOY`, `LOGIC_INVOKE`, and `LOGIC_ENLIST` can actually be sent.

`LockType`: `MUTATE_LOCK=0, READ_LOCK=1, NO_LOCK=2`.
`AssetStandard`: `MAS0=0, MAS1=1, MAS2=2, MASX=65535`.

## The interaction object

`InteractionObject` (`js-moi-providers/types/interaction.d.ts`) — what
`.ixData()` builds and `signer.call/estimateFuel/sendInteraction` consume:

```ts
InteractionObject {
  sender: { id: Hex; sequence: number; key_id: number };
  payer?: Hex;                         // ZERO_ADDRESS applied at serialization time
  fuel_price: number | bigint;         // default DEFAULT_FUEL_PRICE = 1
  fuel_limit: number;                  // default DEFAULT_FUEL_LIMIT = 10000
  funds?: { asset_id: Hex; amount: number|bigint }[];
  ix_operations: AnyIxOperation[];     // [{ type: OpType, payload }]
  participants?: { id: Hex; lock_type: LockType; notary?: boolean }[];
  preferences?: { compute: Hex; consensus: { mtq; trust_nodes[] } };
  perception?: Hex;
}
```

`AnyIxOperation = { type: OpType; payload }`. Payload shapes
(`types/operation.d.ts`):

| Op | Payload |
|---|---|
| `ASSET_CREATE` | `{ symbol, standard, enable_events, manager, max_supply, decimals?, dimension?, static_metadata?, dynamic_metadata?, logic_payload? }` |
| `ASSET_INVOKE` | `{ asset_id, callsite, calldata?, funds? }` |
| `PARTICIPANT_CREATE` | `{ id, value: AssetActionPayload, keys_payload: KeyAddPayload[] }` |
| `ACCOUNT_CONFIGURE` | `{ add?: KeyAddPayload[], revoke?: KeyRevokePayload[] }` |
| `ACCOUNT_INHERIT` | `{ target_account, value: AssetActionPayload, sub_account_index }` |
| `LOGIC_DEPLOY` | `{ manifest: Hex, callsite?, calldata?, interfaces? }` |
| `LOGIC_INVOKE`/`ENLIST` | `{ logic_id, callsite, calldata?, interfaces? }` |

(`LOGIC_INTERACT`/`LOGIC_UPGRADE` share the logic payload **type** but are not
serializable — see the "not every enum member is usable" note above. Guardian
ops have no payload types at all.)

`KeyAddPayload = { public_key, weight, signature_algorithm }`;
`KeyRevokePayload = { key_id }`.

## Automatic participant derivation

`processParticipants` (in `js-moi-providers/src.ts/interaction.ts`) always adds:
- **sender** → `MUTATE_LOCK` (don't add it yourself)
- **payer** (if non-zero) → `MUTATE_LOCK`

then per op type:
- `PARTICIPANT_CREATE` → `value.asset_id` `NO_LOCK`
- `ACCOUNT_INHERIT` → `KMOI_ASSET_ID` `NO_LOCK`
- `ASSET_INVOKE` → `asset_id` `MUTATE_LOCK`
- `LOGIC_INVOKE`/`ENLIST` → `logic_id` `MUTATE_LOCK`
- `ASSET_CREATE` / `ACCOUNT_CONFIGURE` / `LOGIC_DEPLOY` → none

then merges any `participants` you supplied (deduped by id; yours override).
So you only list the *extra* accounts/assets a routine touches (counterparties,
fee recipients, transfer `to`s), with locks per `concepts.md`.

## Builders (js-moi-interactions)

Each builder wraps a `Signer` and produces an `InteractionContext<OpType>` with
`.send()/.call()/.estimateFuel()/.ixData()`.

- **`InteractionContext<T>`** — the shared lifecycle wrapper. `.type()`,
  `.payload()`, `.participants()`, `.ixData(option?)` (assembles sender + default
  fuel 1/10000 + ops + merged participants), `.send/.call/.estimateFuel`.
  `IxOption = { sender?, sequence?, fuel_price?, fuel_limit?, participants? }`.
- **`ParticipantCreate(signer)`** → `.id(hex)`, `.addKey(publicKey, weight,
  sigAlgo=0)`, `.value(assetId, beneficiary, amount)`, `.build()`, `.send()`.
  Registers/funds a new account (`PARTICIPANT_CREATE`).
- **`AccountConfigure(signer)`** → `.addKey(publicKey, weight, sigAlgo=0)`,
  `.revokeKey(keyId)`, `.build()`, `.send()` (`ACCOUNT_CONFIGURE`).
- **`AccountInherit(signer)`** → `.target(account)`, `.value(assetId,
  beneficiary, amount)`, `.index(i)`, `.build()`, `.send()` (`ACCOUNT_INHERIT`;
  see `assets.md`).

## Serialization / validation helpers (js-moi-providers)

Exported from the providers package `index.ts`:

- `toInteractionArgs(ix) → InteractionArgs` — JSON-RPC wire form (quantities →
  hex); used internally by `call`/`estimateFuel`.
- `toRawInteractionObject(ix) → RawInteractionObject` — full byte/POLO form for
  signing.
- `toRawSignatures(signs)`, `processInteractionObject(ix)`.
- Validators (throw on bad input): `validateKeyAdd`, `validateKeyRevoke`,
  `validateAssetAction`, `validateParticipantCreate`, `validateAccountConfigure`,
  `validateAccountInherit`, `validateLogicPayload`, `validateLogicDeploy`,
  `validateLogicAction`, `validateAssetCreate`.
- Note the builder path (`InteractionContext.ixData`) only sets sender, fuel,
  ops, and participants — `payer`, `funds`, `preferences`, `perception` are
  never populated by builders; hand-build the object if you need them.

POLO schemas for the whole model live in `js-moi-utils/src.ts/schema.ts`
(`ixObjectSchema`, `assetActionSchema`, `logicSchema`, …).

## The raw interaction path (only when the high-level API doesn't fit)

Prefer the driver / `MAS0AssetLogic` / builders — they sign for you. If you must
hand-build, the shape is:

```js
import { ManifestCoder } from "js-moi-manifest";
import { OpType } from "js-moi-utils";

const coder = new ManifestCoder(manifest);
const ixObject = {
  sender: { id: address, key_id: 0, sequence: await provider.getInteractionCount(address, 0) },
  fuel_price: 1,
  fuel_limit,
  ix_operations: [{
    type: OpType.LOGIC_INVOKE,
    payload: { logic_id, callsite: "DoThing", calldata: coder.encodeArguments("DoThing", ...args) },
  }],
  // participants optional — auto-derived; add extras if needed
};

// sign + broadcast: a JsonRpcProvider needs an ALREADY-SIGNED request:
const signed = await wallet.signInteraction(ixObject, wallet.signingAlgorithms.ecdsa_secp256k1);
const resp   = await provider.sendInteraction(signed);   // { ix_args, signatures } → { hash, wait, result }
```

> `provider.sendInteraction` takes the **signed** `{ ix_args, signatures }`
> request, not the raw `ixObject` — on `JsonRpcProvider` and `BrowserProvider`
> alike (the browser provider forwards it to `wallet.SendInteraction`). Signing
> always happens in `Signer.signInteraction`.
> For decoding a static endpoint's raw output: `coder.decodeOutput("Name", out)`.

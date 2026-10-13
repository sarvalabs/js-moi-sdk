# The interaction model: ops, payloads, participants, fee payer, the raw path

Verified against `packages/js-moi-utils/src.ts/enums.ts`,
`packages/js-moi-providers/{src.ts/interaction.ts,types/*}`, and
`packages/js-moi-interactions/src.ts/` (v0.9.0-rc2).

> Naming note: the op **model** (enums, payload types, POLO serialization,
> validators) lives in **js-moi-utils** (enums/schemas) and **js-moi-providers**
> (payload interfaces + serializers). The `js-moi-interactions` package holds
> the high-level **builders** (`InteractionContext`, `ParticipantCreate`,
> `AccountConfigure`, `AccountInherit`, and since 0.8.0 `StorageDeposit`,
> `StorageWithdraw`, `Access`).

## OpType (js-moi-utils, numeric)

| Member | Value | | Member | Value |
|---|---|---|---|---|
| `INVALID_IX` | 0 | | `LOGIC_DEPLOY` | 11 |
| `PARTICIPANT_CREATE` | 1 | | `LOGIC_INVOKE` | 12 |
| `ACCOUNT_CONFIGURE` | 2 | | `LOGIC_ENLIST` | 13 |
| `ACCOUNT_INHERIT` | 3 | | `LOGIC_INTERACT` | 14 |
| `ASSET_CREATE` | 4 | | `LOGIC_UPGRADE` | 15 |
| `ASSET_INVOKE` | 5 | | `STORAGE_DEPOSIT` | 16 (new) |
| `GUARDIAN_REGISTER` | 6 | | `STORAGE_WITHDRAW` | 17 (new) |
| `GUARDIAN_STAKE` | 7 | | `ACCESS_CREATE` | 18 (new) |
| `GUARDIAN_UNSTAKE` | 8 | | `ACCESS_UPDATE` | 19 (new) |
| `GUARDIAN_WITHDRAW` | 9 | | `ACCESS_DELETE` | 20 (new) |
| `GUARDIAN_CLAIM` | 10 | | | |

> There is a single `ASSET_INVOKE`: mint/burn/transfer/approve/lockup/… are all
> `ASSET_INVOKE` distinguished by the payload `callsite` string, not by op type.

> **Not every enum member is usable.** `LOGIC_INTERACT`, `LOGIC_UPGRADE`, and
> all `GUARDIAN_*` ops exist in the enum (and some in the payload types), but
> the SDK's serializers **throw** for them (`toRawOperation`: "Unsupported
> interaction type"; `processParticipants`: "Unsupported Ix type"). Sendable:
> `PARTICIPANT_CREATE`, `ACCOUNT_CONFIGURE`, `ACCOUNT_INHERIT`, `ASSET_CREATE`,
> `ASSET_INVOKE`, `LOGIC_DEPLOY`, `LOGIC_INVOKE`, `LOGIC_ENLIST`,
> `STORAGE_DEPOSIT`, `STORAGE_WITHDRAW`, `ACCESS_CREATE`, `ACCESS_UPDATE`,
> `ACCESS_DELETE` (this is also the `AllowedOps` union of `InteractionContext`).

`LockType`: `MUTATE_LOCK=0, READ_LOCK=1, NO_LOCK=2`.
`AssetStandard`: `MAS0=0, MAS1=1, MAS2=2, MASN=65534, MASX=65535`.
`ResourceType`: `STORAGE=1, ASSET=2, LOGIC=3, KEY=4`. `AccessAction` (bitmask):
`STORAGE_MUTATE=1, ASSET_ACCESS=2, LOGIC_ACCESS=4`. `CallerKind`: `ANY=0, SET=1`.

## The interaction object

`InteractionObject` (`js-moi-providers/types/interaction.d.ts`): what
`.ixData()` builds and `signer.call/estimateFuel/sendInteraction` consume:

```ts
InteractionObject {
  sender: { id: Hex; sequence: number; key_id: number };
  payer?: Hex;                         // fee payer; ZERO_ADDRESS applied at serialization. rc3 renames this `fee_payer`
  fuel_price: number | bigint;         // default DEFAULT_FUEL_PRICE = 50 (anu per fuel unit)
  fuel_limit: number;                  // default DEFAULT_FUEL_LIMIT = 100000
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
| `STORAGE_DEPOSIT` | `{ target_account, deposit_for?, amount }` (`deposit_for` defaults to the signer) |
| `STORAGE_WITHDRAW` | `{ target_account, bytes_to_release? }` (0/omitted = release everything available) |
| `ACCESS_CREATE`/`UPDATE` | `{ target_account, access_policy: AccessPolicy }` |
| `ACCESS_DELETE` | `{ target_account, resource: ResourceType, resource_id }` |

```ts
AccessPolicy { resource: ResourceType; resource_id: Hex; actions: AccessAction /* bitmask */;
               scope?: { prefixes?: Hex[] }; caller: CallerConstraint; origin: CallerConstraint }
CallerConstraint { kind: CallerKind; set: Hex[] }   // set must be non-empty when kind === SET
```

(`LOGIC_INTERACT`/`LOGIC_UPGRADE` share the logic payload **type** but are not
serializable. Guardian ops have no payload types at all.)

`KeyAddPayload = { public_key, weight, signature_algorithm }`;
`KeyRevokePayload = { key_id }`.

## Client-side validation (new in 0.8.0 / 0.9.0)

Before serializing, `processInteractionObject`/`toRawInteractionObject` run
validators that mirror the node's rules so mistakes fail before costing fuel.
They throw plain `Error`s (no `ErrorCode`):

- `validateAssetCreate`: `symbol` non-empty; `dimension` 0 or 1; `decimals` ≤ 18
  (`validateDecimals`); **`standard: MASN` rejected** ("standard MASN is
  reserved and cannot be used to create an asset"); `max_supply` must be a
  number or bigint **> 0** ("max_supply must be greater than zero"; `0` was
  accepted in 0.8.0 and is rejected since 0.9.0-rc1). rc3 adds "must fit in 256
  bits".
- `validateAssetAction`: on `KMOI_ASSET_ID`, the callsites `Mint`,
  `MintWithMetadata`, `Burn`, `SetStaticMetadata`, `SetDynamicMetadata` are
  rejected ("reserved for protocol code and cannot be called on the KMOI asset").
- `validateStorageDeposit` (amount ≥ `MIN_STORAGE_DEPOSIT_AMOUNT`),
  `validateStorageWithdraw`, `validateCallerConstraint`, `validateAccessPolicy`,
  `validateAccessCreateOrUpdate`, `validateAccessDelete`.
- Unchanged from 0.7.x: `validateKeyAdd`, `validateKeyRevoke`,
  `validateParticipantCreate`, `validateAccountConfigure`,
  `validateAccountInherit`, `validateLogicPayload`, `validateLogicDeploy`,
  `validateLogicAction`.

## Automatic participant derivation (changed in 0.9.0-rc1)

`processParticipants` (`js-moi-providers/src.ts/interaction.ts:691`) builds the
participant list that is signed and sent:

- **The sender is NOT listed any more** (the node derives it). Any entry you
  pass with the sender's id is silently dropped.
- **A plain fee payer is NOT listed either**; a payer entry is kept only when it
  is flagged `notary: true`, and then it **must** be `MUTATE_LOCK` or the SDK
  throws "a notary payer must hold a mutate lock". (rc3 also throws if a notary
  is a logic or asset account.) This applies to **every** entry with the payer's
  id, including ones the op itself needs: if the payer is also, say, the
  `Transfer` beneficiary, that beneficiary entry is dropped too (observed with
  `MASNAssetLogic.transfer(payer, …)` + `payer`). The node derives the payer as a
  participant, so this is by design; flag it `notary: true` if you need it
  listed explicitly.
- Every emitted participant carries `notary: Boolean(notary)` (so `false`, not
  undefined).

then per op type:
- `PARTICIPANT_CREATE` → `value.asset_id` `NO_LOCK`
- `ACCOUNT_INHERIT` → `KMOI_ASSET_ID` `NO_LOCK`
- `ASSET_INVOKE` → `asset_id` `MUTATE_LOCK`
- `LOGIC_INVOKE`/`ENLIST` → `logic_id` `MUTATE_LOCK`
- `STORAGE_DEPOSIT`/`WITHDRAW`, `ACCESS_CREATE`/`UPDATE`/`DELETE` →
  `target_account` `MUTATE_LOCK`
- `ASSET_CREATE` / `ACCOUNT_CONFIGURE` / `LOGIC_DEPLOY` → none

then merges any `participants` you supplied (deduped by id; yours override). So
you only list the *extra* accounts/assets a routine touches (counterparties,
fee recipients, transfer `to`s), with locks per `concepts.md`. Code written for
0.7.x that added the sender explicitly still works; the entry is just ignored.
**This participant-list change needs a node that expects it** (release note);
devnet 0.13.0 does.

## Builders (js-moi-interactions)

Each builder wraps a `Signer` and produces an `InteractionContext<OpType>` with
`.send()/.call()/.estimateFuel()/.ixData()`.

- **`InteractionContext<T>`**: the shared lifecycle wrapper. `.type()`,
  `.payload()`, `.participants()`, `.payer(id)` (sets the fee payer, chainable;
  new in 0.9.0), `.ixData(option?)` (assembles sender + default fuel 50/100000 +
  ops + **funding ops** + merged participants + payer), `.send/.call/.estimateFuel`.
  Constructor takes an `IxContext`: `{ opType, payload, participants, signer,
  fundingOperations? }`, where `fundingOperations?: (sender) => AnyIxOperation[]`
  is how creates/deploys bundle their storage-funding transfer (see
  `assets.md`/`logic.md`).
  ```ts
  interface IxOption {
    sender?: Sender; sequence?: number; fuel_price?: number; fuel_limit?: number;
    participants?: IxParticipant[];
    payer?: Hex;                        // rc3: fee_payer
    participantSignatures?: Signature[]; // from the payer's wallet.signRawInteractionObject; send() only
  }
  ```
- **`ParticipantCreate(signer)`** → `.id(hex)`, `.addKey(publicKey, weight,
  sigAlgo=0)`, `.value(assetId, beneficiary, amount)`, `.build()`, `.send()`.
  Registers/funds a new account (`PARTICIPANT_CREATE`). rc3: `addKey` throws
  below weight 1000 (`MIN_KEY_WEIGHT`); the node already required that.
- **`AccountConfigure(signer)`** → `.addKey(publicKey, weight, sigAlgo=0)`,
  `.revokeKey(keyId)`, `.build()`, `.send()` (`ACCOUNT_CONFIGURE`).
- **`AccountInherit(signer)`** → `.target(account)`, `.value(assetId,
  beneficiary, amount)`, `.index(i)`, `.build()`, `.send()` (`ACCOUNT_INHERIT`;
  see `assets.md`). Its receipt result is now decoded as `AccountInheritResult
  { sub_account, error }`.
- **`StorageDeposit(signer)`** (new) → `.target(logicOrAssetAccount)`,
  `.for(participant)?` (who gets the allowance; defaults to the signer),
  `.amount(anu)`, **`await .build()`** (async: it may resolve the signer's id) →
  `InteractionContext<STORAGE_DEPOSIT>`, or `.send()`. Below
  `MIN_STORAGE_DEPOSIT_AMOUNT` (1_000_000 anu) the validator throws.
- **`StorageWithdraw(signer)`** (new) → `.target(account)`, `.release(bytes)?`
  (omit = release everything), `.build()` (sync), `.send()`.
- **`Access(signer)`** (new) → `.storage(resourceId)` (the only resource kind
  implemented), `.allow(...AccessAction)`, `.withinPrefix(...hexPrefixes)?`,
  `.caller(constraint)?`, `.origin(constraint)?`, then `.create()` / `.update()`
  / `.delete()` each returning a pending op with **`.send()`** only (no
  `.build()`; the `target_account` is always the signer, since the node requires
  the policy owner to be the sender). Constraint helpers: `access.anyCaller()`,
  `access.callers(...ids)`. In rc2 these `.send()`s take **no options**; rc3
  adds an `IxOption` parameter to `StorageDeposit/StorageWithdraw/Access` sends.
- **`buildTransferPayload(assetId, beneficiary, amount)`** (new export) →
  an `AssetActionPayload` for a `Transfer` callsite; what the funding ops use.

```js
import { StorageDeposit, Access, access, AccessAction, parseKmoi } from "js-moi-sdk";

// grant yourself storage allowance on a logic you will write state into
const ctx = await new StorageDeposit(wallet).target(logicId).amount(parseKmoi("2")).build();
await ctx.send({ fuel_limit: 100_000 });

// let one caller mutate storage under a key prefix of your account
await new Access(wallet).storage(logicId).allow(AccessAction.STORAGE_MUTATE)
  .withinPrefix("0x01").caller(access.callers(agentId)).create().send();

// read it back
const policies = await provider.getAccessPolicies(me, ResourceType.STORAGE);
```

## Fee payer (sponsored interactions, new in 0.9.0-rc1)

A second account can pay the fuel. The sender builds the interaction with
`payer` set, the payer signs the **same** interaction object with
`signRawInteractionObject`, and the sender sends with both signatures:

```js
const ix = driver.routines.DoThing(a, b);                 // any InteractionContext
const ixObject = await ix.ixData({ payer: payerId, fuel_limit: 60_000 });  // fixes sender.sequence
const payerSigs = await payerWallet.signRawInteractionObject(ixObject, payerWallet.signingAlgorithms.ecdsa_secp256k1);
const resp = await ix.send({
  payer: payerId, fuel_limit: 60_000,
  sequence: ixObject.sender.sequence,      // keep the exact object the payer signed
  participantSignatures: payerSigs,
});
```

- `Signer.sendInteraction(ixObject, participantSignatures?)` throws
  `MISSING_ARGUMENT` "Payer signature is missing." when `payer` is non-zero and
  no signature in `participantSignatures` has that id (`checkSignature`).
- `Wallet.signInteraction` throws `INVALID_ARGUMENT` "Payer must be a participant
  account" if `payer` is a logic/asset id, then appends the payer signatures
  after the sender's.
- A **notary** payer is one you also list in `participants` with
  `notary: true` and `MUTATE_LOCK`; multi-key payers just contribute more
  `Signature` entries.
- `call()`/`estimateFuel()` ignore `participantSignatures`.
- **rc3 renames `payer` → `fee_payer`** in `InteractionObject`, `IxOption`,
  `InteractionArgs`, `ixObjectSchema` and the `Interaction` type. Code targeting
  rc2 must say `payer`; code targeting rc3 must say `fee_payer`. The chainable
  `InteractionContext.payer(id)` method keeps its name in both.

## Serialization / validation helpers (js-moi-providers)

Exported from the providers package `index.ts`:

- `toInteractionArgs(ix) → InteractionArgs`: JSON-RPC wire form (quantities →
  hex); used internally by `call`/`estimateFuel`. Runs `processParticipants`.
- `toRawInteractionObject(ix) → RawInteractionObject`: full byte/POLO form for
  signing.
- `toRawSignatures(signs)`, `rawSignaturesToSignatures(raw)`,
  `processInteractionObject(ix)`, `checkSignature(signatures, participantId)`.
- The validators listed above.
- The builder path (`InteractionContext.ixData`) sets sender, fuel, ops (+
  funding ops), participants and `payer`; `funds`, `preferences`, `perception`
  are never populated by builders. Hand-build the object if you need them.

POLO schemas for the whole model live in `js-moi-utils/src.ts/schema.ts`
(`ixObjectSchema`, `assetActionSchema`, `logicSchema`, `storagePayloadSchema`,
`accessPolicySchema`, …).

## The raw interaction path (only when the high-level API doesn't fit)

Prefer the driver / `MAS0AssetLogic` / builders: they sign for you. If you must
hand-build, the shape is:

```js
import { ManifestCoder, OpType, DEFAULT_FUEL_PRICE } from "js-moi-sdk";

const coder = new ManifestCoder(manifest);
const ixObject = {
  sender: { id: address, key_id: 0, sequence: await provider.getPendingInteractionCount(address, 0) },
  fuel_price: DEFAULT_FUEL_PRICE,     // 50; a price of 1 is rejected as underpriced by current devnet
  fuel_limit,
  ix_operations: [{
    type: OpType.LOGIC_INVOKE,
    payload: { logic_id, callsite: "DoThing", calldata: coder.encodeArguments("DoThing", ...args) },
  }],
  // participants optional (auto-derived; the sender is never listed); add extras if needed
};

// sign + broadcast: a JsonRpcProvider needs an ALREADY-SIGNED request:
const signed = await wallet.signInteraction(ixObject, wallet.signingAlgorithms.ecdsa_secp256k1);
const resp   = await provider.sendInteraction(signed);   // { ix_args, signatures } → { hash, wait, result }
```

> `provider.sendInteraction` takes the **signed** `{ ix_args, signatures }`
> request, not the raw `ixObject`, on `JsonRpcProvider` and `BrowserProvider`
> alike (the browser provider forwards it to `wallet.SendInteraction`). Signing
> always happens in `Signer.signInteraction`. The hand-built path bundles **no**
> storage-funding transfer: a raw `LOGIC_DEPLOY`/`ASSET_CREATE` needs you to add
> the `ASSET_INVOKE` `Transfer` op yourself (`buildTransferPayload(KMOI_ASSET_ID,
> deriveLogicId(sender).toHex(), DEFAULT_STORAGE_FUND)`), or it reverts.
> For decoding a static endpoint's raw output: `coder.decodeOutput("Name", out)`.

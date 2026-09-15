import { AssetStandard, bytesToHex, hexToBytes, LockType, OpType, validateDecimals } from "js-moi-utils";
import { MAS0 } from "./mas0";
import { Depolorizer, documentEncode } from "js-polo";
import { ManifestCoder } from "js-moi-manifest";
import { APPROVE_SCHEMA, BALANCEOF_SCHEMA, BALANCEOF_RESULT_SCHEMA, BURN_SCHEMA, CIRCULATING_SUPPLY_RESULT_SCHEMA, CREATOR_RESULT_SCHEMA, DECIMALS_RESULT_SCHEMA, GET_DYNAMIC_METADATA_SCHEMA, GET_DYNAMIC_METADATA_RESULT_SCHEMA, GET_STATIC_METADATA_SCHEMA, GET_STATIC_METADATA_RESULT_SCHEMA, LOCKUP_SCHEMA, MANAGER_RESULT_SCHEMA, MAX_SUPPLY_RESULT_SCHEMA, MINT_SCHEMA, MINT_WITH_METADATA_SCHEMA, RELEASE_SCHEMA, REVOKE_SCHEMA, SET_DYNAMIC_METADATA_SCHEMA, SET_STATIC_METADATA_SCHEMA, SYMBOL_RESULT_SCHEMA, TRANSFER_FROM_SCHEMA, TRANSFER_SCHEMA } from "./mas0-schema";
import { DEFAULT_STORAGE_FUND, KMOI_ASSET_ID, SARGA_ADDRESS } from "js-moi-constants";
import { buildTransferPayload, InteractionContext } from "js-moi-interactions";
import { deriveAssetId } from "js-moi-identifiers";
// Result schema for each read-only (static) MAS0 callsite, keyed by its
// Endpoint name - see mas0-schema.ts for where each one comes from.
const READ_RESULT_SCHEMAS = {
    [MAS0.Endpoint.SYMBOL]: SYMBOL_RESULT_SCHEMA,
    [MAS0.Endpoint.BALANCEOF]: BALANCEOF_RESULT_SCHEMA,
    [MAS0.Endpoint.CREATOR]: CREATOR_RESULT_SCHEMA,
    [MAS0.Endpoint.MANAGER]: MANAGER_RESULT_SCHEMA,
    [MAS0.Endpoint.DECIMALS]: DECIMALS_RESULT_SCHEMA,
    [MAS0.Endpoint.MAXSUPPLY]: MAX_SUPPLY_RESULT_SCHEMA,
    [MAS0.Endpoint.CIRCULATINGSUPPLY]: CIRCULATING_SUPPLY_RESULT_SCHEMA,
    [MAS0.Endpoint.GETSTATICMETADATA]: GET_STATIC_METADATA_RESULT_SCHEMA,
    [MAS0.Endpoint.GETDYNAMICMETADATA]: GET_DYNAMIC_METADATA_RESULT_SCHEMA,
};
export class MAS0AssetLogic {
    assetId;
    signer;
    constructor(assetId, signer) {
        this.assetId = assetId;
        this.signer = signer;
    }
    polorize(payload, schema) {
        const document = documentEncode(payload, schema);
        return document.bytes();
    }
    /**
     * Decodes a read-only (static) callsite's raw `.call()` result - the
     * `{ outputs, error }` entry a `.result()` call returns for an
     * ASSET_INVOKE op - into a real value, the same way `js-moi-logic`'s
     * routine `.call()` already does via `ManifestCoder`. Without this,
     * `outputs` is undecoded POLO-encoded bytes.
     *
     * @param {MAS0.Endpoint} callsite - The read-only callsite that
     * produced this result (e.g. `MAS0.Endpoint.BALANCEOF`).
     * @param {{ outputs: Hex; error: Hex }} result - One entry of the array
     * `InteractionCallResponse.result()` resolves to.
     * @returns {{ output: T; error: Exception | null }} The decoded output
     * and, if the call reverted, the decoded exception.
     */
    decodeResult(callsite, result) {
        const schema = READ_RESULT_SCHEMAS[callsite];
        if (schema == null) {
            throw new Error(`"${callsite}" is not a read-only MAS0 callsite, or has no result schema.`);
        }
        const output = result.outputs && result.outputs !== "0x"
            ? new Depolorizer(hexToBytes(result.outputs)).depolorize(schema)
            : null;
        return {
            output,
            error: ManifestCoder.decodeException(result.error),
        };
    }
    static async newAsset(signer, symbol, supply, manager, enableEvents, decimals, option) {
        const response = await this.create(signer, symbol, supply, manager, enableEvents, decimals, option).send();
        const results = await response.result();
        return new MAS0AssetLogic(results[0].asset_id, signer);
    }
    static create(signer, symbol, supply, manager, enableEvents, decimals, option) {
        const payload = {
            symbol: symbol,
            max_supply: supply,
            standard: AssetStandard.MAS0,
            dimension: 0,
            enable_events: enableEvents,
            manager: manager,
        };
        if (decimals !== undefined) {
            validateDecimals(decimals);
            payload.decimals = decimals;
        }
        return new InteractionContext({
            opType: OpType.ASSET_CREATE,
            payload: payload,
            participants: [],
            signer: signer,
            // A newly created asset self-pays for its own storage the moment it's
            // created, and a fresh account holds no KMOI - bundle a funding transfer
            // to the derived asset id, same as AssetFactory.create(). See
            // deriveAssetId's docs for why this must mirror the blockchain's id derivation
            // exactly - a wrong prediction sends funds to the wrong account.
            fundingOperations: (sender) => {
                const assetId = deriveAssetId(sender, payload.standard);
                const transfer = buildTransferPayload(KMOI_ASSET_ID, assetId.toHex(), option?.storageFund ?? DEFAULT_STORAGE_FUND);
                return [{ type: OpType.ASSET_INVOKE, payload: transfer }];
            },
        });
    }
    mint(beneficiary, amount) {
        const payload = {
            beneficiary: hexToBytes(beneficiary),
            amount: amount,
        };
        const participants = [
            {
                id: this.assetId,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, MINT_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.MINT,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    mintWithMetadata(beneficiary, amount, staticMetadata) {
        const payload = {
            beneficiary: hexToBytes(beneficiary),
            amount: amount,
            static_metadata: new Map(Object.entries(staticMetadata))
        };
        const participants = [
            {
                id: this.assetId,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, MINT_WITH_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.MINTWITHMETADATA,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    burn(amount) {
        const payload = {
            amount: amount,
        };
        const participants = [
            {
                id: this.assetId,
                lock_type: LockType.MUTATE_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, BURN_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.BURN,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    transfer(beneficiary, amount) {
        const payload = {
            beneficiary: hexToBytes(beneficiary),
            amount: amount,
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, TRANSFER_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.TRANSFER,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    transferFrom(benefactor, beneficiary, amount) {
        const payload = {
            benefactor: hexToBytes(benefactor),
            beneficiary: hexToBytes(beneficiary),
            amount: amount,
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: benefactor,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, TRANSFER_FROM_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.TRANSFERFROM,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    approve(beneficiary, amount, expiresAt) {
        const payload = {
            beneficiary: hexToBytes(beneficiary),
            amount: amount,
            expires_at: expiresAt
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, APPROVE_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.APPROVE,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    revoke(beneficiary) {
        const payload = {
            beneficiary: hexToBytes(beneficiary),
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, REVOKE_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.REVOKE,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    lockup(beneficiary, amount) {
        const payload = {
            beneficiary: hexToBytes(beneficiary),
            amount: amount
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: LockType.NO_LOCK,
            },
            {
                id: SARGA_ADDRESS,
                lock_type: LockType.MUTATE_LOCK
            }
        ];
        const rawPayload = this.polorize(payload, LOCKUP_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.LOCKUP,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    release(benefactor, beneficiary, amount) {
        const payload = {
            benefactor: hexToBytes(benefactor),
            beneficiary: hexToBytes(beneficiary),
            amount: amount
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: benefactor,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, RELEASE_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.RELEASE,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    SetStaticMetadata(key, value) {
        const payload = {
            key: key,
            value: value
        };
        const rawPayload = this.polorize(payload, SET_STATIC_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.SETSTATICMETADATA,
                calldata: bytesToHex(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    SetDynamicMetadata(key, value) {
        const payload = {
            key: key,
            value: value
        };
        const rawPayload = this.polorize(payload, SET_DYNAMIC_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.SETDYNAMICMETADATA,
                calldata: bytesToHex(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    // Readonly routines
    symbol() {
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.SYMBOL,
            },
            participants: [],
            signer: this.signer,
        });
    }
    balanceOf(id) {
        const payload = {
            address: hexToBytes(id)
        };
        const rawPayload = this.polorize(payload, BALANCEOF_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.BALANCEOF,
                calldata: bytesToHex(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    creator() {
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.CREATOR,
            },
            participants: [],
            signer: this.signer,
        });
    }
    manager() {
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.MANAGER,
            },
            participants: [],
            signer: this.signer,
        });
    }
    Decimals() {
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.DECIMALS,
            },
            participants: [],
            signer: this.signer,
        });
    }
    MaxSupply() {
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.MAXSUPPLY,
            },
            participants: [],
            signer: this.signer,
        });
    }
    CirculatingSupply() {
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.CIRCULATINGSUPPLY,
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetStaticMetadata(key) {
        const payload = {
            key: key
        };
        const rawPayload = this.polorize(payload, GET_STATIC_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.GETSTATICMETADATA,
                calldata: bytesToHex(rawPayload)
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetDynamicMetadata(key) {
        const payload = {
            key: key
        };
        const rawPayload = this.polorize(payload, GET_DYNAMIC_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.GETDYNAMICMETADATA,
                calldata: bytesToHex(rawPayload)
            },
            participants: [],
            signer: this.signer,
        });
    }
}
//# sourceMappingURL=mas0-asset.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAS0AssetLogic = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const mas0_1 = require("./mas0");
const js_polo_1 = require("js-polo");
const js_moi_manifest_1 = require("js-moi-manifest");
const mas0_schema_1 = require("./mas0-schema");
const js_moi_constants_1 = require("js-moi-constants");
const js_moi_interactions_1 = require("js-moi-interactions");
const js_moi_identifiers_1 = require("js-moi-identifiers");
// Result schema for each read-only (static) MAS0 callsite, keyed by its
// Endpoint name - see mas0-schema.ts for where each one comes from.
const READ_RESULT_SCHEMAS = {
    [mas0_1.MAS0.Endpoint.SYMBOL]: mas0_schema_1.SYMBOL_RESULT_SCHEMA,
    [mas0_1.MAS0.Endpoint.BALANCEOF]: mas0_schema_1.BALANCEOF_RESULT_SCHEMA,
    [mas0_1.MAS0.Endpoint.CREATOR]: mas0_schema_1.CREATOR_RESULT_SCHEMA,
    [mas0_1.MAS0.Endpoint.MANAGER]: mas0_schema_1.MANAGER_RESULT_SCHEMA,
    [mas0_1.MAS0.Endpoint.DECIMALS]: mas0_schema_1.DECIMALS_RESULT_SCHEMA,
    [mas0_1.MAS0.Endpoint.MAXSUPPLY]: mas0_schema_1.MAX_SUPPLY_RESULT_SCHEMA,
    [mas0_1.MAS0.Endpoint.CIRCULATINGSUPPLY]: mas0_schema_1.CIRCULATING_SUPPLY_RESULT_SCHEMA,
    [mas0_1.MAS0.Endpoint.GETSTATICMETADATA]: mas0_schema_1.GET_STATIC_METADATA_RESULT_SCHEMA,
    [mas0_1.MAS0.Endpoint.GETDYNAMICMETADATA]: mas0_schema_1.GET_DYNAMIC_METADATA_RESULT_SCHEMA,
};
class MAS0AssetLogic {
    assetId;
    signer;
    constructor(assetId, signer) {
        this.assetId = assetId;
        this.signer = signer;
    }
    polorize(payload, schema) {
        const document = (0, js_polo_1.documentEncode)(payload, schema);
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
            ? new js_polo_1.Depolorizer((0, js_moi_utils_1.hexToBytes)(result.outputs)).depolorize(schema)
            : null;
        return {
            output,
            error: js_moi_manifest_1.ManifestCoder.decodeException(result.error),
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
            standard: js_moi_utils_1.AssetStandard.MAS0,
            dimension: 0,
            enable_events: enableEvents,
            manager: manager,
        };
        if (decimals !== undefined) {
            (0, js_moi_utils_1.validateDecimals)(decimals);
            payload.decimals = decimals;
        }
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_CREATE,
            payload: payload,
            participants: [],
            signer: signer,
            // A newly created asset self-pays for its own storage the moment it's
            // created, and a fresh account holds no KMOI - bundle a funding transfer
            // to the derived asset id, same as AssetFactory.create(). See
            // deriveAssetId's docs for why this must mirror the blockchain's id derivation
            // exactly - a wrong prediction sends funds to the wrong account.
            fundingOperations: (sender) => {
                const assetId = (0, js_moi_identifiers_1.deriveAssetId)(sender, payload.standard);
                const transfer = (0, js_moi_interactions_1.buildTransferPayload)(js_moi_constants_1.KMOI_ASSET_ID, assetId.toHex(), option?.storageFund ?? js_moi_constants_1.DEFAULT_STORAGE_FUND);
                return [{ type: js_moi_utils_1.OpType.ASSET_INVOKE, payload: transfer }];
            },
        });
    }
    mint(beneficiary, amount) {
        const payload = {
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
            amount: amount,
        };
        const participants = [
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: beneficiary,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schema_1.MINT_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.MINT,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    mintWithMetadata(beneficiary, amount, staticMetadata) {
        const payload = {
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
            amount: amount,
            static_metadata: new Map(Object.entries(staticMetadata))
        };
        const participants = [
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: beneficiary,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schema_1.MINT_WITH_METADATA_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.MINTWITHMETADATA,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
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
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schema_1.BURN_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.BURN,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    transfer(beneficiary, amount) {
        const payload = {
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
            amount: amount,
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schema_1.TRANSFER_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.TRANSFER,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    transferFrom(benefactor, beneficiary, amount) {
        const payload = {
            benefactor: (0, js_moi_utils_1.hexToBytes)(benefactor),
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
            amount: amount,
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: benefactor,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schema_1.TRANSFER_FROM_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.TRANSFERFROM,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    approve(beneficiary, amount, expiresAt) {
        const payload = {
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
            amount: amount,
            expires_at: expiresAt
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schema_1.APPROVE_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.APPROVE,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    revoke(beneficiary) {
        const payload = {
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schema_1.REVOKE_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.REVOKE,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    lockup(beneficiary, amount) {
        const payload = {
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
            amount: amount
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            },
            {
                id: js_moi_constants_1.SARGA_ADDRESS,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schema_1.LOCKUP_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.LOCKUP,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    release(benefactor, beneficiary, amount) {
        const payload = {
            benefactor: (0, js_moi_utils_1.hexToBytes)(benefactor),
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
            amount: amount
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: benefactor,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schema_1.RELEASE_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.RELEASE,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
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
        const rawPayload = this.polorize(payload, mas0_schema_1.SET_STATIC_METADATA_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.SETSTATICMETADATA,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
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
        const rawPayload = this.polorize(payload, mas0_schema_1.SET_DYNAMIC_METADATA_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.SETDYNAMICMETADATA,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    // Readonly routines
    symbol() {
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.SYMBOL,
            },
            participants: [],
            signer: this.signer,
        });
    }
    balanceOf(id) {
        const payload = {
            address: (0, js_moi_utils_1.hexToBytes)(id)
        };
        const rawPayload = this.polorize(payload, mas0_schema_1.BALANCEOF_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.BALANCEOF,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    creator() {
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.CREATOR,
            },
            participants: [],
            signer: this.signer,
        });
    }
    manager() {
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.MANAGER,
            },
            participants: [],
            signer: this.signer,
        });
    }
    Decimals() {
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.DECIMALS,
            },
            participants: [],
            signer: this.signer,
        });
    }
    MaxSupply() {
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.MAXSUPPLY,
            },
            participants: [],
            signer: this.signer,
        });
    }
    CirculatingSupply() {
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.CIRCULATINGSUPPLY,
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetStaticMetadata(key) {
        const payload = {
            key: key
        };
        const rawPayload = this.polorize(payload, mas0_schema_1.GET_STATIC_METADATA_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.GETSTATICMETADATA,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload)
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetDynamicMetadata(key) {
        const payload = {
            key: key
        };
        const rawPayload = this.polorize(payload, mas0_schema_1.GET_DYNAMIC_METADATA_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas0_1.MAS0.Endpoint.GETDYNAMICMETADATA,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload)
            },
            participants: [],
            signer: this.signer,
        });
    }
}
exports.MAS0AssetLogic = MAS0AssetLogic;
//# sourceMappingURL=mas0-asset.js.map
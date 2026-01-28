"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAS2AssetLogic = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const mas2_1 = require("./mas2");
const js_polo_1 = require("js-polo");
const mas2_schema_1 = require("./mas2-schema");
const js_moi_constants_1 = require("js-moi-constants");
const js_moi_interactions_1 = require("js-moi-interactions");
class MAS2AssetLogic {
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
    static async newAsset(signer, symbol, supply, manager, enableEvents) {
        const response = await this.create(signer, symbol, supply, manager, enableEvents).send();
        const result = await response.result();
        return new MAS2AssetLogic(result[0].asset_id, signer);
    }
    static create(signer, symbol, supply, manager, enableEvents) {
        const payload = {
            symbol: symbol,
            max_supply: supply,
            standard: js_moi_utils_1.AssetStandard.MAS2,
            dimension: 0,
            enable_events: enableEvents,
            manager: manager,
            logic_payload: {
                manifest: "0x",
                callsite: "Init"
            }
        };
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_CREATE,
            payload: payload,
            participants: [],
            signer: signer,
        });
    }
    transfer(tokenId, beneficiary, amount) {
        const payload = {
            token_id: tokenId,
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
        const rawPayload = this.polorize(payload, mas2_schema_1.TRANSFER_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas2_1.MAS2.Endpoint.TRANSFER,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    transferFrom(tokenId, benefactor, beneficiary, amount) {
        const payload = {
            token_id: tokenId,
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
        const rawPayload = this.polorize(payload, mas2_schema_1.TRANSFER_FROM_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas2_1.MAS2.Endpoint.TRANSFERFROM,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
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
        const rawPayload = this.polorize(payload, mas2_schema_1.MINT_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas2_1.MAS2.Endpoint.MINT,
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
            static_metadata: staticMetadata
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
        const rawPayload = this.polorize(payload, mas2_schema_1.MINT_WITH_METADATA_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas2_1.MAS2.Endpoint.MINT,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    burn(tokenId, amount) {
        const payload = {
            token_id: tokenId,
            amount: amount,
        };
        const participants = [
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas2_schema_1.BURN_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas2_1.MAS2.Endpoint.BURN,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    approve(tokenId, beneficiary, amount, expiresAt) {
        const payload = {
            token_id: tokenId,
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
        const rawPayload = this.polorize(payload, mas2_schema_1.APPROVE_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas2_1.MAS2.Endpoint.APPROVE,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    revoke(tokenId, beneficiary) {
        const payload = {
            token_id: tokenId,
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
        const rawPayload = this.polorize(payload, mas2_schema_1.REVOKE_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas2_1.MAS2.Endpoint.REVOKE,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    lockup(tokenId, beneficiary, amount) {
        const payload = {
            token_id: tokenId,
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
        const rawPayload = this.polorize(payload, mas2_schema_1.LOCKUP_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas2_1.MAS2.Endpoint.LOCKUP,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    release(tokenId, benefactor, beneficiary, amount) {
        const payload = {
            token_id: tokenId,
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
        const rawPayload = this.polorize(payload, mas2_schema_1.RELEASE_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas2_1.MAS2.Endpoint.RELEASE,
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
        const rawPayload = this.polorize(payload, mas2_schema_1.SET_STATIC_METADATA_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas2_1.MAS2.Endpoint.SETSTATICMETADATA,
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
        const rawPayload = this.polorize(payload, mas2_schema_1.SET_DYNAMIC_METADATA_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas2_1.MAS2.Endpoint.SETDYNAMICMETADATA,
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
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas2_1.MAS2.Endpoint.SYMBOL,
            },
            participants: [],
            signer: this.signer,
        });
    }
    balanceOf(tokenId, address) {
        const payload = {
            token_id: tokenId,
            address: (0, js_moi_utils_1.hexToBytes)(address)
        };
        const rawPayload = this.polorize(payload, mas2_schema_1.BALANCEOF_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas2_1.MAS2.Endpoint.BALANCEOF,
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
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas2_1.MAS2.Endpoint.CREATOR,
            },
            participants: [],
            signer: this.signer,
        });
    }
    manager() {
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas2_1.MAS2.Endpoint.MANAGER,
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetStaticMetadata() {
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas2_1.MAS2.Endpoint.GETSTATICMETADATA,
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetDynamicMetadata() {
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas2_1.MAS2.Endpoint.GETDYNAMICMETADATA,
            },
            participants: [],
            signer: this.signer,
        });
    }
}
exports.MAS2AssetLogic = MAS2AssetLogic;
//# sourceMappingURL=mas2-asset.js.map
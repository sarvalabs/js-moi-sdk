"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAS1AssetLogic = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const mas1_1 = require("./mas1");
const js_polo_1 = require("js-polo");
const js_moi_constants_1 = require("js-moi-constants");
const js_moi_interactions_1 = require("js-moi-interactions");
const mas1_schema_1 = require("./mas1-schema");
class MAS1AssetLogic {
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
    static async newAsset(signer, symbol, manager, enableEvents) {
        const response = await this.create(signer, symbol, manager, enableEvents).send();
        const result = await response.result();
        return new MAS1AssetLogic(result[0].asset_id, signer);
    }
    static create(signer, symbol, manager, enableEvents) {
        const payload = {
            symbol: symbol,
            max_supply: 1,
            standard: js_moi_utils_1.AssetStandard.MAS1,
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
    mint(beneficiary) {
        const payload = {
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
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
        const rawPayload = this.polorize(payload, mas1_schema_1.MINT_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.MINT,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    mintWithMetadata(beneficiary, staticMetadata) {
        const payload = {
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
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
        const rawPayload = this.polorize(payload, mas1_schema_1.MINT_WITH_METADATA_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.MINTWITHMETADATA,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    burn(tokenId) {
        const payload = {
            token_id: tokenId,
        };
        const participants = [
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas1_schema_1.BURN_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.BURN,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    transfer(tokenId, beneficiary) {
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
        const rawPayload = this.polorize(payload, mas1_schema_1.TRANSFER_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.TRANSFER,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    transferFrom(tokenId, benefactor, beneficiary) {
        const payload = {
            token_id: tokenId,
            benefactor: (0, js_moi_utils_1.hexToBytes)(benefactor),
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
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
        const rawPayload = this.polorize(payload, mas1_schema_1.TRANSFER_FROM_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.TRANSFERFROM,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    approve(tokenId, beneficiary, expiresAt) {
        const payload = {
            token_id: tokenId,
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
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
        const rawPayload = this.polorize(payload, mas1_schema_1.APPROVE_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.APPROVE,
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
        const rawPayload = this.polorize(payload, mas1_schema_1.REVOKE_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.REVOKE,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    lockup(tokenId, beneficiary) {
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
            },
            {
                id: js_moi_constants_1.SARGA_ADDRESS,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
            }
        ];
        const rawPayload = this.polorize(payload, mas1_schema_1.LOCKUP_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.LOCKUP,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    release(tokenId, benefactor, beneficiary) {
        const payload = {
            token_id: tokenId,
            benefactor: (0, js_moi_utils_1.hexToBytes)(benefactor),
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
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
        const rawPayload = this.polorize(payload, mas1_schema_1.RELEASE_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.RELEASE,
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
        const rawPayload = this.polorize(payload, mas1_schema_1.SET_STATIC_METADATA_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.SETSTATICMETADATA,
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
        const rawPayload = this.polorize(payload, mas1_schema_1.SET_DYNAMIC_METADATA_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.SETDYNAMICMETADATA,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    SetStaticTokenMetadata(tokenId, key, value) {
        const payload = {
            token_id: tokenId,
            key: key,
            value: value
        };
        const rawPayload = this.polorize(payload, mas1_schema_1.SET_STATIC_TOKEN_METADATA_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.SETSTATICTOKENMETADATA,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    SetDynamicTokenMetadata(tokenId, key, value) {
        const payload = {
            token_id: tokenId,
            key: key,
            value: value
        };
        const rawPayload = this.polorize(payload, mas1_schema_1.SET_DYNAMIC_TOKEN_METADATA_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.SETDYNAMICTOKENMETADATA,
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
                callsite: mas1_1.MAS1.Endpoint.SYMBOL,
            },
            participants: [],
            signer: this.signer,
        });
    }
    isOwner(tokenId, address) {
        const payload = {
            token_id: tokenId,
            address: address,
        };
        const rawPayload = this.polorize(payload, mas1_schema_1.IS_OWNER_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.SYMBOL,
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
                callsite: mas1_1.MAS1.Endpoint.CREATOR,
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
                callsite: mas1_1.MAS1.Endpoint.MANAGER,
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetStaticMetadata(key) {
        const payload = {
            key: key,
        };
        const rawPayload = this.polorize(payload, mas1_schema_1.GET_STATIC_METADATA_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.GETSTATICMETADATA,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetDynamicMetadata(key) {
        const payload = {
            key: key,
        };
        const rawPayload = this.polorize(payload, mas1_schema_1.GET_DYNAMIC_METADATA_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.GETDYNAMICMETADATA,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetStaticTokenMetadata(tokenId, key) {
        const payload = {
            token_id: tokenId,
            key: key,
        };
        const rawPayload = this.polorize(payload, mas1_schema_1.GET_STATIC_TOKEN_METADATA_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.GETSTATICTOKENMETADATA,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetDynamicTokenMetadata(tokenId, key) {
        const payload = {
            token_id: tokenId,
            key: key
        };
        const rawPayload = this.polorize(payload, mas1_schema_1.GET_DYNAMIC_TOKEN_METADATA_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(this.assetId),
                callsite: mas1_1.MAS1.Endpoint.GETDYNAMICTOKENMETADATA,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
}
exports.MAS1AssetLogic = MAS1AssetLogic;
//# sourceMappingURL=mas1-asset.js.map
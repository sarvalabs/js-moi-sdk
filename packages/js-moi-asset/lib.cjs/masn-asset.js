"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MASNAssetLogic = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const mas0_1 = require("./mas0");
const mas0_schema_1 = require("./mas0-schema");
const js_polo_1 = require("js-polo");
const js_moi_constants_1 = require("js-moi-constants");
const js_moi_interactions_1 = require("js-moi-interactions");
class MASNAssetLogic {
    signer;
    constructor(signer) {
        this.signer = signer;
    }
    polorize(payload, schema) {
        const document = (0, js_polo_1.documentEncode)(payload, schema);
        return document.bytes();
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
                id: js_moi_constants_1.KMOI_ASSET_ID,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schema_1.TRANSFER_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: js_moi_constants_1.KMOI_ASSET_ID,
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
                id: js_moi_constants_1.KMOI_ASSET_ID,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schema_1.TRANSFER_FROM_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: js_moi_constants_1.KMOI_ASSET_ID,
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
                id: js_moi_constants_1.KMOI_ASSET_ID,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schema_1.APPROVE_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: js_moi_constants_1.KMOI_ASSET_ID,
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
                id: js_moi_constants_1.KMOI_ASSET_ID,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schema_1.REVOKE_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: js_moi_constants_1.KMOI_ASSET_ID,
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
                id: js_moi_constants_1.KMOI_ASSET_ID,
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
                asset_id: js_moi_constants_1.KMOI_ASSET_ID,
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
                id: js_moi_constants_1.KMOI_ASSET_ID,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schema_1.RELEASE_SCHEMA);
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: js_moi_constants_1.KMOI_ASSET_ID,
                callsite: mas0_1.MAS0.Endpoint.RELEASE,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    // Readonly routines
    symbol() {
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: js_moi_constants_1.KMOI_ASSET_ID,
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
                asset_id: js_moi_constants_1.KMOI_ASSET_ID,
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
                asset_id: js_moi_constants_1.KMOI_ASSET_ID,
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
                asset_id: js_moi_constants_1.KMOI_ASSET_ID,
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
                asset_id: js_moi_constants_1.KMOI_ASSET_ID,
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
                asset_id: js_moi_constants_1.KMOI_ASSET_ID,
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
                asset_id: js_moi_constants_1.KMOI_ASSET_ID,
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
                asset_id: js_moi_constants_1.KMOI_ASSET_ID,
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
                asset_id: js_moi_constants_1.KMOI_ASSET_ID,
                callsite: mas0_1.MAS0.Endpoint.GETDYNAMICMETADATA,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload)
            },
            participants: [],
            signer: this.signer,
        });
    }
}
exports.MASNAssetLogic = MASNAssetLogic;
//# sourceMappingURL=masn-asset.js.map
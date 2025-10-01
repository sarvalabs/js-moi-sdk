"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantCreate = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_polo_1 = require("js-polo");
const js_moi_wallet_1 = require("js-moi-wallet");
class ParticipantCreate {
    _id;
    _keys = [];
    _value;
    signer;
    constructor(signer) {
        this.signer = signer;
    }
    id(id) {
        this._id = id;
        return this;
    }
    addKey(publicKey, weight, signatureAlgorithm = 0) {
        this._keys.push({
            public_key: publicKey, weight,
            signature_algorithm: signatureAlgorithm
        });
        return this;
    }
    value(assetId, beneficiary, amount) {
        const transferPayload = {
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
            amount: amount
        };
        const transferSchema = {
            kind: "struct",
            fields: {
                beneficiary: {
                    kind: "bytes"
                },
                amount: {
                    kind: "integer"
                }
            }
        };
        const calldata = (0, js_polo_1.documentEncode)(transferPayload, transferSchema);
        this._value = {
            asset_id: assetId,
            callsite: "Transfer",
            calldata: "0x" + (0, js_moi_utils_1.bytesToHex)(calldata.bytes()),
            // Todo: add funds when required
        };
        return this;
    }
    build() {
        if (this._id == null)
            throw new Error("participant id is required");
        if (this._value == null)
            throw new Error("asset payload is required");
        if (this._keys == null || this._keys.length === 0)
            throw new Error("atleast one key is required");
        return new js_moi_wallet_1.InteractionContext({
            opType: js_moi_utils_1.OpType.PARTICIPANT_CREATE,
            payload: {
                id: this._id,
                keys_payload: this._keys,
                value: this._value
            },
            participants: [
                {
                    id: this._value?.asset_id,
                    lock_type: js_moi_utils_1.LockType.NO_LOCK,
                }
            ],
            signer: this.signer,
        });
    }
    async send() {
        const ixnContext = this.build();
        return await ixnContext.send();
    }
}
exports.ParticipantCreate = ParticipantCreate;
//# sourceMappingURL=participant.js.map
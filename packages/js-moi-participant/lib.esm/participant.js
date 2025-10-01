import { bytesToHex, hexToBytes, LockType, OpType } from "js-moi-utils";
import { documentEncode } from "js-polo";
import { InteractionContext } from "js-moi-wallet";
export class ParticipantCreate {
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
            beneficiary: hexToBytes(beneficiary),
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
        const calldata = documentEncode(transferPayload, transferSchema);
        this._value = {
            asset_id: assetId,
            callsite: "Transfer",
            calldata: "0x" + bytesToHex(calldata.bytes()),
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
        return new InteractionContext({
            opType: OpType.PARTICIPANT_CREATE,
            payload: {
                id: this._id,
                keys_payload: this._keys,
                value: this._value
            },
            participants: [
                {
                    id: this._value?.asset_id,
                    lock_type: LockType.NO_LOCK,
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
//# sourceMappingURL=participant.js.map
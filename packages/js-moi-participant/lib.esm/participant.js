import { bytesToHex, LockType, OpType } from "js-moi-utils";
import { Polorizer } from "js-polo";
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
            beneficiary: beneficiary,
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
        const polorizer = new Polorizer();
        polorizer.polorize(transferPayload, transferSchema);
        this._value = {
            asset_id: assetId,
            callsite: "Transfer",
            calldata: "0x" + bytesToHex(polorizer.bytes()),
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
        return {
            id: this._id,
            keys_payload: this._keys,
            value: this._value
        };
    }
    async send() {
        const payload = this.build();
        return this.signer.sendInteraction({
            sender: {
                id: (await this.signer.getIdentifier()).toHex(),
                sequence: (await this.signer.getNonce()),
                key_id: (await this.signer.getKeyId()),
            },
            fuel_price: 1,
            fuel_limit: 10000,
            ix_operations: [
                {
                    type: OpType.PARTICIPANT_CREATE,
                    payload: payload,
                }
            ],
            participants: [
                {
                    id: payload.value?.asset_id,
                    lock_type: LockType.NO_LOCK,
                }
            ]
        });
    }
}
//# sourceMappingURL=participant.js.map
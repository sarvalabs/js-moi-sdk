import { bytesToHex, hexToBytes, LockType, OpType } from "js-moi-utils";
import { KMOI_ASSET_ID } from "js-moi-constants";
import { documentEncode } from "js-polo";
import { InteractionContext } from "./context";
import { TRANSFER_SCHEMA } from "./schema";
export class AccountConfigure {
    _add = [];
    _revoke = [];
    signer;
    constructor(signer) {
        this.signer = signer;
    }
    addKey(publicKey, weight, signatureAlgorithm = 0) {
        this._add.push({
            public_key: publicKey,
            weight,
            signature_algorithm: signatureAlgorithm,
        });
        return this;
    }
    revokeKey(keyId) {
        this._revoke.push({ key_id: keyId });
        return this;
    }
    build() {
        if ((this._add == null && this._revoke == null) ||
            (this._add.length === 0 && this._revoke.length === 0)) {
            throw new Error("either add or revoke payload is required");
        }
        return new InteractionContext({
            opType: OpType.ACCOUNT_CONFIGURE,
            payload: {
                add: this._add,
                revoke: this._revoke
            },
            participants: [],
            signer: this.signer,
        });
    }
    async send() {
        const ixnContext = this.build();
        return await ixnContext.send();
    }
}
export class AccountInherit {
    _target;
    _value;
    _index;
    signer;
    constructor(signer) {
        this.signer = signer;
    }
    target(account) {
        this._target = account;
        return this;
    }
    value(assetId, beneficiary, amount) {
        const transferPayload = {
            beneficiary: hexToBytes(beneficiary),
            amount: amount
        };
        const calldata = documentEncode(transferPayload, TRANSFER_SCHEMA);
        this._value = {
            asset_id: assetId,
            callsite: "Transfer",
            calldata: "0x" + bytesToHex(calldata.bytes()),
            // Todo: add funds when required
        };
        return this;
    }
    index(idx) {
        this._index = idx;
        return this;
    }
    build() {
        if (this._target == null)
            throw new Error("target account is required");
        if (this._value == null)
            throw new Error("asset payload is required");
        if (this._index === undefined)
            throw new Error("sub account index is required");
        return new InteractionContext({
            opType: OpType.ACCOUNT_INHERIT,
            payload: {
                target_account: this._target,
                value: this._value,
                sub_account_index: this._index
            },
            participants: [
                {
                    id: KMOI_ASSET_ID,
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
//# sourceMappingURL=account.js.map
import { LockType, OpType } from "js-moi-utils";
import { KMOI_ASSET_ID } from "js-moi-constants";
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
        return {
            add: this._add,
            revoke: this._revoke
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
                    type: OpType.ACCOUNT_CONFIGURE,
                    payload: payload,
                }
            ]
        });
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
    value(assetId, callsite, funds, calldata) {
        this._value = { asset_id: assetId, callsite, funds, calldata };
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
        return {
            target_account: this._target,
            value: this._value,
            sub_account_index: this._index
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
                    type: OpType.ACCOUNT_INHERIT,
                    payload: payload,
                }
            ],
            participants: [
                {
                    id: KMOI_ASSET_ID,
                    lock_type: LockType.NO_LOCK,
                }
            ]
        });
    }
}
//# sourceMappingURL=account.js.map
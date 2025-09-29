"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountInherit = exports.AccountConfigure = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_moi_constants_1 = require("js-moi-constants");
const js_polo_1 = require("js-polo");
class AccountConfigure {
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
                    type: js_moi_utils_1.OpType.ACCOUNT_CONFIGURE,
                    payload: payload,
                }
            ]
        });
    }
}
exports.AccountConfigure = AccountConfigure;
class AccountInherit {
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
        const polorizer = new js_polo_1.Polorizer();
        polorizer.polorize(transferPayload, transferSchema);
        this._value = {
            asset_id: assetId,
            callsite: "Transfer",
            calldata: "0x" + (0, js_moi_utils_1.bytesToHex)(polorizer.bytes()),
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
                    type: js_moi_utils_1.OpType.ACCOUNT_INHERIT,
                    payload: payload,
                }
            ],
            participants: [
                {
                    id: js_moi_constants_1.KMOI_ASSET_ID,
                    lock_type: js_moi_utils_1.LockType.NO_LOCK,
                }
            ]
        });
    }
}
exports.AccountInherit = AccountInherit;
//# sourceMappingURL=account.js.map
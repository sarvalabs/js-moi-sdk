"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountInherit = exports.AccountConfigure = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_moi_constants_1 = require("js-moi-constants");
const js_polo_1 = require("js-polo");
const context_1 = require("./context");
const schema_1 = require("./schema");
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
        return new context_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ACCOUNT_CONFIGURE,
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
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
            amount: amount
        };
        const calldata = (0, js_polo_1.documentEncode)(transferPayload, schema_1.TRANSFER_SCHEMA);
        this._value = {
            asset_id: assetId,
            callsite: "Transfer",
            calldata: "0x" + (0, js_moi_utils_1.bytesToHex)(calldata.bytes()),
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
        return new context_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ACCOUNT_INHERIT,
            payload: {
                target_account: this._target,
                value: this._value,
                sub_account_index: this._index
            },
            participants: [
                {
                    id: js_moi_constants_1.KMOI_ASSET_ID,
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
exports.AccountInherit = AccountInherit;
//# sourceMappingURL=account.js.map
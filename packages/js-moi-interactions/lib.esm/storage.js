import { OpType } from "js-moi-utils";
import { InteractionContext } from "./context";
export class StorageDeposit {
    _target;
    _depositFor;
    _amount;
    signer;
    constructor(signer) {
        this.signer = signer;
    }
    target(account) {
        this._target = account;
        return this;
    }
    /** Who gets credited with the resulting allowance. Defaults to the signer. */
    for(participant) {
        this._depositFor = participant;
        return this;
    }
    amount(kmoi) {
        this._amount = kmoi;
        return this;
    }
    async build() {
        if (this._target == null)
            throw new Error("target account is required");
        if (this._amount == null)
            throw new Error("amount is required");
        const depositFor = this._depositFor ?? (await this.signer.getIdentifier()).toHex();
        return new InteractionContext({
            opType: OpType.STORAGE_DEPOSIT,
            payload: {
                target_account: this._target,
                deposit_for: depositFor,
                amount: this._amount,
            },
            participants: [],
            signer: this.signer,
        });
    }
    async send() {
        const ixnContext = await this.build();
        return await ixnContext.send();
    }
}
export class StorageWithdraw {
    _target;
    _bytesToRelease = 0;
    signer;
    constructor(signer) {
        this.signer = signer;
    }
    target(account) {
        this._target = account;
        return this;
    }
    /** Bytes to release. Omit to release everything currently available. */
    release(bytesToRelease) {
        this._bytesToRelease = bytesToRelease;
        return this;
    }
    build() {
        if (this._target == null)
            throw new Error("target account is required");
        return new InteractionContext({
            opType: OpType.STORAGE_WITHDRAW,
            payload: {
                target_account: this._target,
                bytes_to_release: this._bytesToRelease,
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
//# sourceMappingURL=storage.js.map
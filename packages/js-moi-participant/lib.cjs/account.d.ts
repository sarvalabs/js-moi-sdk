import { InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { Hex, OpType } from "js-moi-utils";
import { InteractionContext } from "js-moi-wallet";
export declare class AccountConfigure {
    private _add;
    private _revoke;
    private signer;
    constructor(signer: Signer);
    addKey(publicKey: Hex, weight: number, signatureAlgorithm?: number): AccountConfigure;
    revokeKey(keyId: number): AccountConfigure;
    build(): InteractionContext<OpType.ACCOUNT_CONFIGURE>;
    send(): Promise<InteractionResponse>;
}
export declare class AccountInherit {
    private _target?;
    private _value?;
    private _index?;
    private signer;
    constructor(signer: Signer);
    target(account: Hex): AccountInherit;
    value(assetId: Hex, beneficiary: Hex, amount: number | bigint): AccountInherit;
    index(idx: number): AccountInherit;
    build(): InteractionContext<OpType.ACCOUNT_INHERIT>;
    send(): Promise<InteractionResponse>;
}
//# sourceMappingURL=account.d.ts.map
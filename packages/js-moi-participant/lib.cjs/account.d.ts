import { AccountConfigurePayload, AccountInheritPayload, InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { Hex } from "js-moi-utils";
export declare class AccountConfigure {
    private _add;
    private _revoke;
    private signer;
    constructor(signer: Signer);
    addKey(publicKey: Hex, weight: number, signatureAlgorithm?: number): this;
    revokeKey(keyId: number): this;
    build(): AccountConfigurePayload;
    send(): Promise<InteractionResponse>;
}
export declare class AccountInherit {
    private _target?;
    private _value?;
    private _index?;
    private signer;
    constructor(signer: Signer);
    target(account: Hex): this;
    value(assetId: Hex, callsite: string, funds: Record<Hex, number | bigint>, calldata?: Hex): this;
    index(idx: number): this;
    build(): AccountInheritPayload;
    send(): Promise<InteractionResponse>;
}
//# sourceMappingURL=account.d.ts.map
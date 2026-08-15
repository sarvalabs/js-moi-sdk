import { InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { Hex, OpType } from "js-moi-utils";
import { InteractionContext } from "./context";
export declare class StorageDeposit {
    private _target?;
    private _depositFor?;
    private _amount?;
    private signer;
    constructor(signer: Signer);
    target(account: Hex): StorageDeposit;
    /** Who gets credited with the resulting allowance. Defaults to the signer. */
    for(participant: Hex): StorageDeposit;
    amount(kmoi: number | bigint): StorageDeposit;
    build(): Promise<InteractionContext<OpType.STORAGE_DEPOSIT>>;
    send(): Promise<InteractionResponse>;
}
export declare class StorageWithdraw {
    private _target?;
    private _bytesToRelease;
    private signer;
    constructor(signer: Signer);
    target(account: Hex): StorageWithdraw;
    /** Bytes to release. Omit to release everything currently available. */
    release(bytesToRelease: number): StorageWithdraw;
    build(): InteractionContext<OpType.STORAGE_WITHDRAW>;
    send(): Promise<InteractionResponse>;
}
//# sourceMappingURL=storage.d.ts.map
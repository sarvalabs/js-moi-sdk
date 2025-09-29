import { AssetCreatePayload, AssetActionPayload, IxParticipant, InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { OpType } from "js-moi-utils";
type AllowedOps = OpType.ASSET_CREATE | OpType.ASSET_INVOKE;
type OperationMap = {
    [OpType.ASSET_CREATE]: AssetCreatePayload;
    [OpType.ASSET_INVOKE]: AssetActionPayload;
};
type Context<T extends AllowedOps> = {
    opType: T;
    payload: OperationMap[T];
    participants: IxParticipant[];
    signer: Signer;
};
export interface IxOption {
    fuel_price: number;
    fuel_limit: number;
    participants: IxParticipant[];
}
export declare class InteractionContext<T extends AllowedOps> {
    private ctx;
    constructor(ctx: Context<T>);
    send(option?: IxOption): Promise<InteractionResponse>;
    call(option?: IxOption): Promise<number | bigint>;
    estimateFuel(option?: IxOption): Promise<number | bigint>;
}
export {};
//# sourceMappingURL=interaction.d.ts.map
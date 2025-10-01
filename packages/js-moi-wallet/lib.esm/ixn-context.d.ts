import { AssetCreatePayload, AssetActionPayload, IxParticipant, InteractionResponse, ParticipantCreatePayload, AccountConfigurePayload, AccountInheritPayload, InteractionCallResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { OpType } from "js-moi-utils";
export type AllowedOps = OpType.ASSET_CREATE | OpType.ASSET_INVOKE | OpType.PARTICIPANT_CREATE | OpType.ACCOUNT_CONFIGURE | OpType.ACCOUNT_INHERIT;
type OperationMap = {
    [OpType.ASSET_CREATE]: AssetCreatePayload;
    [OpType.ASSET_INVOKE]: AssetActionPayload;
    [OpType.PARTICIPANT_CREATE]: ParticipantCreatePayload;
    [OpType.ACCOUNT_CONFIGURE]: AccountConfigurePayload;
    [OpType.ACCOUNT_INHERIT]: AccountInheritPayload;
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
    type(): OpType;
    payload(): OperationMap[T];
    participants(): IxParticipant[];
    send(option?: IxOption): Promise<InteractionResponse>;
    call(option?: IxOption): Promise<InteractionCallResponse>;
    estimateFuel(option?: IxOption): Promise<number | bigint>;
}
export {};
//# sourceMappingURL=ixn-context.d.ts.map
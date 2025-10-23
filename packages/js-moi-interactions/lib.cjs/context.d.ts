import { AssetCreatePayload, AssetActionPayload, IxParticipant, InteractionResponse, ParticipantCreatePayload, AccountConfigurePayload, AccountInheritPayload, InteractionCallResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { OpType } from "js-moi-utils";
/**
 * Represents all valid operation types supported by InteractionContext.
 */
export type AllowedOps = OpType.ASSET_CREATE | OpType.ASSET_INVOKE | OpType.PARTICIPANT_CREATE | OpType.ACCOUNT_CONFIGURE | OpType.ACCOUNT_INHERIT;
/**
 * Maps operation types to their expected payloads.
 */
type OperationMap = {
    [OpType.ASSET_CREATE]: AssetCreatePayload;
    [OpType.ASSET_INVOKE]: AssetActionPayload;
    [OpType.PARTICIPANT_CREATE]: ParticipantCreatePayload;
    [OpType.ACCOUNT_CONFIGURE]: AccountConfigurePayload;
    [OpType.ACCOUNT_INHERIT]: AccountInheritPayload;
};
/**
 * Context object describing the state of an interaction.
 */
interface Context<T extends AllowedOps> {
    opType: T;
    payload: OperationMap[T];
    participants: IxParticipant[];
    signer: Signer;
}
/**
 * Optional configuration for executing an interaction.
 */
export interface IxOption {
    fuel_price?: number;
    fuel_limit?: number;
    participants?: IxParticipant[];
}
/**
 * A unified context class that encapsulates the full lifecycle of
 * a Moi interaction — from building the operation to executing
 * (send/call/estimate).
 */
export declare class InteractionContext<T extends AllowedOps> {
    private readonly ctx;
    constructor(ctx: Context<T>);
    /** Returns the operation type for this interaction. */
    type(): OpType;
    /** Returns the payload associated with this interaction. */
    payload(): OperationMap[T];
    /** Returns all participants involved in this interaction. */
    participants(): IxParticipant[];
    /** @internal Builds the base sender object for all calls. */
    private buildSender;
    /** @internal Builds the interaction operation. */
    private buildOperation;
    /** @internal Combines base and additional participants. */
    private mergeParticipants;
    /**
     * Sends a transaction to the network, committing changes.
     * @param option Optional configuration such as fuel price or participants
     */
    send(option?: IxOption): Promise<InteractionResponse>;
    /**
     * Executes a read-only call (no state changes).
     * @param option Optional configuration such as additional participants
     */
    call(option?: IxOption): Promise<InteractionCallResponse>;
    /**
     * Estimates the fuel cost for this interaction.
     * @param option Optional configuration such as additional participants
     */
    estimateFuel(option?: IxOption): Promise<number | bigint>;
}
export {};
//# sourceMappingURL=context.d.ts.map
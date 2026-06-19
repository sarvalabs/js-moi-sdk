import { IxParticipant, InteractionResponse, AnyIxOperation, InteractionCallResponse, InteractionObject } from "js-moi-providers";
import { OpType } from "js-moi-utils";
import { AllowedOps, IxContext, IxOption, OperationMap } from "../types/context";
/**
 * A unified context class that encapsulates the full lifecycle of
 * a Moi interaction — from building the operation to executing
 * (send/call/estimate).
 */
export declare class InteractionContext<T extends AllowedOps> {
    private readonly ctx;
    constructor(ctx: IxContext<T>);
    /** Returns the operation type for this interaction. */
    type(): OpType;
    /** Returns the payload associated with this interaction. */
    payload(): OperationMap[T];
    /** Returns all participants involved in this interaction. */
    participants(): IxParticipant[];
    /** Builds the base sender object, respecting any overrides in option. */
    protected buildSender(option?: IxOption): Promise<import("js-moi-providers").Sender>;
    /** Builds the interaction operation. */
    protected buildOperation(): Extract<AnyIxOperation, {
        type: T;
    }>;
    /** Merges base and option participants, with option entries overriding base entries by id. */
    protected mergeParticipants(option?: IxOption): IxParticipant[];
    /**
     * Builds and returns the full interaction data object.
     * @param option Optional configuration such as fuel price or participants
     */
    ixData(option?: IxOption): Promise<InteractionObject>;
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
//# sourceMappingURL=context.d.ts.map
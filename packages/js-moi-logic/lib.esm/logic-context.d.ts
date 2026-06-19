import { InteractionCallResponse, InteractionResponse } from "js-moi-providers";
import { InteractionContext, IxContext, IxOption } from "js-moi-interactions";
import { OpType } from "js-moi-utils";
import { LogicIxCallResponse, LogicIxResponse, LogicIxResult } from "../types/interaction";
/**
 * Union of all logic-specific operation types.
 */
export type LogicOps = OpType.LOGIC_DEPLOY | OpType.LOGIC_INVOKE | OpType.LOGIC_ENLIST;
/**
 * An InteractionResponse enriched with a result() method for decoding logic output.
 */
export interface LogicInteractionResponse extends InteractionResponse {
    result: (timeout?: number) => Promise<LogicIxResult>;
}
/**
 * An InteractionCallResponse enriched with a result() method for decoding logic output.
 */
export interface LogicCallResponse extends InteractionCallResponse {
    result: (timeout?: number) => Promise<LogicIxResult>;
}
/**
 * Extends InteractionContext for logic-specific operations (deploy, invoke, enlist).
 * Adds automatic fuel estimation on send and attaches result decoding to responses.
 */
export declare class LogicContext<T extends LogicOps> extends InteractionContext<T> {
    private readonly routineName;
    private readonly processResultFn;
    constructor(ctx: IxContext<T>, routineName: string, processResult: (response: LogicIxResponse | LogicIxCallResponse, timeout?: number) => Promise<LogicIxResult>);
    /**
     * Sends a transaction to the network, committing state changes.
     * Automatically estimates fuel if not provided in option.
     *
     * @param {IxOption} option - Optional configuration such as fuel price or participants.
     * @returns {Promise<LogicInteractionResponse>} A promise that resolves to the interaction
     * response with a result() method for decoding logic output.
     */
    send(option?: IxOption): Promise<LogicInteractionResponse>;
    /**
     * Executes a read-only call (no state changes).
     *
     * @param {IxOption} option - Optional configuration such as additional participants.
     * @returns {Promise<LogicCallResponse>} A promise that resolves to the call response
     * with a result() method for decoding logic output.
     */
    call(option?: IxOption): Promise<LogicCallResponse>;
}
//# sourceMappingURL=logic-context.d.ts.map
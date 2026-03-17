import { InteractionCallResponse, InteractionResponse } from "js-moi-providers";
import { InteractionContext, IxContext, IxOption } from "js-moi-interactions";
import { OpType } from "js-moi-utils";
import { DEFAULT_FUEL_PRICE } from "js-moi-constants";
import { LogicIxResponse, LogicIxResult } from "../types/interaction";

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
export class LogicContext<T extends LogicOps> extends InteractionContext<T> {
    private readonly routineName: string;
    private readonly processResultFn: (response: LogicIxResponse, timeout?: number) => Promise<LogicIxResult>;

    constructor(
        ctx: IxContext<T>,
        routineName: string,
        processResult: (response: LogicIxResponse, timeout?: number) => Promise<LogicIxResult>
    ) {
        super(ctx);
        this.routineName = routineName;
        this.processResultFn = processResult;
    }

    /**
     * Sends a transaction to the network, committing state changes.
     * Automatically estimates fuel if not provided in option.
     *
     * @param {IxOption} option - Optional configuration such as fuel price or participants.
     * @returns {Promise<LogicInteractionResponse>} A promise that resolves to the interaction
     * response with a result() method for decoding logic output.
     */
    public override async send(option?: IxOption): Promise<LogicInteractionResponse> {
        const fuel_limit = option?.fuel_limit ?? Number(await this.estimateFuel(option));
        const fuel_price = option?.fuel_price ?? DEFAULT_FUEL_PRICE;

        const response = await super.send({ ...option, fuel_limit, fuel_price });

        return {
            ...response,
            result: this.processResultFn.bind(this, { ...response, routine_name: this.routineName }),
        };
    }

    /**
     * Executes a read-only call (no state changes).
     *
     * @param {IxOption} option - Optional configuration such as additional participants.
     * @returns {Promise<LogicCallResponse>} A promise that resolves to the call response
     * with a result() method for decoding logic output.
     */
    public override async call(option?: IxOption): Promise<LogicCallResponse> {
        const response = await super.call(option);

        return {
            ...response,
            result: this.processResultFn.bind(this, { ...response, routine_name: this.routineName }),
        };
    }
}

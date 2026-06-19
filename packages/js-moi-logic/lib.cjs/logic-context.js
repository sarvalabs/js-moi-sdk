"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicContext = void 0;
const js_moi_interactions_1 = require("js-moi-interactions");
const js_moi_constants_1 = require("js-moi-constants");
/**
 * Extends InteractionContext for logic-specific operations (deploy, invoke, enlist).
 * Adds automatic fuel estimation on send and attaches result decoding to responses.
 */
class LogicContext extends js_moi_interactions_1.InteractionContext {
    routineName;
    processResultFn;
    constructor(ctx, routineName, processResult) {
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
    async send(option) {
        const fuel_limit = option?.fuel_limit ?? Number(await this.estimateFuel(option));
        const fuel_price = option?.fuel_price ?? js_moi_constants_1.DEFAULT_FUEL_PRICE;
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
    async call(option) {
        const response = await super.call(option);
        return {
            ...response,
            result: this.processResultFn.bind(this, { ...response, routine_name: this.routineName }),
        };
    }
}
exports.LogicContext = LogicContext;
//# sourceMappingURL=logic-context.js.map
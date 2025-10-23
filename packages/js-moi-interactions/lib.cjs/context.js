"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionContext = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_moi_constants_1 = require("js-moi-constants");
/**
 * A unified context class that encapsulates the full lifecycle of
 * a Moi interaction — from building the operation to executing
 * (send/call/estimate).
 */
class InteractionContext {
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
    }
    /** Returns the operation type for this interaction. */
    type() {
        return this.ctx.opType;
    }
    /** Returns the payload associated with this interaction. */
    payload() {
        return this.ctx.payload;
    }
    /** Returns all participants involved in this interaction. */
    participants() {
        return this.ctx.participants;
    }
    /** @internal Builds the base sender object for all calls. */
    async buildSender() {
        const { signer } = this.ctx;
        const [identifier, nonce, keyId] = await Promise.all([
            signer.getIdentifier(),
            signer.getNonce(),
            signer.getKeyId(),
        ]);
        return {
            id: identifier.toHex(),
            sequence: nonce,
            key_id: keyId,
        };
    }
    /** @internal Builds the interaction operation. */
    buildOperation() {
        return {
            type: this.ctx.opType,
            payload: this.ctx.payload,
        };
    }
    /** @internal Combines base and additional participants. */
    mergeParticipants(option) {
        const base = this.ctx.participants ?? [];
        const extra = option?.participants ?? [];
        return [...base, ...extra];
    }
    /**
     * Sends a transaction to the network, committing changes.
     * @param option Optional configuration such as fuel price or participants
     */
    async send(option) {
        const { signer } = this.ctx;
        const sender = await this.buildSender();
        return signer.sendInteraction({
            sender,
            fuel_price: option?.fuel_price ?? js_moi_constants_1.DEFAULT_FUEL_PRICE,
            fuel_limit: option?.fuel_limit ?? js_moi_constants_1.DEFAULT_FUEL_LIMIT,
            ix_operations: [this.buildOperation()],
            participants: this.mergeParticipants(option),
        });
    }
    /**
     * Executes a read-only call (no state changes).
     * @param option Optional configuration such as additional participants
     */
    async call(option) {
        const { signer } = this.ctx;
        const sender = await this.buildSender();
        return signer.call({
            sender,
            fuel_price: option?.fuel_price ?? js_moi_constants_1.DEFAULT_FUEL_PRICE,
            fuel_limit: option?.fuel_limit ?? js_moi_constants_1.DEFAULT_FUEL_LIMIT,
            ix_operations: [this.buildOperation()],
            participants: this.mergeParticipants(option),
        });
    }
    /**
     * Estimates the fuel cost for this interaction.
     * @param option Optional configuration such as additional participants
     */
    async estimateFuel(option) {
        const { signer } = this.ctx;
        const sender = await this.buildSender();
        return signer.estimateFuel({
            sender,
            fuel_price: option?.fuel_price ?? js_moi_constants_1.DEFAULT_FUEL_PRICE,
            fuel_limit: option?.fuel_limit ?? js_moi_constants_1.DEFAULT_FUEL_LIMIT,
            ix_operations: [this.buildOperation()],
            participants: this.mergeParticipants(option),
        });
    }
}
exports.InteractionContext = InteractionContext;
//# sourceMappingURL=context.js.map
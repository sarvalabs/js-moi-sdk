import { trimHexPrefix } from "js-moi-utils";
import { DEFAULT_FUEL_PRICE, DEFAULT_FUEL_LIMIT } from "js-moi-constants";
/**
 * A unified context class that encapsulates the full lifecycle of
 * a Moi interaction — from building the operation to executing
 * (send/call/estimate).
 */
export class InteractionContext {
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
    /** Builds the base sender object, respecting any overrides in option. */
    async buildSender(option) {
        if (option?.sender) {
            return option.sender;
        }
        const { signer } = this.ctx;
        const [identifier, keyId] = await Promise.all([
            signer.getIdentifier(),
            signer.getKeyId(),
        ]);
        return {
            id: identifier.toHex(),
            sequence: option?.sequence ?? (await signer.getNonce()),
            key_id: keyId,
        };
    }
    /** Builds the interaction operation. */
    buildOperation() {
        return {
            type: this.ctx.opType,
            payload: this.ctx.payload,
        };
    }
    /** Merges base and option participants, with option entries overriding base entries by id. */
    mergeParticipants(option) {
        const merged = new Map();
        for (const p of this.ctx.participants ?? []) {
            merged.set(trimHexPrefix(p.id), p);
        }
        for (const p of option?.participants ?? []) {
            merged.set(trimHexPrefix(p.id), p);
        }
        return Array.from(merged.values());
    }
    /**
     * Builds and returns the full interaction data object.
     * @param option Optional configuration such as fuel price or participants
     */
    async ixData(option) {
        const sender = await this.buildSender(option);
        return {
            sender,
            fuel_price: option?.fuel_price ?? DEFAULT_FUEL_PRICE,
            fuel_limit: option?.fuel_limit ?? DEFAULT_FUEL_LIMIT,
            ix_operations: [this.buildOperation()],
            participants: this.mergeParticipants(option),
        };
    }
    /**
     * Sends a transaction to the network, committing changes.
     * @param option Optional configuration such as fuel price or participants
     */
    async send(option) {
        return this.ctx.signer.sendInteraction(await this.ixData(option));
    }
    /**
     * Executes a read-only call (no state changes).
     * @param option Optional configuration such as additional participants
     */
    async call(option) {
        return this.ctx.signer.call(await this.ixData(option));
    }
    /**
     * Estimates the fuel cost for this interaction.
     * @param option Optional configuration such as additional participants
     */
    async estimateFuel(option) {
        return this.ctx.signer.estimateFuel(await this.ixData(option));
    }
}
//# sourceMappingURL=context.js.map
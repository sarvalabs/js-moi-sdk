"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionContext = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const DEFAULT_FUEL_PRICE = 1;
const DEFAULT_FUEL_LIMIT = 10000;
class InteractionContext {
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
    }
    type() {
        return this.ctx.opType;
    }
    payload() {
        return this.ctx.payload;
    }
    participants() {
        return this.ctx.participants;
    }
    async send(option) {
        const { opType, payload, participants, signer } = this.ctx;
        const ixOp = {
            type: opType,
            payload: payload,
        };
        return signer.sendInteraction({
            sender: {
                id: (await signer.getIdentifier()).toHex(),
                sequence: (await signer.getNonce()),
                key_id: (await signer.getKeyId()),
            },
            fuel_price: option?.fuel_price != null ?
                option.fuel_price : DEFAULT_FUEL_PRICE,
            fuel_limit: option?.fuel_limit != null ?
                option.fuel_limit : DEFAULT_FUEL_LIMIT,
            ix_operations: [ixOp],
            participants: option?.participants ?
                [...option.participants, ...participants ?? []] : participants,
        });
    }
    async call(option) {
        const { opType, payload, participants, signer } = this.ctx;
        const ixOp = {
            type: opType,
            payload: payload,
        };
        return signer.call({
            sender: {
                id: (await signer.getIdentifier()).toHex(),
                sequence: (await signer.getNonce()),
                key_id: (await signer.getKeyId()),
            },
            fuel_price: DEFAULT_FUEL_PRICE,
            fuel_limit: DEFAULT_FUEL_LIMIT,
            ix_operations: [ixOp],
            participants: option?.participants ?
                [...option?.participants, ...participants ?? []] : participants,
        });
    }
    async estimateFuel(option) {
        const { opType, payload, participants, signer } = this.ctx;
        const ixOp = {
            type: opType,
            payload: payload,
        };
        return signer.estimateFuel({
            sender: {
                id: (await signer.getIdentifier()).toHex(),
                sequence: (await signer.getNonce()),
                key_id: (await signer.getKeyId()),
            },
            fuel_price: DEFAULT_FUEL_PRICE,
            fuel_limit: DEFAULT_FUEL_LIMIT,
            ix_operations: [ixOp],
            participants: option?.participants ?
                [...option?.participants, ...participants ?? []] : participants,
        });
    }
}
exports.InteractionContext = InteractionContext;
//# sourceMappingURL=ixn-context.js.map
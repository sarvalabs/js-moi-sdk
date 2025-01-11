"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformInteraction = exports.getInteractionRequestSchema = void 0;
exports.encodeInteraction = encodeInteraction;
const js_polo_1 = require("js-polo");
const polo_schema_1 = require("polo-schema");
const hex_1 = require("./hex");
const operations_1 = require("./operations");
/**
 * Generates and returns the POLO schema for an interaction request.
 *
 * @returns The POLO schema for an interaction request.
 */
const getInteractionRequestSchema = () => {
    return polo_schema_1.polo.struct({
        sender: polo_schema_1.polo.struct({
            address: polo_schema_1.polo.bytes,
            sequence_id: polo_schema_1.polo.integer,
            key_id: polo_schema_1.polo.integer,
        }),
        payer: polo_schema_1.polo.bytes,
        fuel_price: polo_schema_1.polo.integer,
        fuel_limit: polo_schema_1.polo.integer,
        funds: polo_schema_1.polo.arrayOf(polo_schema_1.polo.struct({
            asset_id: polo_schema_1.polo.string,
            amount: polo_schema_1.polo.integer,
        })),
        ix_operations: polo_schema_1.polo.arrayOf(polo_schema_1.polo.struct({
            type: polo_schema_1.polo.integer,
            payload: polo_schema_1.polo.bytes,
        })),
        participants: polo_schema_1.polo.arrayOf(polo_schema_1.polo.struct({
            address: polo_schema_1.polo.bytes,
            lock_type: polo_schema_1.polo.integer,
            notary: polo_schema_1.polo.boolean,
        })),
        preferences: polo_schema_1.polo.struct({
            compute: polo_schema_1.polo.bytes,
            consensus: polo_schema_1.polo.struct({
                mtq: polo_schema_1.polo.integer,
                trust_nodes: polo_schema_1.polo.arrayOf(polo_schema_1.polo.string),
            }),
        }),
        perception: polo_schema_1.polo.bytes,
    });
};
exports.getInteractionRequestSchema = getInteractionRequestSchema;
/**
 * Transforms an interaction request to a format that can be serialized to POLO.
 *
 * @param ix Interaction request
 * @returns a raw interaction request
 */
const transformInteraction = (ix) => {
    return {
        ...ix,
        sender: { ...ix.sender, address: (0, hex_1.hexToBytes)(ix.sender.address) },
        payer: ix.payer ? (0, hex_1.hexToBytes)(ix.payer) : undefined,
        ix_operations: ix.operations.map((op) => ({ ...op, payload: (0, operations_1.encodeOperationPayload)(op) })),
        participants: ix.participants?.map((participant) => ({ ...participant, address: (0, hex_1.hexToBytes)(participant.address) })),
        perception: ix.perception ? (0, hex_1.hexToBytes)(ix.perception) : undefined,
        preferences: ix.preferences ? { ...ix.preferences, compute: (0, hex_1.hexToBytes)(ix.preferences.compute) } : undefined,
    };
};
exports.transformInteraction = transformInteraction;
/**
 * Encodes an interaction request into a POLO bytes.
 *
 * This function takes an interaction request, which can be either an `InteractionRequest`
 * or a `RawInteractionRequest`, and encodes it into a POLO bytes.
 *
 * If the request contains raw interaction, it will be transformed into an raw interaction request
 * that can be serialized to POLO.
 *
 * @param ix - The interaction request to encode. It can be of type `InteractionRequest` or `RawInteractionRequest`.
 * @returns A POLO bytes representing the encoded interaction request.
 */
function encodeInteraction(ix) {
    const data = "operations" in ix ? (0, exports.transformInteraction)(ix) : ix;
    const polorizer = new js_polo_1.Polorizer();
    polorizer.polorize(data, (0, exports.getInteractionRequestSchema)());
    return polorizer.bytes();
}
//# sourceMappingURL=interaction.js.map
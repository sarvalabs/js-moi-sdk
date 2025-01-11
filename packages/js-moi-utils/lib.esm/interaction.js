import { Polorizer } from "js-polo";
import { polo } from "polo-schema";
import { hexToBytes } from "./hex";
import { encodeOperationPayload } from "./operations";
/**
 * Generates and returns the POLO schema for an interaction request.
 *
 * @returns The POLO schema for an interaction request.
 */
export const getInteractionRequestSchema = () => {
    return polo.struct({
        sender: polo.struct({
            address: polo.bytes,
            sequence_id: polo.integer,
            key_id: polo.integer,
        }),
        payer: polo.bytes,
        fuel_price: polo.integer,
        fuel_limit: polo.integer,
        funds: polo.arrayOf(polo.struct({
            asset_id: polo.string,
            amount: polo.integer,
        })),
        ix_operations: polo.arrayOf(polo.struct({
            type: polo.integer,
            payload: polo.bytes,
        })),
        participants: polo.arrayOf(polo.struct({
            address: polo.bytes,
            lock_type: polo.integer,
            notary: polo.boolean,
        })),
        preferences: polo.struct({
            compute: polo.bytes,
            consensus: polo.struct({
                mtq: polo.integer,
                trust_nodes: polo.arrayOf(polo.string),
            }),
        }),
        perception: polo.bytes,
    });
};
/**
 * Transforms an interaction request to a format that can be serialized to POLO.
 *
 * @param ix Interaction request
 * @returns a raw interaction request
 */
export const transformInteraction = (ix) => {
    return {
        ...ix,
        sender: { ...ix.sender, address: hexToBytes(ix.sender.address) },
        payer: ix.payer ? hexToBytes(ix.payer) : undefined,
        ix_operations: ix.operations.map((op) => ({ ...op, payload: encodeOperationPayload(op) })),
        participants: ix.participants?.map((participant) => ({ ...participant, address: hexToBytes(participant.address) })),
        perception: ix.perception ? hexToBytes(ix.perception) : undefined,
        preferences: ix.preferences ? { ...ix.preferences, compute: hexToBytes(ix.preferences.compute) } : undefined,
    };
};
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
export function encodeInteraction(ix) {
    const data = "operations" in ix ? transformInteraction(ix) : ix;
    const polorizer = new Polorizer();
    polorizer.polorize(data, getInteractionRequestSchema());
    return polorizer.bytes();
}
//# sourceMappingURL=interaction.js.map
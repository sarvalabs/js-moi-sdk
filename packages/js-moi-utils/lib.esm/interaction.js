import { Polorizer } from "js-polo";
import { polo } from "polo-schema";
import { LockType, OpType } from "./enums";
import { ensureHexPrefix, hexToBytes, trimHexPrefix } from "./hex";
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
const gatherIxParticipants = (interaction) => {
    const participants = new Map([
        [
            interaction.sender.address,
            {
                address: interaction.sender.address,
                lock_type: LockType.MutateLock,
                notary: false,
            },
        ],
    ]);
    if (interaction.payer != null) {
        participants.set(interaction.payer, {
            address: interaction.payer,
            lock_type: LockType.MutateLock,
            notary: false,
        });
    }
    for (const { type, payload } of interaction.operations) {
        switch (type) {
            case OpType.ParticipantCreate: {
                participants.set(payload.address, {
                    address: payload.address,
                    lock_type: LockType.MutateLock,
                    notary: false, // TODO: Check what should be value of this or can be left blank
                });
                break;
            }
            case OpType.AssetMint:
            case OpType.AssetBurn: {
                const address = ensureHexPrefix(trimHexPrefix(payload.asset_id).slice(8));
                participants.set(address, {
                    address,
                    lock_type: LockType.MutateLock,
                    notary: false, // TODO: Check what should be value of this or can be left blank
                });
                break;
            }
            case OpType.AssetTransfer: {
                participants.set(payload.beneficiary, {
                    address: payload.beneficiary,
                    lock_type: LockType.MutateLock,
                    notary: false, // TODO: Check what should be value of this or can be left blank
                });
                break;
            }
            case OpType.LogicInvoke:
            case OpType.LogicEnlist: {
                const address = ensureHexPrefix(trimHexPrefix(payload.logic_id).slice(6));
                participants.set(address, {
                    address,
                    lock_type: LockType.MutateLock,
                    notary: false, // TODO: Check what should be value of this or can be left blank
                });
                break;
            }
        }
    }
    for (const participant of interaction.participants ?? []) {
        if (participants.has(participant.address)) {
            continue;
        }
        participants.set(participant.address, participant);
    }
    return Array.from(participants.values());
};
const gatherIxFunds = (interaction) => {
    const funds = new Map();
    for (const { type, payload } of interaction.operations) {
        switch (type) {
            case OpType.AssetTransfer:
            case OpType.AssetMint:
            case OpType.AssetBurn: {
                funds.set(payload.asset_id, { asset_id: payload.asset_id, amount: payload.amount });
            }
        }
    }
    for (const { asset_id, amount } of interaction.funds ?? []) {
        if (funds.has(asset_id)) {
            continue;
        }
        funds.set(asset_id, { asset_id, amount });
    }
    return Array.from(funds.values());
};
/**
 * Creates a POLO bytes from an interaction request.
 *
 * It smartly gathers the participants and funds from the interaction request and then encodes the interaction request.
 *
 * @param ix - The interaction request to encode.
 * @returns A POLO bytes representing the encoded interaction request.
 */
export const interaction = (ix) => {
    return encodeInteraction({
        ...ix,
        participants: gatherIxParticipants(ix),
        funds: gatherIxFunds(ix),
    });
};
//# sourceMappingURL=interaction.js.map
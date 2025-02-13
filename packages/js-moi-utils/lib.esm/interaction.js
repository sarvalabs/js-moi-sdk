import { ZERO_ADDRESS } from "js-moi-constants";
import { AssetId, LogicId, ParticipantId } from "js-moi-identifiers";
import { Polorizer } from "js-polo";
import { polo } from "polo-schema";
import { LockType, OpType } from "./enums";
import { hexToBytes, isHex } from "./hex";
import { encodeOperation, validateOperation } from "./operations";
/**
 * Generates and returns the POLO schema for an interaction request.
 *
 * @returns The POLO schema for an interaction request.
 */
export const getInteractionRequestSchema = () => {
    return polo.struct({
        sender: polo.struct({
            id: polo.bytes,
            sequence_id: polo.integer,
            key_id: polo.integer,
        }),
        payer: polo.bytes,
        fuel_price: polo.integer,
        fuel_limit: polo.integer,
        funds: polo.arrayOf(polo.struct({
            asset_id: polo.bytes,
            amount: polo.integer,
        })),
        ix_operations: polo.arrayOf(polo.struct({
            type: polo.integer,
            payload: polo.bytes,
        })),
        participants: polo.arrayOf(polo.struct({
            id: polo.bytes,
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
        sender: { ...ix.sender, id: new ParticipantId(ix.sender.id).toBytes() },
        payer: hexToBytes(ix.payer ?? ZERO_ADDRESS),
        ix_operations: ix.operations.map(encodeOperation),
        participants: ix.participants?.map((participant) => ({ ...participant, id: hexToBytes(participant.id) })),
        perception: ix.perception ? hexToBytes(ix.perception) : undefined,
        preferences: ix.preferences ? { ...ix.preferences, compute: hexToBytes(ix.preferences.compute) } : undefined,
        funds: ix.funds?.map((fund) => ({ ...fund, asset_id: hexToBytes(fund.asset_id) })),
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
            interaction.sender.id,
            {
                id: interaction.sender.id,
                lock_type: LockType.MutateLock,
                notary: false,
            },
        ],
    ]);
    if (interaction.payer != null) {
        participants.set(interaction.payer, {
            id: interaction.payer,
            lock_type: LockType.MutateLock,
            notary: false,
        });
    }
    for (const { type, payload } of interaction.operations) {
        switch (type) {
            case OpType.ParticipantCreate: {
                participants.set(payload.id, {
                    id: payload.id,
                    lock_type: LockType.MutateLock,
                    notary: false,
                });
                break;
            }
            case OpType.AssetMint:
            case OpType.AssetBurn: {
                const identifier = new AssetId(payload.asset_id);
                participants.set(identifier.toHex(), {
                    id: identifier.toHex(),
                    lock_type: LockType.MutateLock,
                    notary: false,
                });
                break;
            }
            case OpType.AssetTransfer: {
                participants.set(payload.beneficiary, {
                    id: payload.beneficiary,
                    lock_type: LockType.MutateLock,
                    notary: false,
                });
                break;
            }
            case OpType.LogicInvoke:
            case OpType.LogicEnlist: {
                const identifier = new LogicId(payload.logic_id);
                participants.set(identifier.toHex(), {
                    id: identifier.toHex(),
                    lock_type: LockType.MutateLock,
                    notary: false,
                });
                break;
            }
        }
    }
    for (const participant of interaction.participants ?? []) {
        if (participants.has(participant.id)) {
            continue;
        }
        participants.set(participant.id, participant);
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
    const interaction = {
        ...ix,
        participants: gatherIxParticipants(ix),
        funds: gatherIxFunds(ix),
    };
    return encodeInteraction(interaction);
};
const createInvalidResult = (value, field, message) => {
    return { field, message, value: value[field] };
};
/**
 * Validates an InteractionRequest object.
 *
 * @param ix - The InteractionRequest object to validate.
 * @returns A result from `createInvalidResult` if the validation fails, or `null` if the validation passes.
 *
 * The function performs the following validations:
 * - Checks if the sender is present and has a valid address.
 * - Checks if the fuel price and fuel limit are present and non-negative.
 * - Checks if the payer, if present, has a valid address.
 * - Checks if the participants, if present, is an array and each participant has a valid address.
 * - Checks if the operations are present, is an array, and contains at least one operation.
 * - Checks each operation to ensure it has a type and payload, and validates the operation.
 */
export function validateIxRequest(type, ix) {
    if (ix.sender == null) {
        return createInvalidResult(ix, "sender", "Sender is required");
    }
    if (!isHex(ix.sender.id, 32)) {
        return createInvalidResult(ix.sender, "id", "Invalid sender address");
    }
    if (ix.fuel_price == null) {
        return createInvalidResult(ix, "fuel_price", "Fuel price is required");
    }
    if (type === "moi.Execute" && ix["fuel_limit"] == null) {
        return createInvalidResult(ix, "fuel_limit", "Fuel limit is required");
    }
    if (ix.fuel_price < 0) {
        return createInvalidResult(ix, "fuel_price", "Fuel price must be greater than or equal to 0");
    }
    if (type === "moi.Execute" && ix["fuel_limit"] < 0) {
        return createInvalidResult(ix, "fuel_limit", "Fuel limit must be greater than or equal to 0");
    }
    if (ix.payer != null && !isHex(ix.payer, 32)) {
        return createInvalidResult(ix, "payer", "Invalid payer address");
    }
    if (ix.participants != null) {
        if (!Array.isArray(ix.participants)) {
            return createInvalidResult(ix, "participants", "Participants must be an array");
        }
        let error = null;
        for (const participant of ix.participants) {
            if (error != null) {
                return error;
            }
            if (!isHex(participant.id, 32)) {
                error = createInvalidResult(participant, "id", "Invalid participant address");
                break;
            }
        }
    }
    if (ix.operations == null) {
        return createInvalidResult(ix, "operations", "Operations are required");
    }
    if (!Array.isArray(ix.operations)) {
        return createInvalidResult(ix, "operations", "Operations must be an array");
    }
    if (ix.operations.length === 0) {
        return createInvalidResult(ix, "operations", "Operations must have at least one operation");
    }
    let error = null;
    for (let i = 0; i < ix.operations.length; i++) {
        if (error != null) {
            break;
        }
        const operation = ix.operations[i];
        if (operation.type == null) {
            error = createInvalidResult(operation, "type", "Operation type is required");
            break;
        }
        if (operation.payload == null) {
            error = createInvalidResult(operation, "payload", "Operation payload is required");
            break;
        }
        const result = validateOperation(operation);
        if (result == null) {
            continue;
        }
        error = {
            field: `operations[${i}].${result.field}`,
            message: `Invalid operation payload at index ${i}: ${result.message}`,
            value: operation,
        };
    }
    if (error != null) {
        return error;
    }
    return null;
}
//# sourceMappingURL=interaction.js.map
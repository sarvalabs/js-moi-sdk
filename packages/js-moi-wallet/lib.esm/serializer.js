import { ErrorCode, ErrorUtils, IxType, hexToBytes, trimHexPrefix, ixObjectSchema, assetCreateSchema, assetMintOrBurnSchema, assetApproveOrTransferSchema, logicDeploySchema, logicInteractSchema, LockType } from "js-moi-utils";
import { ZERO_ADDRESS } from "js-moi-constants";
import { Polorizer } from "js-polo";
/**
 * Processes the payload based on the interaction type.
 *
 * @param {IxType} ixType - The interaction type.
 * @param {InteractionPayload} payload - The interaction payload.
 * @returns {InteractionPayload} - The processed interaction payload.
 * @throws {Error} - Throws an error if the interaction type is unsupported.
 */
const processPayload = (ixType, payload) => {
    switch (ixType) {
        case IxType.ASSET_CREATE:
            return { ...payload };
        case IxType.ASSET_MINT:
        case IxType.ASSET_BURN:
            payload = payload;
            return {
                ...payload,
                asset_id: trimHexPrefix(payload.asset_id)
            };
        case IxType.VALUE_TRANSFER:
            payload = payload;
            return {
                ...payload,
                // TODO: beneficiary address should be converted from string to uint8array
                asset_id: trimHexPrefix(payload.asset_id)
            };
        case IxType.LOGIC_DEPLOY:
            return payload;
        case IxType.LOGIC_INVOKE:
        case IxType.LOGIC_ENLIST:
            payload = payload;
            return {
                ...payload,
                logic_id: trimHexPrefix(payload.logic_id)
            };
        default:
            ErrorUtils.throwError("Failed to process payload, unexpected interaction type", ErrorCode.UNEXPECTED_ARGUMENT);
    }
};
const createParticipants = (steps) => {
    return steps.reduce((participants, step) => {
        let address = null;
        let lockType = null;
        switch (step.type) {
            case IxType.ASSET_CREATE:
                break;
            case IxType.ASSET_MINT:
            case IxType.ASSET_BURN:
                address = hexToBytes(step.payload.asset_id.slice(10));
                lockType = LockType.MUTATE_LOCK;
                break;
            case IxType.VALUE_TRANSFER:
                address = hexToBytes(step.payload.beneficiary);
                lockType = LockType.MUTATE_LOCK;
                break;
            case IxType.LOGIC_DEPLOY:
            case IxType.LOGIC_ENLIST:
            case IxType.LOGIC_INVOKE:
                address = hexToBytes(step.payload.logic_id.slice(10));
                lockType = LockType.MUTATE_LOCK;
                break;
            default:
                ErrorUtils.throwError("Unsupported Ix type", ErrorCode.INVALID_ARGUMENT);
        }
        if (address !== null && lockType !== null) {
            participants.push({ address, lock_type: lockType });
        }
        return participants;
    }, []);
};
/**
 * Processes the interaction object based on its type and returns the processed object.
 *
 * @param {InteractionObject} ixObject - The interaction object to be processed.
 * @returns {ProcessedIxObject} - The processed interaction object.
 * @throws {Error} - Throws an error if the interaction type is unsupported or if there is a missing payload.
 */
const processIxObject = (ixObject) => {
    try {
        const processedIxObject = {
            sender: hexToBytes(ixObject.sender),
            payer: hexToBytes(ZERO_ADDRESS),
            nonce: ixObject.nonce,
            fuel_price: ixObject.fuel_price,
            fuel_limit: ixObject.fuel_limit,
            asset_funds: ixObject.asset_funds,
            transactions: [],
            participants: [
                {
                    address: hexToBytes(ixObject.sender),
                    lock_type: 1,
                },
                ...createParticipants(ixObject.transactions)
            ],
        };
        processedIxObject.transactions = ixObject.transactions.map(step => {
            if (!step.payload) {
                ErrorUtils.throwError("Payload is missing!", ErrorCode.MISSING_ARGUMENT);
            }
            const payload = processPayload(step.type, step.payload);
            const polorizer = new Polorizer();
            switch (step.type) {
                case IxType.VALUE_TRANSFER:
                    polorizer.polorize(payload, assetApproveOrTransferSchema);
                    return { ...step, payload: polorizer.bytes() };
                case IxType.ASSET_CREATE:
                    polorizer.polorize(payload, assetCreateSchema);
                    return { ...step, payload: polorizer.bytes() };
                case IxType.ASSET_MINT:
                case IxType.ASSET_BURN:
                    polorizer.polorize(payload, assetMintOrBurnSchema);
                    return { ...step, payload: polorizer.bytes() };
                case IxType.LOGIC_DEPLOY:
                    polorizer.polorize(payload, logicDeploySchema);
                    return { ...step, payload: polorizer.bytes() };
                case IxType.LOGIC_INVOKE:
                case IxType.LOGIC_ENLIST:
                    polorizer.polorize(payload, logicInteractSchema);
                    return { ...step, payload: polorizer.bytes() };
                default:
                    ErrorUtils.throwError("Unsupported interaction type!", ErrorCode.UNSUPPORTED_OPERATION);
            }
        });
        return processedIxObject;
    }
    catch (err) {
        ErrorUtils.throwError("Failed to process interaction object", ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
/**
 * POLO encodes an interaction object into a Uint8Array representation.
 *
 * @param {InteractionObject} ixObject - The interaction object to be encoded.
 * @returns {Uint8Array} The encoded interaction object as a Uint8Array.
 * @throws {Error} if there is an error during encoding or if the payload is missing.
 */
export const serializeIxObject = (ixObject) => {
    try {
        const processedIxObject = processIxObject(ixObject);
        const polorizer = new Polorizer();
        polorizer.polorize(processedIxObject, ixObjectSchema);
        return polorizer.bytes();
    }
    catch (err) {
        ErrorUtils.throwError("Failed to serialize interaction object", ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
//# sourceMappingURL=serializer.js.map
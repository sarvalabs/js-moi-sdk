"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeIxObject = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_moi_constants_1 = require("js-moi-constants");
const js_polo_1 = require("js-polo");
/**
 * Processes the payload based on the interaction type.
 *
 * @param {TxType} ixType - The interaction type.
 * @param {InteractionPayload} payload - The interaction payload.
 * @returns {InteractionPayload} - The processed interaction payload.
 * @throws {Error} - Throws an error if the interaction type is unsupported.
 */
const processPayload = (ixType, payload) => {
    switch (ixType) {
        case js_moi_utils_1.TxType.ASSET_CREATE:
            return { ...payload };
        case js_moi_utils_1.TxType.ASSET_MINT:
        case js_moi_utils_1.TxType.ASSET_BURN:
            payload = payload;
            return {
                ...payload,
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(payload.asset_id)
            };
        case js_moi_utils_1.TxType.VALUE_TRANSFER:
            const pay = payload;
            return {
                ...pay,
                benefactor: (0, js_moi_utils_1.hexToBytes)(pay.benefactor ? pay.benefactor : js_moi_constants_1.ZERO_ADDRESS),
                beneficiary: (0, js_moi_utils_1.hexToBytes)(pay.beneficiary),
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(pay.asset_id)
            };
        case js_moi_utils_1.TxType.LOGIC_DEPLOY:
            return { ...payload };
        case js_moi_utils_1.TxType.LOGIC_INVOKE:
        case js_moi_utils_1.TxType.LOGIC_ENLIST:
            payload = payload;
            return {
                ...payload,
                logic_id: (0, js_moi_utils_1.trimHexPrefix)(payload.logic_id)
            };
        default:
            js_moi_utils_1.ErrorUtils.throwError("Failed to process payload, unexpected interaction type", js_moi_utils_1.ErrorCode.UNEXPECTED_ARGUMENT);
    }
};
const createParticipants = (steps) => {
    return steps.reduce((participants, step) => {
        let address = null;
        let lockType = null;
        switch (step.type) {
            case js_moi_utils_1.TxType.ASSET_CREATE:
                break;
            case js_moi_utils_1.TxType.ASSET_MINT:
            case js_moi_utils_1.TxType.ASSET_BURN:
                address = (0, js_moi_utils_1.hexToBytes)(step.payload.asset_id.slice(10));
                lockType = js_moi_utils_1.LockType.MUTATE_LOCK;
                break;
            case js_moi_utils_1.TxType.VALUE_TRANSFER:
                address = (0, js_moi_utils_1.hexToBytes)(step.payload.beneficiary);
                lockType = js_moi_utils_1.LockType.MUTATE_LOCK;
                break;
            case js_moi_utils_1.TxType.LOGIC_DEPLOY:
                break;
            case js_moi_utils_1.TxType.LOGIC_ENLIST:
            case js_moi_utils_1.TxType.LOGIC_INVOKE:
                address = (0, js_moi_utils_1.hexToBytes)(step.payload.logic_id.slice(6));
                lockType = js_moi_utils_1.LockType.MUTATE_LOCK;
                break;
            default:
                js_moi_utils_1.ErrorUtils.throwError("Unsupported Ix type", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
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
            sender: (0, js_moi_utils_1.hexToBytes)(ixObject.sender),
            payer: (0, js_moi_utils_1.hexToBytes)(js_moi_constants_1.ZERO_ADDRESS),
            nonce: ixObject.nonce,
            fuel_price: ixObject.fuel_price,
            fuel_limit: ixObject.fuel_limit,
            asset_funds: ixObject.asset_funds,
            transactions: [],
            participants: [
                {
                    address: (0, js_moi_utils_1.hexToBytes)(ixObject.sender),
                    lock_type: 1,
                },
                ...createParticipants(ixObject.transactions)
            ],
        };
        processedIxObject.transactions = ixObject.transactions.map(step => {
            if (!step.payload) {
                js_moi_utils_1.ErrorUtils.throwError("Payload is missing!", js_moi_utils_1.ErrorCode.MISSING_ARGUMENT);
            }
            const payload = processPayload(step.type, step.payload);
            const polorizer = new js_polo_1.Polorizer();
            switch (step.type) {
                case js_moi_utils_1.TxType.VALUE_TRANSFER:
                    polorizer.polorize(payload, js_moi_utils_1.assetApproveOrTransferSchema);
                    return { ...step, payload: polorizer.bytes() };
                case js_moi_utils_1.TxType.ASSET_CREATE:
                    polorizer.polorize(payload, js_moi_utils_1.assetCreateSchema);
                    return { ...step, payload: polorizer.bytes() };
                case js_moi_utils_1.TxType.ASSET_MINT:
                case js_moi_utils_1.TxType.ASSET_BURN:
                    polorizer.polorize(payload, js_moi_utils_1.assetMintOrBurnSchema);
                    return { ...step, payload: polorizer.bytes() };
                case js_moi_utils_1.TxType.LOGIC_DEPLOY:
                case js_moi_utils_1.TxType.LOGIC_INVOKE:
                case js_moi_utils_1.TxType.LOGIC_ENLIST:
                    polorizer.polorize(payload, js_moi_utils_1.logicSchema);
                    return { ...step, payload: polorizer.bytes() };
                default:
                    js_moi_utils_1.ErrorUtils.throwError("Unsupported interaction type!", js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
            }
        });
        return processedIxObject;
    }
    catch (err) {
        js_moi_utils_1.ErrorUtils.throwError("Failed to process interaction object", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
/**
 * POLO encodes an interaction object into a Uint8Array representation.
 *
 * @param {InteractionObject} ixObject - The interaction object to be encoded.
 * @returns {Uint8Array} The encoded interaction object as a Uint8Array.
 * @throws {Error} if there is an error during encoding or if the payload is missing.
 */
const serializeIxObject = (ixObject) => {
    try {
        const processedIxObject = processIxObject(ixObject);
        const polorizer = new js_polo_1.Polorizer();
        polorizer.polorize(processedIxObject, js_moi_utils_1.ixObjectSchema);
        return polorizer.bytes();
    }
    catch (err) {
        js_moi_utils_1.ErrorUtils.throwError("Failed to serialize interaction object", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
exports.serializeIxObject = serializeIxObject;
//# sourceMappingURL=serializer.js.map
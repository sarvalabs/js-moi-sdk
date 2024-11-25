"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeIxObject = void 0;
const js_moi_constants_1 = require("@zenz-solutions/js-moi-constants");
const js_moi_utils_1 = require("@zenz-solutions/js-moi-utils");
const js_polo_1 = require("js-polo");
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
        case js_moi_utils_1.IxType.ASSET_MINT:
        case js_moi_utils_1.IxType.ASSET_BURN:
            payload = payload;
            return {
                ...payload,
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(payload.asset_id)
            };
        case js_moi_utils_1.IxType.LOGIC_DEPLOY:
            return payload;
        case js_moi_utils_1.IxType.LOGIC_INVOKE:
        case js_moi_utils_1.IxType.LOGIC_ENLIST:
            payload = payload;
            return {
                ...payload,
                logic_id: (0, js_moi_utils_1.trimHexPrefix)(payload.logic_id)
            };
        default:
            js_moi_utils_1.ErrorUtils.throwError("Failed to process payload, unexpected interaction type", js_moi_utils_1.ErrorCode.UNEXPECTED_ARGUMENT);
    }
};
/**
 * Trims the "0x" prefix from the keys of a Map and returns a new Map.
 *
 * @param {Map<string, number | bigint>} values - The input Map with keys as hexadecimal strings.
 * @returns {Map<string, number | bigint>} - A new Map with trimmed keys.
 */
const processValues = (values) => {
    const entries = new Map();
    values.forEach((value, key) => entries.set((0, js_moi_utils_1.trimHexPrefix)(key), value));
    return entries;
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
            ...ixObject,
            sender: (0, js_moi_utils_1.hexToBytes)(ixObject.sender),
            receiver: (0, js_moi_utils_1.hexToBytes)(js_moi_constants_1.ZERO_ADDRESS),
            payer: (0, js_moi_utils_1.hexToBytes)(js_moi_constants_1.ZERO_ADDRESS)
        };
        switch (ixObject.type) {
            case js_moi_utils_1.IxType.VALUE_TRANSFER:
                if (!ixObject.transfer_values) {
                    js_moi_utils_1.ErrorUtils.throwError("Transfer values is missing!", js_moi_utils_1.ErrorCode.MISSING_ARGUMENT);
                }
                processedIxObject.receiver = (0, js_moi_utils_1.hexToBytes)(ixObject.receiver);
                processedIxObject.transfer_values = processValues(ixObject.transfer_values);
                break;
            case js_moi_utils_1.IxType.ASSET_CREATE:
                break;
            case js_moi_utils_1.IxType.ASSET_MINT:
            case js_moi_utils_1.IxType.ASSET_BURN:
            case js_moi_utils_1.IxType.LOGIC_DEPLOY:
            case js_moi_utils_1.IxType.LOGIC_INVOKE:
            case js_moi_utils_1.IxType.LOGIC_ENLIST:
                if (!ixObject.payload) {
                    js_moi_utils_1.ErrorUtils.throwError("Payload is missing!", js_moi_utils_1.ErrorCode.MISSING_ARGUMENT);
                }
                processedIxObject.payload = processPayload(ixObject.type, ixObject.payload);
                break;
            default:
                js_moi_utils_1.ErrorUtils.throwError("Unsupported interaction type!", js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
        }
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
        let polorizer = new js_polo_1.Polorizer();
        const processedIxObject = processIxObject(ixObject);
        switch (processedIxObject.type) {
            case js_moi_utils_1.IxType.VALUE_TRANSFER: {
                polorizer.polorize(processedIxObject, js_moi_utils_1.ixObjectSchema);
                return polorizer.bytes();
            }
            case js_moi_utils_1.IxType.ASSET_CREATE: {
                polorizer.polorize(processedIxObject.payload, js_moi_utils_1.assetCreateSchema);
                const payload = polorizer.bytes();
                polorizer = new js_polo_1.Polorizer();
                polorizer.polorize({ ...processedIxObject, payload }, js_moi_utils_1.ixObjectSchema);
                return polorizer.bytes();
            }
            case js_moi_utils_1.IxType.ASSET_MINT:
            case js_moi_utils_1.IxType.ASSET_BURN: {
                polorizer.polorize(processedIxObject.payload, js_moi_utils_1.assetMintOrBurnSchema);
                const payload = polorizer.bytes();
                polorizer = new js_polo_1.Polorizer();
                polorizer.polorize({ ...processedIxObject, payload }, js_moi_utils_1.ixObjectSchema);
                return polorizer.bytes();
            }
            case js_moi_utils_1.IxType.LOGIC_DEPLOY:
            case js_moi_utils_1.IxType.LOGIC_INVOKE:
            case js_moi_utils_1.IxType.LOGIC_ENLIST: {
                polorizer.polorize(processedIxObject.payload, js_moi_utils_1.logicSchema);
                const payload = polorizer.bytes();
                polorizer = new js_polo_1.Polorizer();
                polorizer.polorize({ ...processedIxObject, payload }, js_moi_utils_1.ixObjectSchema);
                return polorizer.bytes();
            }
            default:
                js_moi_utils_1.ErrorUtils.throwError("Unsupported interaction type!", js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
        }
    }
    catch (err) {
        js_moi_utils_1.ErrorUtils.throwError("Failed to serialize interaction object", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
exports.serializeIxObject = serializeIxObject;
//# sourceMappingURL=serializer.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeIxObject = void 0;
const moi_utils_1 = require("moi-utils");
const js_polo_1 = require("js-polo");
const ixObjectSchema = {
    kind: "struct",
    fields: {
        type: {
            kind: "integer"
        },
        nonce: {
            kind: "integer"
        },
        sender: {
            kind: "bytes"
        },
        receiver: {
            kind: "bytes"
        },
        payer: {
            kind: "bytes"
        },
        transfer_values: {
            kind: "map",
            fields: {
                keys: {
                    kind: "string"
                },
                values: {
                    kind: "integer"
                }
            }
        },
        perceived_values: {
            kind: "map",
            fields: {
                keys: {
                    kind: "string"
                },
                values: {
                    kind: "integer"
                }
            }
        },
        fuel_price: {
            kind: "integer"
        },
        fuel_limit: {
            kind: "integer"
        },
        payload: {
            kind: "bytes"
        }
    }
};
const logicSchema = {
    kind: "struct",
    fields: {
        logic_id: {
            kind: "string"
        },
        callsite: {
            kind: "string"
        },
        calldata: {
            kind: "bytes"
        },
        manifest: {
            kind: "bytes"
        }
    }
};
const assetCreateSchema = {
    kind: "struct",
    fields: {
        symbol: {
            kind: "string"
        },
        supply: {
            kind: "integer"
        },
        standard: {
            kind: "integer"
        },
        dimension: {
            kind: "integer"
        },
        is_stateful: {
            kind: "bool"
        },
        is_logical: {
            kind: "bool"
        },
        logic_payload: logicSchema
    }
};
const assetMintOrBurnSchema = {
    kind: "struct",
    fields: {
        asset_id: {
            kind: "string"
        },
        amount: {
            kind: "integer"
        }
    }
};
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000000000000000000000000000";
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
        case moi_utils_1.IxType.ASSET_MINT:
        case moi_utils_1.IxType.ASSET_BURN:
            payload = payload;
            return {
                ...payload,
                asset_id: (0, moi_utils_1.trimHexPrefix)(payload.asset_id)
            };
        case moi_utils_1.IxType.LOGIC_DEPLOY:
            return payload;
        case moi_utils_1.IxType.LOGIC_INVOKE:
            payload = payload;
            return {
                ...payload,
                logic_id: (0, moi_utils_1.trimHexPrefix)(payload.logic_id)
            };
        default:
            moi_utils_1.ErrorUtils.throwError("Failed to process payload, unexpected interaction type", moi_utils_1.ErrorCode.UNEXPECTED_ARGUMENT);
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
    values.forEach((value, key) => entries.set((0, moi_utils_1.trimHexPrefix)(key), value));
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
            sender: (0, moi_utils_1.hexToBytes)(ixObject.sender),
            receiver: (0, moi_utils_1.hexToBytes)(ZERO_ADDRESS),
            payer: (0, moi_utils_1.hexToBytes)(ZERO_ADDRESS)
        };
        switch (ixObject.type) {
            case moi_utils_1.IxType.VALUE_TRANSFER:
                if (!ixObject.transfer_values) {
                    moi_utils_1.ErrorUtils.throwError("Transfer values is missing!", moi_utils_1.ErrorCode.MISSING_ARGUMENT);
                }
                processedIxObject.receiver = (0, moi_utils_1.hexToBytes)(ixObject.receiver);
                processedIxObject.transfer_values = processValues(ixObject.transfer_values);
                break;
            case moi_utils_1.IxType.ASSET_CREATE:
                break;
            case moi_utils_1.IxType.ASSET_MINT:
            case moi_utils_1.IxType.ASSET_BURN:
            case moi_utils_1.IxType.LOGIC_DEPLOY:
            case moi_utils_1.IxType.LOGIC_INVOKE:
                if (!ixObject.payload) {
                    moi_utils_1.ErrorUtils.throwError("Payload is missing!", moi_utils_1.ErrorCode.MISSING_ARGUMENT);
                }
                processedIxObject.payload = processPayload(ixObject.type, ixObject.payload);
                break;
            default:
                moi_utils_1.ErrorUtils.throwError("Unsupported interaction type!", moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
        }
        return processedIxObject;
    }
    catch (err) {
        moi_utils_1.ErrorUtils.throwError("Failed to process interaction object", moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
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
            case moi_utils_1.IxType.VALUE_TRANSFER: {
                polorizer.polorize(processedIxObject, ixObjectSchema);
                return polorizer.bytes();
            }
            case moi_utils_1.IxType.ASSET_CREATE: {
                polorizer.polorize(processedIxObject.payload, assetCreateSchema);
                const payload = polorizer.bytes();
                polorizer = new js_polo_1.Polorizer();
                polorizer.polorize({ ...processedIxObject, payload }, ixObjectSchema);
                return polorizer.bytes();
            }
            case moi_utils_1.IxType.ASSET_MINT:
            case moi_utils_1.IxType.ASSET_BURN: {
                polorizer.polorize(processedIxObject.payload, assetMintOrBurnSchema);
                const payload = polorizer.bytes();
                polorizer = new js_polo_1.Polorizer();
                polorizer.polorize({ ...processedIxObject, payload }, ixObjectSchema);
                return polorizer.bytes();
            }
            case moi_utils_1.IxType.LOGIC_DEPLOY:
            case moi_utils_1.IxType.LOGIC_INVOKE: {
                polorizer.polorize(processedIxObject.payload, logicSchema);
                const payload = polorizer.bytes();
                polorizer = new js_polo_1.Polorizer();
                polorizer.polorize({ ...processedIxObject, payload }, ixObjectSchema);
                return polorizer.bytes();
            }
            default:
                moi_utils_1.ErrorUtils.throwError("Unsupported interaction type!", moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
        }
    }
    catch (err) {
        moi_utils_1.ErrorUtils.throwError("Failed to serialize interaction object", moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
exports.serializeIxObject = serializeIxObject;

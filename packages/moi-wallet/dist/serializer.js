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
            kind: "string"
        },
        manifest: {
            kind: "string"
        }
    }
};
const assetCreateSchema = {
    kind: "struct",
    fields: {
        type: {
            kind: "integer"
        },
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
 * serializeIxObject
 *
 * POLO encodes an interaction object into a Uint8Array representation.
 *
 * @param ixObject - The interaction object to be encoded.
 * @returns The encoded interaction object as a Uint8Array.
 * @throws Error if there is an error during encoding or if the payload is missing.
 */
const serializeIxObject = (ixObject) => {
    try {
        let polorizer = new js_polo_1.Polorizer();
        switch (ixObject.type) {
            case moi_utils_1.IxType.VALUE_TRANSFER: {
                if (!ixObject.transfer_values) {
                    moi_utils_1.ErrorUtils.throwError("Transfer values is missing!", moi_utils_1.ErrorCode.MISSING_ARGUMENT);
                }
                const ixData = {
                    ...ixObject,
                    sender: (0, moi_utils_1.hexToBytes)(ixObject.sender),
                    receiver: (0, moi_utils_1.hexToBytes)(ixObject.receiver),
                    payer: (0, moi_utils_1.hexToBytes)(ZERO_ADDRESS),
                };
                polorizer.polorize(ixData, ixObjectSchema);
                return polorizer.bytes();
            }
            case moi_utils_1.IxType.ASSET_CREATE: {
                if (!ixObject.payload) {
                    moi_utils_1.ErrorUtils.throwError("Payload is missing!", moi_utils_1.ErrorCode.MISSING_ARGUMENT);
                }
                polorizer.polorize(ixObject.payload, assetCreateSchema);
                const payload = polorizer.bytes();
                polorizer = new js_polo_1.Polorizer();
                const ixData = {
                    ...ixObject,
                    payload,
                    sender: (0, moi_utils_1.hexToBytes)(ixObject.sender),
                    receiver: (0, moi_utils_1.hexToBytes)(ZERO_ADDRESS),
                    payer: (0, moi_utils_1.hexToBytes)(ZERO_ADDRESS),
                };
                polorizer.polorize(ixData, ixObjectSchema);
                return polorizer.bytes();
            }
            case moi_utils_1.IxType.ASSET_BURN:
            case moi_utils_1.IxType.ASSET_MINT: {
                if (!ixObject.payload) {
                    moi_utils_1.ErrorUtils.throwError("Payload is missing!", moi_utils_1.ErrorCode.MISSING_ARGUMENT);
                }
                polorizer.polorize(ixObject.payload, assetMintOrBurnSchema);
                const payload = polorizer.bytes();
                polorizer = new js_polo_1.Polorizer();
                const ixData = {
                    ...ixObject,
                    payload,
                    sender: (0, moi_utils_1.hexToBytes)(ixObject.sender),
                    receiver: (0, moi_utils_1.hexToBytes)(ZERO_ADDRESS),
                    payer: (0, moi_utils_1.hexToBytes)(ZERO_ADDRESS),
                };
                polorizer.polorize(ixData, ixObjectSchema);
                return polorizer.bytes();
            }
            case moi_utils_1.IxType.LOGIC_DEPLOY:
            case moi_utils_1.IxType.LOGIC_INVOKE: {
                if (!ixObject.payload) {
                    moi_utils_1.ErrorUtils.throwError("Payload is missing!", moi_utils_1.ErrorCode.MISSING_ARGUMENT);
                }
                polorizer.polorize(ixObject.payload, logicSchema);
                const payload = polorizer.bytes();
                polorizer = new js_polo_1.Polorizer();
                const ixData = {
                    ...ixObject,
                    payload,
                    sender: (0, moi_utils_1.hexToBytes)(ixObject.sender),
                    receiver: (0, moi_utils_1.hexToBytes)(ZERO_ADDRESS),
                    payer: (0, moi_utils_1.hexToBytes)(ZERO_ADDRESS),
                };
                polorizer.polorize(ixData, ixObjectSchema);
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

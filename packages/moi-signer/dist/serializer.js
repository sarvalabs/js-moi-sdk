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
const serializeIxObject = (ixObject) => {
    try {
        let polorizer = new js_polo_1.Polorizer();
        switch (ixObject.type) {
            case moi_utils_1.IxType.ASSET_CREATE: {
                if (!ixObject.payload) {
                    throw new Error("payload is missing!");
                }
                polorizer.polorize(ixObject.payload, assetCreateSchema);
                const payload = polorizer.bytes();
                console.log(payload);
                polorizer = new js_polo_1.Polorizer();
                // Todo check why address is of type bytes instead of string
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
                    throw new Error("payload is missing!");
                }
                polorizer.polorize(ixObject.payload, assetMintOrBurnSchema);
                const payload = polorizer.bytes();
                polorizer = new js_polo_1.Polorizer();
                polorizer.polorize({ ...ixObject, payload }, ixObjectSchema);
                return polorizer.bytes();
            }
            case moi_utils_1.IxType.VALUE_TRANSFER: {
                if (!ixObject.transfer_values) {
                    throw new Error("transfer values is missing!");
                }
                polorizer.polorize(ixObject, ixObjectSchema);
                return polorizer.bytes();
            }
            default:
                throw new Error("unsupported interaction type!");
        }
    }
    catch (err) {
        throw new Error("failed to serialize interaction object", err);
    }
};
exports.serializeIxObject = serializeIxObject;

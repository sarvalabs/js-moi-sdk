import { ErrorCode, ErrorUtils, IxType, hexToBytes } from "moi-utils";
import { InteractionObject } from "moi-signer";
import { Polorizer } from "js-polo";

const ixObjectSchema =  {
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
}

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
}

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
}

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
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000000000000000000000000000"

/**
 * serializeIxObject
 *
 * POLO encodes an interaction object into a Uint8Array representation.
 *
 * @param ixObject - The interaction object to be encoded.
 * @returns The encoded interaction object as a Uint8Array.
 * @throws Error if there is an error during encoding or if the payload is missing.
 */
export const serializeIxObject = (ixObject: InteractionObject): Uint8Array => {
    try {
        let polorizer = new Polorizer();
        switch(ixObject.type) {
            case IxType.ASSET_CREATE: {
                if(!ixObject.payload) {
                    ErrorUtils.throwError(
                        "Payload is missing!",
                        ErrorCode.MISSING_ARGUMENT
                    )
                }
    
                polorizer.polorize(ixObject.payload, assetCreateSchema);
    
                const payload = polorizer.bytes();
    
                polorizer = new Polorizer();

                const ixData = {
                    ...ixObject, 
                    payload,
                    sender: hexToBytes(ixObject.sender),
                    receiver: hexToBytes(ZERO_ADDRESS),
                    payer: hexToBytes(ZERO_ADDRESS),
                }
    
                polorizer.polorize(ixData, ixObjectSchema);
    
                return polorizer.bytes();
            }
            case IxType.ASSET_BURN:
            case IxType.ASSET_MINT: {
                if(!ixObject.payload) {
                    ErrorUtils.throwError(
                        "Payload is missing!",
                        ErrorCode.MISSING_ARGUMENT
                    )
                }
    
                polorizer.polorize(ixObject.payload, assetMintOrBurnSchema);
    
                const payload = polorizer.bytes();
    
                polorizer = new Polorizer();

                const ixData = {
                    ...ixObject, 
                    payload,
                    sender: hexToBytes(ixObject.sender),
                    receiver: hexToBytes(ZERO_ADDRESS),
                    payer: hexToBytes(ZERO_ADDRESS),
                }
    
                polorizer.polorize(ixData, ixObjectSchema);
    
                return polorizer.bytes();
            }
            case IxType.VALUE_TRANSFER: {
                if(!ixObject.transfer_values) {
                    ErrorUtils.throwError(
                        "Transfer values is missing!",
                        ErrorCode.MISSING_ARGUMENT
                    )
                }

                const ixData = {
                    ...ixObject,
                    sender: hexToBytes(ixObject.sender),
                    receiver: hexToBytes(ixObject.receiver),
                    payer: hexToBytes(ZERO_ADDRESS),
                }

                polorizer.polorize(ixData, ixObjectSchema);

                return polorizer.bytes();
            }
            default:
                ErrorUtils.throwError(
                    "Unsupported interaction type!",
                    ErrorCode.UNSUPPORTED_OPERATION
                );
        }
    } catch(err) {
        ErrorUtils.throwError(
            "Failed to serialize interaction object",
            ErrorCode.UNKNOWN_ERROR,
            { originalError: err }
        )
    }
}

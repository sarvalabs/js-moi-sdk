import { ZERO_ADDRESS } from "@zenz-solutions/js-moi-constants";
import { AssetMintOrBurnPayload, InteractionObject, InteractionPayload, LogicPayload } from "@zenz-solutions/js-moi-providers";
import { ProcessedIxObject } from "@zenz-solutions/js-moi-signer";
import { ErrorCode, ErrorUtils, IxType, assetCreateSchema, assetMintOrBurnSchema, hexToBytes, ixObjectSchema, logicSchema, trimHexPrefix } from "@zenz-solutions/js-moi-utils";
import { Polorizer } from "js-polo";

/**
 * Processes the payload based on the interaction type.
 *
 * @param {IxType} ixType - The interaction type.
 * @param {InteractionPayload} payload - The interaction payload.
 * @returns {InteractionPayload} - The processed interaction payload.
 * @throws {Error} - Throws an error if the interaction type is unsupported.
 */
const processPayload = (ixType: IxType, payload: InteractionPayload): InteractionPayload => {
    switch(ixType) {
        case IxType.ASSET_MINT:
        case IxType.ASSET_BURN:
            payload = payload as AssetMintOrBurnPayload;
            return {
                ...payload,
                asset_id: trimHexPrefix(payload.asset_id)
            }
        case IxType.LOGIC_DEPLOY:
            return payload;
        case IxType.LOGIC_INVOKE:
        case IxType.LOGIC_ENLIST:
            payload = payload as LogicPayload;
            return {
                ...payload,
                logic_id: trimHexPrefix(payload.logic_id)
            }
        default:
            ErrorUtils.throwError(
                "Failed to process payload, unexpected interaction type", 
                ErrorCode.UNEXPECTED_ARGUMENT
            )
    }
}

/**
 * Trims the "0x" prefix from the keys of a Map and returns a new Map.
 *
 * @param {Map<string, number | bigint>} values - The input Map with keys as hexadecimal strings.
 * @returns {Map<string, number | bigint>} - A new Map with trimmed keys.
 */
const processValues = (values: Map<string, number | bigint>): Map<string, number | bigint> => {
    const entries = new Map();

    values.forEach((value, key) => entries.set(trimHexPrefix(key), value))

    return entries
};

/**
 * Processes the interaction object based on its type and returns the processed object.
 *
 * @param {InteractionObject} ixObject - The interaction object to be processed.
 * @returns {ProcessedIxObject} - The processed interaction object.
 * @throws {Error} - Throws an error if the interaction type is unsupported or if there is a missing payload.
 */
const processIxObject = (ixObject: InteractionObject): ProcessedIxObject => {
    try {
        const processedIxObject = { 
            ...ixObject,
            sender: hexToBytes(ixObject.sender),
            receiver: hexToBytes(ZERO_ADDRESS),
            payer: hexToBytes(ZERO_ADDRESS)
        };

        switch(ixObject.type) {
            case IxType.VALUE_TRANSFER:
                if(!ixObject.transfer_values) {
                    ErrorUtils.throwError(
                        "Transfer values is missing!",
                        ErrorCode.MISSING_ARGUMENT
                    )
                }

                processedIxObject.receiver = hexToBytes(ixObject.receiver);
                processedIxObject.transfer_values = processValues(ixObject.transfer_values);
                break;
            case IxType.ASSET_CREATE:
                break;
            case IxType.ASSET_MINT:
            case IxType.ASSET_BURN:
            case IxType.LOGIC_DEPLOY:
            case IxType.LOGIC_INVOKE:
            case IxType.LOGIC_ENLIST:
                if(!ixObject.payload) {
                    ErrorUtils.throwError(
                        "Payload is missing!",
                        ErrorCode.MISSING_ARGUMENT
                    )
                }

                processedIxObject.payload = processPayload(ixObject.type, ixObject.payload);
                break;
            default:
                ErrorUtils.throwError(
                    "Unsupported interaction type!", 
                    ErrorCode.UNSUPPORTED_OPERATION
                );
        }

        return processedIxObject as unknown as ProcessedIxObject;
    } catch(err) {
        ErrorUtils.throwError(
            "Failed to process interaction object",
            ErrorCode.UNKNOWN_ERROR,
            { originalError: err }
        )
    }
}

/**
 * POLO encodes an interaction object into a Uint8Array representation.
 *
 * @param {InteractionObject} ixObject - The interaction object to be encoded.
 * @returns {Uint8Array} The encoded interaction object as a Uint8Array.
 * @throws {Error} if there is an error during encoding or if the payload is missing.
 */
export const serializeIxObject = (ixObject: InteractionObject): Uint8Array => {
    try {
        let polorizer = new Polorizer();
        const processedIxObject = processIxObject(ixObject);

        switch(processedIxObject.type) {
            case IxType.VALUE_TRANSFER: {
                polorizer.polorize(processedIxObject, ixObjectSchema);
                return polorizer.bytes();
            }
            case IxType.ASSET_CREATE: {
                polorizer.polorize(processedIxObject.payload, assetCreateSchema);
                const payload = polorizer.bytes();
                polorizer = new Polorizer();
                polorizer.polorize({ ...processedIxObject, payload }, ixObjectSchema);
                return polorizer.bytes();
            }
            case IxType.ASSET_MINT:
            case IxType.ASSET_BURN: {
                polorizer.polorize(processedIxObject.payload, assetMintOrBurnSchema);
                const payload = polorizer.bytes();
                polorizer = new Polorizer();
                polorizer.polorize({ ...processedIxObject, payload }, ixObjectSchema);    
                return polorizer.bytes();
            }
            case IxType.LOGIC_DEPLOY:
            case IxType.LOGIC_INVOKE:
            case IxType.LOGIC_ENLIST: {    
                polorizer.polorize(processedIxObject.payload, logicSchema);
                const payload = polorizer.bytes();
                polorizer = new Polorizer();
                polorizer.polorize({ ...processedIxObject, payload }, ixObjectSchema);    
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

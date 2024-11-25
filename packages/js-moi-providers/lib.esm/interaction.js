import { ErrorCode, ErrorUtils, IxType, assetCreateSchema, assetMintOrBurnSchema, bytesToHex, logicSchema, toQuantity } from "@zenz-solutions/js-moi-utils";
import { Polorizer } from "js-polo";
const serializePayload = (ixType, payload) => {
    let polorizer = new Polorizer();
    switch (ixType) {
        case IxType.ASSET_CREATE:
            polorizer.polorize(payload, assetCreateSchema);
            return polorizer.bytes();
        case IxType.ASSET_MINT:
        case IxType.ASSET_BURN:
            polorizer.polorize(payload, assetMintOrBurnSchema);
            return polorizer.bytes();
        case IxType.LOGIC_DEPLOY:
        case IxType.LOGIC_INVOKE:
        case IxType.LOGIC_ENLIST:
            polorizer.polorize(payload, logicSchema);
            return polorizer.bytes();
        default:
            ErrorUtils.throwError("Failed to serialize payload", ErrorCode.UNKNOWN_ERROR);
    }
};
/**
 * Trims the "0x" prefix from the keys of a Map and returns a new Map.
 *
 * @param {Map<string, number | bigint>} values - The input Map with keys as hexadecimal strings.
 * @returns {Record<string, string>} - A object with keys as hexadecimal strings without the "0x" prefix.
 */
const processValues = (values) => {
    return Array.from(values).reduce((entries, [key, value]) => {
        entries[key] = toQuantity(value);
        return entries;
    }, {});
};
/**
 * Processes the interaction object based on its type and returns the processed object.
 *
 * @param {CallorEstimateIxObject} ixObject - The interaction object to be processed.
 * @returns {ProcessedIxObject} - The processed interaction object.
 * @throws {Error} - Throws an error if the interaction type is unsupported or if there is a missing payload.
 */
export const processIxObject = (ixObject) => {
    try {
        const processedIxObject = {
            type: ixObject.type,
            nonce: toQuantity(ixObject.nonce),
            sender: ixObject.sender,
            fuel_price: toQuantity(ixObject.fuel_price),
            fuel_limit: toQuantity(ixObject.fuel_limit),
        };
        if (ixObject.type === IxType.VALUE_TRANSFER) {
            processedIxObject.receiver = ixObject.receiver;
            processedIxObject.transfer_values = processValues(ixObject.transfer_values);
        }
        else {
            processedIxObject.payload = "0x" + bytesToHex(serializePayload(ixObject.type, ixObject.payload));
        }
        return processedIxObject;
    }
    catch (err) {
        ErrorUtils.throwError("Failed to process interaction object", ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
//# sourceMappingURL=interaction.js.map
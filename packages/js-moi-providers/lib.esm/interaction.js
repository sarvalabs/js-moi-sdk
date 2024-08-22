import { ErrorCode, ErrorUtils, TxType, assetActionSchema, assetCreateSchema, assetSupplySchema, bytesToHex, logicSchema, toQuantity } from "js-moi-utils";
import { Polorizer } from "js-polo";
const serializePayload = (txType, payload) => {
    let polorizer = new Polorizer();
    switch (txType) {
        case TxType.ASSET_TRANSFER:
            polorizer.polorize(payload, assetActionSchema);
            return polorizer.bytes();
        case TxType.ASSET_CREATE:
            polorizer.polorize(payload, assetCreateSchema);
            return polorizer.bytes();
        case TxType.ASSET_MINT:
        case TxType.ASSET_BURN:
            polorizer.polorize(payload, assetSupplySchema);
            return polorizer.bytes();
        case TxType.LOGIC_DEPLOY:
        case TxType.LOGIC_INVOKE:
        case TxType.LOGIC_ENLIST:
            polorizer.polorize(payload, logicSchema);
            return polorizer.bytes();
        default:
            ErrorUtils.throwError("Failed to serialize payload", ErrorCode.UNKNOWN_ERROR);
    }
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
        return {
            nonce: toQuantity(ixObject.nonce),
            sender: ixObject.sender,
            fuel_price: toQuantity(ixObject.fuel_price),
            fuel_limit: toQuantity(ixObject.fuel_limit),
            funds: [],
            transactions: ixObject.transactions.map(transaction => ({
                ...transaction,
                payload: "0x" + bytesToHex(serializePayload(transaction.type, transaction.payload)),
            })),
            participants: []
        };
    }
    catch (err) {
        ErrorUtils.throwError("Failed to process interaction object", ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
//# sourceMappingURL=interaction.js.map
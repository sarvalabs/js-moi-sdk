import { ErrorCode, ErrorUtils, IxType, assetCreateSchema, assetMintOrBurnSchema, bytesToHex, logicDeploySchema, logicInteractSchema, toQuantity } from "js-moi-utils";
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
            polorizer.polorize(payload, logicDeploySchema);
            return polorizer.bytes();
        case IxType.LOGIC_INVOKE:
        case IxType.LOGIC_ENLIST:
            polorizer.polorize(payload, logicInteractSchema);
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
        const processedIxObject = {
            nonce: toQuantity(ixObject.nonce),
            sender: ixObject.sender,
            fuel_price: toQuantity(ixObject.fuel_price),
            fuel_limit: toQuantity(ixObject.fuel_limit),
            asset_funds: ixObject.asset_funds,
            steps: [],
            participants: ixObject.participants,
        };
        processedIxObject.steps = ixObject.steps.map(step => ({ ...step, payload: "0x" + bytesToHex(serializePayload(step.type, step.payload)) }));
        return processedIxObject;
    }
    catch (err) {
        ErrorUtils.throwError("Failed to process interaction object", ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
//# sourceMappingURL=interaction.js.map
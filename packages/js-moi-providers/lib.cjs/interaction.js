"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processIxObject = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_polo_1 = require("js-polo");
const serializePayload = (ixType, payload) => {
    let polorizer = new js_polo_1.Polorizer();
    switch (ixType) {
        case js_moi_utils_1.IxType.ASSET_CREATE:
            polorizer.polorize(payload, js_moi_utils_1.assetCreateSchema);
            return polorizer.bytes();
        case js_moi_utils_1.IxType.ASSET_MINT:
        case js_moi_utils_1.IxType.ASSET_BURN:
            polorizer.polorize(payload, js_moi_utils_1.assetMintOrBurnSchema);
            return polorizer.bytes();
        case js_moi_utils_1.IxType.LOGIC_DEPLOY:
            polorizer.polorize(payload, js_moi_utils_1.logicDeploySchema);
            return polorizer.bytes();
        case js_moi_utils_1.IxType.LOGIC_INVOKE:
        case js_moi_utils_1.IxType.LOGIC_ENLIST:
            polorizer.polorize(payload, js_moi_utils_1.logicInteractSchema);
            return polorizer.bytes();
        default:
            js_moi_utils_1.ErrorUtils.throwError("Failed to serialize payload", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR);
    }
};
/**
 * Processes the interaction object based on its type and returns the processed object.
 *
 * @param {CallorEstimateIxObject} ixObject - The interaction object to be processed.
 * @returns {ProcessedIxObject} - The processed interaction object.
 * @throws {Error} - Throws an error if the interaction type is unsupported or if there is a missing payload.
 */
const processIxObject = (ixObject) => {
    try {
        const processedIxObject = {
            nonce: (0, js_moi_utils_1.toQuantity)(ixObject.nonce),
            sender: ixObject.sender,
            fuel_price: (0, js_moi_utils_1.toQuantity)(ixObject.fuel_price),
            fuel_limit: (0, js_moi_utils_1.toQuantity)(ixObject.fuel_limit),
            asset_funds: ixObject.asset_funds,
            steps: [],
            participants: ixObject.participants,
        };
        processedIxObject.steps = ixObject.steps.map(step => ({ ...step, payload: "0x" + (0, js_moi_utils_1.bytesToHex)(serializePayload(step.type, step.payload)) }));
        return processedIxObject;
    }
    catch (err) {
        js_moi_utils_1.ErrorUtils.throwError("Failed to process interaction object", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
exports.processIxObject = processIxObject;
//# sourceMappingURL=interaction.js.map
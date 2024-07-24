"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeIxObject = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_moi_constants_1 = require("js-moi-constants");
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
        case js_moi_utils_1.IxType.ASSET_CREATE:
            return { ...payload };
        case js_moi_utils_1.IxType.ASSET_MINT:
        case js_moi_utils_1.IxType.ASSET_BURN:
            payload = payload;
            return {
                ...payload,
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(payload.asset_id)
            };
        case js_moi_utils_1.IxType.VALUE_TRANSFER:
            payload = payload;
            return {
                ...payload,
                // TODO: beneficiary address should be converted from string to uint8array
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
 * Processes the interaction object based on its type and returns the processed object.
 *
 * @param {InteractionObject} ixObject - The interaction object to be processed.
 * @returns {ProcessedIxObject} - The processed interaction object.
 * @throws {Error} - Throws an error if the interaction type is unsupported or if there is a missing payload.
 */
const processIxObject = (ixObject) => {
    try {
        const processedIxObject = {
            sender: (0, js_moi_utils_1.hexToBytes)(ixObject.sender),
            payer: (0, js_moi_utils_1.hexToBytes)(js_moi_constants_1.ZERO_ADDRESS),
            nonce: ixObject.nonce,
            fuel_price: ixObject.fuel_price,
            fuel_limit: ixObject.fuel_limit,
            asset_funds: ixObject.asset_funds,
            steps: [],
            participants: ixObject.participants?.map(paticipant => ({ ...paticipant, address: (0, js_moi_utils_1.hexToBytes)(paticipant.address) })),
        };
        processedIxObject.steps = ixObject.steps.map(step => {
            if (!step.payload) {
                js_moi_utils_1.ErrorUtils.throwError("Payload is missing!", js_moi_utils_1.ErrorCode.MISSING_ARGUMENT);
            }
            const payload = processPayload(step.type, step.payload);
            const polorizer = new js_polo_1.Polorizer();
            switch (step.type) {
                case js_moi_utils_1.IxType.VALUE_TRANSFER:
                    polorizer.polorize(payload, js_moi_utils_1.assetApproveOrTransferSchema);
                    return { ...step, payload: polorizer.bytes() };
                case js_moi_utils_1.IxType.ASSET_CREATE:
                    polorizer.polorize(payload, js_moi_utils_1.assetCreateSchema);
                    return { ...step, payload: polorizer.bytes() };
                case js_moi_utils_1.IxType.ASSET_MINT:
                case js_moi_utils_1.IxType.ASSET_BURN:
                    polorizer.polorize(payload, js_moi_utils_1.assetMintOrBurnSchema);
                    return { ...step, payload: polorizer.bytes() };
                case js_moi_utils_1.IxType.LOGIC_DEPLOY:
                    polorizer.polorize(payload, js_moi_utils_1.logicDeploySchema);
                    return { ...step, payload: polorizer.bytes() };
                case js_moi_utils_1.IxType.LOGIC_INVOKE:
                case js_moi_utils_1.IxType.LOGIC_ENLIST:
                    polorizer.polorize(payload, js_moi_utils_1.logicInteractSchema);
                    return { ...step, payload: polorizer.bytes() };
                default:
                    js_moi_utils_1.ErrorUtils.throwError("Unsupported interaction type!", js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
            }
        });
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
        const processedIxObject = processIxObject(ixObject);
        const polorizer = new js_polo_1.Polorizer();
        polorizer.polorize(processedIxObject, js_moi_utils_1.ixObjectSchema);
        return polorizer.bytes();
    }
    catch (err) {
        js_moi_utils_1.ErrorUtils.throwError("Failed to serialize interaction object", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
exports.serializeIxObject = serializeIxObject;
//# sourceMappingURL=serializer.js.map
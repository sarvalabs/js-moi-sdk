"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeIxSignatures = exports.serializeIxObject = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_moi_providers_1 = require("js-moi-providers");
const js_polo_1 = require("js-polo");
/**
 * POLO encodes an interaction object into a Uint8Array representation.
 *
 * @param {InteractionObject} ixObject - The interaction object to be encoded.
 * @returns {Uint8Array} The encoded interaction object as a Uint8Array.
 * @throws {Error} if there is an error during encoding or if the payload is missing.
 */
const serializeIxObject = (ixObject) => {
    try {
        const processedIxObject = (0, js_moi_providers_1.toRawInteractionObject)(ixObject);
        const polorizer = new js_polo_1.Polorizer();
        polorizer.polorize(processedIxObject, js_moi_utils_1.ixObjectSchema);
        return polorizer.bytes();
    }
    catch (err) {
        js_moi_utils_1.ErrorUtils.throwError("Failed to serialize interaction object", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
exports.serializeIxObject = serializeIxObject;
const serializeIxSignatures = (signatures) => {
    try {
        const processedIxSigns = (0, js_moi_providers_1.toRawSignatures)(signatures);
        const polorizer = new js_polo_1.Polorizer();
        polorizer.polorize(processedIxSigns, js_moi_utils_1.ixSignaturesSchema);
        return polorizer.bytes();
    }
    catch (err) {
        js_moi_utils_1.ErrorUtils.throwError("Failed to serialize signatures", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
exports.serializeIxSignatures = serializeIxSignatures;
//# sourceMappingURL=serializer.js.map
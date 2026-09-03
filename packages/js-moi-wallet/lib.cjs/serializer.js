"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSignature = exports.serializeIxSignatures = exports.serializeIxObject = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_moi_providers_1 = require("js-moi-providers");
const js_polo_1 = require("js-polo");
const rawSignaturesToSignatures = (rawSignatures) => rawSignatures.map((entry) => ({
    id: (0, js_moi_utils_1.bytesToHex)(entry.id),
    key_id: entry.key_id,
    signature: (0, js_moi_utils_1.bytesToHex)(entry.signature),
}));
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
        js_moi_utils_1.ErrorUtils.throwError(`Failed to serialize interaction object: ${err instanceof Error ? err.message : err}`, js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
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
/**
 * Appends a new signature entry to an existing signed interaction request.
 *
 * @param {InteractionRequest} ixRequest - The interaction request with existing signatures.
 * @param {Hex} newSig - POLO-encoded signature bytes from `signAsPayer` or another signer.
 * @returns {InteractionRequest} A new interaction request with the merged signatures blob.
 */
const addSignature = (ixRequest, newSig) => {
    try {
        const existingRaw = new js_polo_1.Depolorizer((0, js_moi_utils_1.hexToBytes)(ixRequest.signatures)).depolorize(js_moi_utils_1.ixSignaturesSchema);
        const newRaw = new js_polo_1.Depolorizer((0, js_moi_utils_1.hexToBytes)(newSig)).depolorize(js_moi_utils_1.ixSignaturesSchema);
        const merged = [
            ...rawSignaturesToSignatures(existingRaw),
            ...rawSignaturesToSignatures(newRaw),
        ];
        const rawSign = (0, exports.serializeIxSignatures)(merged);
        return {
            ix_args: ixRequest.ix_args,
            signatures: (0, js_moi_utils_1.bytesToHex)(rawSign),
        };
    }
    catch (err) {
        js_moi_utils_1.ErrorUtils.throwError(`Failed to add signature: ${err instanceof Error ? err.message : err}`, js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
exports.addSignature = addSignature;
//# sourceMappingURL=serializer.js.map
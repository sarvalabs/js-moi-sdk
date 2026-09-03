import { ErrorCode, ErrorUtils, bytesToHex, hexToBytes, ixObjectSchema, ixSignaturesSchema } from "js-moi-utils";
import { toRawInteractionObject, toRawSignatures } from "js-moi-providers";
import { Depolorizer, Polorizer } from "js-polo";
const rawSignaturesToSignatures = (rawSignatures) => rawSignatures.map((entry) => ({
    id: bytesToHex(entry.id),
    key_id: entry.key_id,
    signature: bytesToHex(entry.signature),
}));
/**
 * POLO encodes an interaction object into a Uint8Array representation.
 *
 * @param {InteractionObject} ixObject - The interaction object to be encoded.
 * @returns {Uint8Array} The encoded interaction object as a Uint8Array.
 * @throws {Error} if there is an error during encoding or if the payload is missing.
 */
export const serializeIxObject = (ixObject) => {
    try {
        const processedIxObject = toRawInteractionObject(ixObject);
        const polorizer = new Polorizer();
        polorizer.polorize(processedIxObject, ixObjectSchema);
        return polorizer.bytes();
    }
    catch (err) {
        ErrorUtils.throwError(`Failed to serialize interaction object: ${err instanceof Error ? err.message : err}`, ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
export const serializeIxSignatures = (signatures) => {
    try {
        const processedIxSigns = toRawSignatures(signatures);
        const polorizer = new Polorizer();
        polorizer.polorize(processedIxSigns, ixSignaturesSchema);
        return polorizer.bytes();
    }
    catch (err) {
        ErrorUtils.throwError("Failed to serialize signatures", ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
/**
 * Appends a new signature entry to an existing signed interaction request.
 *
 * @param {InteractionRequest} ixRequest - The interaction request with existing signatures.
 * @param {Hex} newSig - POLO-encoded signature bytes from `signAsPayer` or another signer.
 * @returns {InteractionRequest} A new interaction request with the merged signatures blob.
 */
export const addSignature = (ixRequest, newSig) => {
    try {
        const existingRaw = new Depolorizer(hexToBytes(ixRequest.signatures)).depolorize(ixSignaturesSchema);
        const newRaw = new Depolorizer(hexToBytes(newSig)).depolorize(ixSignaturesSchema);
        const merged = [
            ...rawSignaturesToSignatures(existingRaw),
            ...rawSignaturesToSignatures(newRaw),
        ];
        const rawSign = serializeIxSignatures(merged);
        return {
            ix_args: ixRequest.ix_args,
            signatures: bytesToHex(rawSign),
        };
    }
    catch (err) {
        ErrorUtils.throwError(`Failed to add signature: ${err instanceof Error ? err.message : err}`, ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
//# sourceMappingURL=serializer.js.map
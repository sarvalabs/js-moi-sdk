import { ErrorCode, ErrorUtils, ixObjectSchema, ixSignaturesSchema} from "js-moi-utils";
import { InteractionObject, Signature, toRawInteractionObject, toRawSignatures } from "js-moi-providers";
import { Polorizer } from "js-polo";

/**
 * POLO encodes an interaction object into a Uint8Array representation.
 *
 * @param {InteractionObject} ixObject - The interaction object to be encoded.
 * @returns {Uint8Array} The encoded interaction object as a Uint8Array.
 * @throws {Error} if there is an error during encoding or if the payload is missing.
 */
export const serializeIxObject = (ixObject: InteractionObject): Uint8Array => {
    try {
        const processedIxObject = toRawInteractionObject(ixObject);

        const polorizer = new Polorizer();
        polorizer.polorize(processedIxObject, ixObjectSchema);

        return polorizer.bytes();
    } catch(err) {
        ErrorUtils.throwError(
            "Failed to serialize interaction object",
            ErrorCode.UNKNOWN_ERROR,
            { originalError: err }
        )
    }
}

export const serializeIxSignatures = (signatures: Signature[]): Uint8Array => {
    try {
        const processedIxSigns = toRawSignatures(signatures)

        const polorizer = new Polorizer()
        polorizer.polorize(processedIxSigns, ixSignaturesSchema)

        return polorizer.bytes()
    } catch(err) {
        ErrorUtils.throwError(
            "Failed to serialize signatures",
            ErrorCode.UNKNOWN_ERROR,
            { originalError: err }
        ) 
    }
}

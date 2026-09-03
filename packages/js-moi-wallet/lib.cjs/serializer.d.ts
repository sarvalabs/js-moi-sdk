import { Hex } from "js-moi-utils";
import { InteractionObject, InteractionRequest, Signature } from "js-moi-providers";
/**
 * POLO encodes an interaction object into a Uint8Array representation.
 *
 * @param {InteractionObject} ixObject - The interaction object to be encoded.
 * @returns {Uint8Array} The encoded interaction object as a Uint8Array.
 * @throws {Error} if there is an error during encoding or if the payload is missing.
 */
export declare const serializeIxObject: (ixObject: InteractionObject) => Uint8Array;
export declare const serializeIxSignatures: (signatures: Signature[]) => Uint8Array;
/**
 * Appends a new signature entry to an existing signed interaction request.
 *
 * @param {InteractionRequest} ixRequest - The interaction request with existing signatures.
 * @param {Hex} newSig - POLO-encoded signature bytes from `signAsPayer` or another signer.
 * @returns {InteractionRequest} A new interaction request with the merged signatures blob.
 */
export declare const addSignature: (ixRequest: InteractionRequest, newSig: Hex) => InteractionRequest;
//# sourceMappingURL=serializer.d.ts.map
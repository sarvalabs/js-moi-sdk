import { InteractionObject } from "moi-signer";
/**
 * serializeIxObject
 *
 * POLO encodes an interaction object into a Uint8Array representation.
 *
 * @param ixObject - The interaction object to be encoded.
 * @returns The encoded interaction object as a Uint8Array.
 * @throws Error if there is an error during encoding or if the payload is missing.
 */
export declare const serializeIxObject: (ixObject: InteractionObject) => Uint8Array;

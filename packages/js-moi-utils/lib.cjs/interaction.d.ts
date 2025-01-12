import { type Schema } from "js-polo";
import type { InteractionRequest, RawInteractionRequest } from "./types/interaction";
/**
 * Generates and returns the POLO schema for an interaction request.
 *
 * @returns The POLO schema for an interaction request.
 */
export declare const getInteractionRequestSchema: () => Schema;
/**
 * Transforms an interaction request to a format that can be serialized to POLO.
 *
 * @param ix Interaction request
 * @returns a raw interaction request
 */
export declare const transformInteraction: (ix: InteractionRequest) => RawInteractionRequest;
/**
 * Encodes an interaction request into a POLO bytes.
 *
 * This function takes an interaction request, which can be either an `InteractionRequest`
 * or a `RawInteractionRequest`, and encodes it into a POLO bytes.
 *
 * If the request contains raw interaction, it will be transformed into an raw interaction request
 * that can be serialized to POLO.
 *
 * @param ix - The interaction request to encode. It can be of type `InteractionRequest` or `RawInteractionRequest`.
 * @returns A POLO bytes representing the encoded interaction request.
 */
export declare function encodeInteraction(ix: InteractionRequest | RawInteractionRequest): Uint8Array;
/**
 * Creates a POLO bytes from an interaction request.
 *
 * It smartly gathers the participants and funds from the interaction request and then encodes the interaction request.
 *
 * @param ix - The interaction request to encode.
 * @returns A POLO bytes representing the encoded interaction request.
 */
export declare const interaction: (ix: InteractionRequest) => Uint8Array;
//# sourceMappingURL=interaction.d.ts.map
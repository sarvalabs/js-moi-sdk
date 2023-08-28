import { CallorEstimateIxObject } from "../types/jsonrpc";
import { ProcessedIxObject } from "../types/interaction";
/**
 * Processes the interaction object based on its type and returns the processed object.
 *
 * @param {CallorEstimateIxObject} ixObject - The interaction object to be processed.
 * @returns {ProcessedIxObject} - The processed interaction object.
 * @throws {Error} - Throws an error if the interaction type is unsupported or if there is a missing payload.
 */
export declare const processIxObject: (ixObject: CallorEstimateIxObject) => ProcessedIxObject;

import { ErrorCode, ErrorUtils } from "js-moi-utils";
/**
 * Represents ephemeral state functionality for a logic element.
 * Does not support retrieval of ephemeral state elements.
 */
export class EphemeralState {
    constructor() { }
    /**
     * Throws an error as ephemeral state operations are temporarily not supported.
     *
     * @param {string} label - The label of the state field.
     * @throws {Error} Always throws an error indicating ephemeral state operations
     are temporarily not supported.
     */
    async get(label) {
        ErrorUtils.throwError("Ephemeral state operations are temporarily not supported.", ErrorCode.UNSUPPORTED_OPERATION);
    }
}
//# sourceMappingURL=ephemeral-state.js.map
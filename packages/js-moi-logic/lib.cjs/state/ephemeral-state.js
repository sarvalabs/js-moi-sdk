"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EphemeralState = void 0;
const js_moi_utils_1 = require("js-moi-utils");
/**
 * Represents ephemeral state functionality for a logic element.
 * Does not support retrieval of ephemeral state elements.
 */
class EphemeralState {
    constructor() { }
    /**
     * Throws an error as ephemeral state operations are temporarily not supported.
     *
     * @param {string} label - The label of the state field.
     * @throws {Error} Always throws an error indicating ephemeral state operations
     are temporarily not supported.
     */
    async get(label) {
        js_moi_utils_1.ErrorUtils.throwError("Ephemeral state operations are temporarily not supported.", js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
    }
}
exports.EphemeralState = EphemeralState;
//# sourceMappingURL=ephemeral-state.js.map
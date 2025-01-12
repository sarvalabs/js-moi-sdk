"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextStateMatrix = exports.ContextStateKind = void 0;
const js_moi_utils_1 = require("js-moi-utils");
var ContextStateKind;
(function (ContextStateKind) {
    ContextStateKind[ContextStateKind["PersistentState"] = 0] = "PersistentState";
    ContextStateKind[ContextStateKind["EphemeralState"] = 1] = "EphemeralState";
})(ContextStateKind || (exports.ContextStateKind = ContextStateKind = {}));
/**
 * Represents a matrix of context states defined in the logic manifest.
 * The matrix stores the mapping between context state kinds (persistent and
 ephemeral) and their element pointers.
 */
class ContextStateMatrix {
    matrix;
    constructor(elements) {
        this.matrix = new Map(elements.filter((elm) => elm.kind === js_moi_utils_1.ElementType.State).map((element) => [element.data.mode, element.ptr]));
    }
    /**
     * Checks if the matrix contains the pointer for persistent state.
     *
     * @returns {boolean} A boolean indicating if persistent state is present.
     */
    persistent() {
        return this.matrix.has(js_moi_utils_1.LogicState.Persistent);
    }
    /**
     * Checks if the matrix contains the pointer for ephemeral state.
     *
     * @returns {boolean} A boolean indicating if ephemeral state is present.
     */
    ephemeral() {
        return this.matrix.has(js_moi_utils_1.LogicState.Ephemeral);
    }
    /**
     * Retrieves the element pointer for the specified context state kind.
     *
     * @param key - The context state kind.
     * @returns {number | undefined} The element pointer if found, otherwise undefined.
     */
    get(key) {
        return this.matrix.get(key);
    }
}
exports.ContextStateMatrix = ContextStateMatrix;
//# sourceMappingURL=context-state-matrix.js.map
import { ElementType, LogicState } from "js-moi-utils";
export var ContextStateKind;
(function (ContextStateKind) {
    ContextStateKind[ContextStateKind["PersistentState"] = 0] = "PersistentState";
    ContextStateKind[ContextStateKind["EphemeralState"] = 1] = "EphemeralState";
})(ContextStateKind || (ContextStateKind = {}));
/**
 * Represents a matrix of context states defined in the logic manifest.
 * The matrix stores the mapping between context state kinds (persistent and
 ephemeral) and their element pointers.
 */
export class ContextStateMatrix {
    matrix;
    constructor(elements) {
        this.matrix = new Map(elements.filter((elm) => elm.kind === ElementType.State).map((element) => [element.data.mode, element.ptr]));
    }
    /**
     * Checks if the matrix contains the pointer for persistent state.
     *
     * @returns {boolean} A boolean indicating if persistent state is present.
     */
    persistent() {
        return this.matrix.has(LogicState.Persistent);
    }
    /**
     * Checks if the matrix contains the pointer for ephemeral state.
     *
     * @returns {boolean} A boolean indicating if ephemeral state is present.
     */
    ephemeral() {
        return this.matrix.has(LogicState.Ephemeral);
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
//# sourceMappingURL=context-state-matrix.js.map
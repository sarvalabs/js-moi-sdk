"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextStateMatrix = exports.ContextStateKind = void 0;
var ContextStateKind;
(function (ContextStateKind) {
    ContextStateKind[ContextStateKind["LogicState"] = 0] = "LogicState";
    ContextStateKind[ContextStateKind["ActorState"] = 1] = "ActorState";
})(ContextStateKind || (exports.ContextStateKind = ContextStateKind = {}));
/**
 * Represents a matrix of context states defined in the logic manifest.
 * The matrix stores the mapping between context state kinds - logic state
 * (`state logic:`, shared/global to the logic itself - what this SDK used to
 * call "persistent" state) and actor state (`state actor:`, scoped per
 * calling participant - what this SDK used to call "ephemeral" state) - and
 * their element pointers.
 */
class ContextStateMatrix {
    matrix;
    constructor(elements) {
        this.matrix = new Map();
        const stateElements = elements.filter((element) => element.kind === "state");
        for (let i = 0; i < stateElements.length; i++) {
            const stateElement = stateElements[i];
            stateElement.data = stateElement.data;
            switch (stateElement.data.mode) {
                case "logic":
                    this.matrix.set(ContextStateKind.LogicState, stateElement.ptr);
                    break;
                case "actor":
                    this.matrix.set(ContextStateKind.ActorState, stateElement.ptr);
                    break;
                default:
                    break;
            }
        }
    }
    /**
     * Checks if the matrix contains the pointer for logic state.
     *
     * @returns {boolean} A boolean indicating if logic state is present.
     */
    logic() {
        return this.matrix.has(ContextStateKind.LogicState);
    }
    /**
     * Checks if the matrix contains the pointer for actor state.
     *
     * @returns {boolean} A boolean indicating if actor state is present.
     */
    actor() {
        return this.matrix.has(ContextStateKind.ActorState);
    }
    /**
     * Retrieves the element pointer for the specified context state kind.
     *
     * @param {ContextStateKind} key - The context state kind.
     * @returns {number | undefined} The element pointer if found, otherwise undefined.
     */
    get(key) {
        return this.matrix.get(key);
    }
}
exports.ContextStateMatrix = ContextStateMatrix;
//# sourceMappingURL=context-state-matrix.js.map
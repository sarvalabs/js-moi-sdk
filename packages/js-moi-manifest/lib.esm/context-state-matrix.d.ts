import { LogicState, type LogicElement } from "js-moi-utils";
/**
 * Represents a matrix of context states defined in the logic manifest.
 * The matrix stores the mapping between context state kinds (persistent and
 ephemeral) and their element pointers.
 */
export declare class ContextStateMatrix {
    private matrix;
    constructor(elements: LogicElement[]);
    /**
     * Checks if the matrix contains the pointer for persistent state.
     *
     * @returns {boolean} A boolean indicating if persistent state is present.
     */
    persistent(): boolean;
    /**
     * Checks if the matrix contains the pointer for ephemeral state.
     *
     * @returns {boolean} A boolean indicating if ephemeral state is present.
     */
    ephemeral(): boolean;
    /**
     * Retrieves the element pointer for the specified context state kind.
     *
     * @param key - The context state kind.
     * @returns {number | undefined} The element pointer if found, otherwise undefined.
     */
    get(key: LogicState): number | undefined;
}
//# sourceMappingURL=context-state-matrix.d.ts.map
import type { LogicManifest } from "../types/manifest";
export declare enum ContextStateKind {
    LogicState = 0,
    ActorState = 1
}
/**
 * Represents a matrix of context states defined in the logic manifest.
 * The matrix stores the mapping between context state kinds - logic state
 * (`state logic:`, shared/global to the logic itself - what this SDK used to
 * call "persistent" state) and actor state (`state actor:`, scoped per
 * calling participant - what this SDK used to call "ephemeral" state) - and
 * their element pointers.
 */
export declare class ContextStateMatrix {
    private matrix;
    constructor(elements: LogicManifest.Element[]);
    /**
     * Checks if the matrix contains the pointer for logic state.
     *
     * @returns {boolean} A boolean indicating if logic state is present.
     */
    logic(): boolean;
    /**
     * Checks if the matrix contains the pointer for actor state.
     *
     * @returns {boolean} A boolean indicating if actor state is present.
     */
    actor(): boolean;
    /**
     * Retrieves the element pointer for the specified context state kind.
     *
     * @param {ContextStateKind} key - The context state kind.
     * @returns {number | undefined} The element pointer if found, otherwise undefined.
     */
    get(key: ContextStateKind): number | undefined;
}
//# sourceMappingURL=context-state-matrix.d.ts.map
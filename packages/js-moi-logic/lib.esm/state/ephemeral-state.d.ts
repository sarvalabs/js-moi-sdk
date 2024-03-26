/**
 * Represents ephemeral state functionality for a logic element.
 * Does not support retrieval of ephemeral state elements.
 */
export declare class EphemeralState {
    constructor();
    /**
     * Throws an error as ephemeral state operations are temporarily not supported.
     *
     * @param {string} label - The label of the state field.
     * @throws {Error} Always throws an error indicating ephemeral state operations
     are temporarily not supported.
     */
    get(label: string): Promise<void>;
}
//# sourceMappingURL=ephemeral-state.d.ts.map
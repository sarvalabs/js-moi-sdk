import { LogicManifest } from "js-moi-manifest";
import { AbstractProvider } from "js-moi-providers";
import { ManifestCoder } from "js-moi-manifest";
export declare enum ContextStateKind {
    PersistentState = 0,
    EphemeralState = 1
}
/**
 * Represents a matrix of context states defined in the logic manifest.
 * The matrix stores the mapping between context state kinds (persistent and
 ephemeral) and their element pointers.
 */
export declare class ContextStateMatrix {
    private matrix;
    constructor(elements: LogicManifest.Element[]);
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
     * @param {ContextStateKind} key - The context state kind.
     * @returns {number | undefined} The element pointer if found, otherwise undefined.
     */
    get(key: ContextStateKind): number | undefined;
}
/**
 * Represents persistent state functionality for a logic element.
 * Manages slots, types, and retrieval of persistent state values.
 */
export declare class PersistentState {
    private slots;
    private types;
    private logicId;
    private provider;
    private manifestCoder;
    private element;
    constructor(logicId: string, element: LogicManifest.Element, manifestCoder: ManifestCoder, provider: AbstractProvider);
    /**
     * Generates a hash of the slot using the Blake2b algorithm.
     *
     * @param {number} slot - The slot number to hash.
     * @returns {string} The hash of the slot as a string.
     */
    private slotHash;
    /**
     * Retrieves the value of a persistent state field.
     *
     * @param {string} label - The label of the state field.
     * @returns {Promise<any>} A Promise that resolves to the value of the
     * state field.
     * @throws {Error} If there is an error retrieving or decoding the state value.
     */
    get(label: string): Promise<any>;
}
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
//# sourceMappingURL=state.d.ts.map
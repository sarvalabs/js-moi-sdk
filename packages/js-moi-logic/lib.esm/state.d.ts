import { LogicManifest, ManifestCoder } from "js-moi-manifest";
import { AbstractProvider } from "js-moi-providers";
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
import { LogicManifest } from "moi-utils";
import { AbstractProvider } from "moi-providers";
import { ManifestCoder } from "moi-manifest";
export declare enum ContextStateKind {
    PersistentState = 0,
    EphemeralState = 1
}
/**
 * ContextStateMatrix
 *
 * Represents a matrix of context states defined in the logic manifest.
 * The matrix stores the mapping between context state kinds (persistent and
 ephemeral) and their element pointers.
 */
export declare class ContextStateMatrix {
    private matrix;
    constructor(elements: LogicManifest.Element[]);
    /**
     * persistent
     *
     * Checks if the matrix contains the pointer for persistent state.
     *
     * @returns A boolean indicating if persistent state is present.
     */
    persistent(): boolean;
    /**
     * ephemeral
     *
     * Checks if the matrix contains the pointer for ephemeral state.
     *
     * @returns A boolean indicating if ephemeral state is present.
     */
    ephemeral(): boolean;
    /**
     * get
     *
     * Retrieves the element pointer for the specified context state kind.
     *
     * @param key - The context state kind.
     * @returns The element pointer if found, otherwise undefined.
     */
    get(key: ContextStateKind): number | undefined;
}
/**
 * PersistentState
 *
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
     * slotHash
     *
     * Generates a hash of the slot using the Blake2b algorithm.
     *
     * @param slot - The slot number to hash.
     * @returns The hash of the slot as a string.
     */
    private slotHash;
    /**
     * get
     *
     * Retrieves the value of a persistent state field.
     *
     * @param label - The label of the state field.
     * @returns A Promise that resolves to the value of the state field.
     * @throws If there is an error retrieving or decoding the state value.
     */
    get(label: string): Promise<any>;
}
/**
 * EphemeralState
 *
 * Represents ephemeral state functionality for a logic element.
 * Does not support retrieval of ephemeral state elements.
 */
export declare class EphemeralState {
    constructor();
    /**
     * get
     *
     * Throws an error as ephemeral state operations are temporarily not supported.
     *
     * @param label - The label of the state field.
     * @throws Always throws an error indicating ephemeral state operations
     are temporarily not supported.
     */
    get(label: string): Promise<void>;
}

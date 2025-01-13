import type { StorageKey } from "js-moi-utils";

/**
 * Represents an accessor that provides access to a slot hash.
 */
export interface Accessor {
    /**
     * Retrieves the slot hash associated with the given hash.
     *
     * @param hash - The hash of the slot.
     * @returns The slot hash associated with the given hash.
     */
    access(hash: StorageKey): StorageKey;
}

/**
 * Represents an accessor provider that provides accessors.
 */
export interface AccessorProvider {
    /**
     * Retrieves the accessors.
     * @returns An array of accessors.
     */
    getAccessors(): Accessor[];
}

/**
 * Represents a interface that provides the type of the value present at slot hash.
 */
export interface StorageTypeProvider {
    /**
     * Gets the type of the slot hash.
     * @returns The type of the slot hash as a string.
     */
    getStorageType(): string;
}

export type AccessorAndStorageProvider = AccessorProvider & StorageTypeProvider;

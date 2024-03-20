import BN from "bn.js";
export type SlotHash = BN;
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
    access(hash: SlotHash): SlotHash;
}
/**
 * AbstractAccessor class provides a base implementation of the Accessor interface.
 */
export declare abstract class AbstractAccessor implements Accessor {
    /**
     * Calculates the sum256 hash of a Uint8Array using the blake2b algorithm.
     * @param hash - The input Uint8Array to be hashed.
     * @returns The calculated sum256 hash as a Uint8Array.
     */
    sum256(hash: Uint8Array): Uint8Array;
    /**
     * Abstract method that needs to be implemented by subclasses.
     * It defines the logic for accessing a SlotHash.
     * @param hash - The SlotHash to be accessed.
     * @returns The accessed SlotHash.
     */
    abstract access(hash: SlotHash): SlotHash;
}
/**
 * Represents a LengthAccessor class that extends the AbstractAccessor class.
 *
 * It generates slot hash for accessing the length of an Array/VArray or a Map.
 */
export declare class LengthAccessor extends AbstractAccessor {
    access(hash: SlotHash): SlotHash;
}
/**
 * Generates a slot hash for accessing the key of Map.
 */
export declare class PropertyAccessor extends AbstractAccessor {
    private label;
    /**
     * Creates a new instance of PropertyAccessor.
     * @param label The label of the property.
     */
    constructor(label: string);
    /**
     * Polorizes the given label and returns it as a Uint8Array.
     * @param label The label to polorize.
     * @returns The polorized label as a Uint8Array.
     */
    polorizeKey(label: string): Uint8Array;
    /**
     * Accesses the property with the given hash and returns the resulting hash.
     * @param hash The hash of the property.
     * @returns The resulting hash after accessing the property.
     */
    access(hash: SlotHash): SlotHash;
}
/**
 * Represents an accessor for accessing elements in an array by index.
 */
export declare class ArrayIndexAccessor extends AbstractAccessor {
    private index;
    /**
     * Creates a new instance of ArrayIndexAccessor.
     * @param index The index of the element to access.
     */
    constructor(index: number);
    /**
     * Generates a slot hash for accessing the element at the given index.
     * @param hash The input hash.
     * @returns The updated hash after accessing the element.
     */
    access(hash: SlotHash): SlotHash;
}
/**
 * Represents an accessor for accessing fields in a class by index.
 */
export declare class ClassFieldAccessor extends AbstractAccessor {
    private index;
    constructor(index: number);
    access(hash: SlotHash): SlotHash;
}
//# sourceMappingURL=accessor.d.ts.map
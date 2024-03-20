import { blake2b } from "@noble/hashes/blake2b";
import BN from "bn.js";

import { Polorizer } from "js-polo";


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
export abstract class AbstractAccessor implements Accessor {
    /**
     * Calculates the sum256 hash of a Uint8Array using the blake2b algorithm.
     * @param hash - The input Uint8Array to be hashed.
     * @returns The calculated sum256 hash as a Uint8Array.
     */
    sum256(hash: Uint8Array): Uint8Array {
        return blake2b(hash, { dkLen: 32 });
    }

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
export class LengthAccessor extends AbstractAccessor {
    access(hash: SlotHash): SlotHash {
        return hash;
    }
}

/**
 * Generates a slot hash for accessing the key of Map.
 */
export class PropertyAccessor extends AbstractAccessor {
    /**
     * Creates a new instance of PropertyAccessor.
     * @param label The label of the property.
     */
    constructor(private label: string) {
        super();
    }

    /**
     * Polorizes the given label and returns it as a Uint8Array.
     * @param label The label to polorize.
     * @returns The polorized label as a Uint8Array.
     */
    polorizeKey(label: string): Uint8Array {
        const polorizer = new Polorizer();
        polorizer.polorizeString(label)
        return polorizer.bytes();
    }

    /**
     * Accesses the property with the given hash and returns the resulting hash.
     * @param hash The hash of the property.
     * @returns The resulting hash after accessing the property.
     */
    access(hash: SlotHash): SlotHash {
        const key = this.polorizeKey(this.label);
        const separator = Buffer.from(".");

        const buffer = Buffer.concat([hash.toBuffer('le', 32), separator, key]);

        return new BN(this.sum256(buffer));
    }
}

/**
 * Represents an accessor for accessing elements in an array by index.
 */
export class ArrayIndexAccessor extends AbstractAccessor {
    /**
     * Creates a new instance of ArrayIndexAccessor.
     * @param index The index of the element to access.
     */
    constructor(private index: number) {
        super();
    }

    /**
     * Generates a slot hash for accessing the element at the given index.
     * @param hash The input hash.
     * @returns The updated hash after accessing the element.
     */
    access(hash: SlotHash): SlotHash {
        const bytes = this.sum256(hash.toBuffer('be', 32));
        return new BN(bytes).add(new BN(this.index));
    }
}

/**
 * Represents an accessor for accessing fields in a class by index.
 */
export class ClassFieldAccessor extends AbstractAccessor {
    constructor(private index: number) {
        super();
    }

    access(hash: SlotHash): SlotHash {
        this.index;

        // console.log("Base Hash", hash.toBuffer('be', 32));


        const bytes = this.sum256(hash.toBuffer('be', 32));

        // console.log("Blake Js", bytes);
        const bn = new BN(bytes).add(new BN(0));


        // console.log(bn);
        return bn
    }
}
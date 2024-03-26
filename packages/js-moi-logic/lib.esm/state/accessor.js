import { blake2b } from "@noble/hashes/blake2b";
import BN from "bn.js";
import { encodeToString } from "js-moi-utils";
import { Polorizer } from "js-polo";
export class StorageKey {
    value;
    constructor(value) {
        this.value = new BN(value);
    }
    hex() {
        return encodeToString(this.toBuffer());
    }
    toBuffer() {
        return this.value.toBuffer("be", 32);
    }
}
/**
 * AbstractAccessor class provides a base implementation of the Accessor interface.
 */
export class AbstractAccessor {
    /**
     * Calculates the sum256 hash of a Uint8Array using the blake2b algorithm.
     * @param hash - The input Uint8Array to be hashed.
     * @returns The calculated sum256 hash as a Uint8Array.
     */
    sum256(hash) {
        return blake2b(hash, { dkLen: 32 });
    }
}
/**
 * Represents a LengthAccessor class that extends the AbstractAccessor class.
 *
 * It generates slot hash for accessing the length of an Array/VArray or a Map.
 */
export class LengthAccessor extends AbstractAccessor {
    access(hash) {
        return hash;
    }
}
/**
 * Generates a slot hash for accessing the key of Map.
 */
export class PropertyAccessor extends AbstractAccessor {
    key;
    /**
     * Creates a new instance of PropertyAccessor.
     * @param key The label of the property.
     */
    constructor(key) {
        super();
        this.key = key;
    }
    /**
     * Polorizes the given key.
     * @param key The key to polorize.
     * @returns The polorized key as a bytes.
     */
    polorizeKey(key) {
        const polorizer = new Polorizer();
        polorizer.polorizeString(key);
        return polorizer.bytes();
    }
    /**
     * Accesses the property with the given hash and returns the resulting hash.
     * @param hash The hash of the property.
     * @returns The resulting hash after accessing the property.
     */
    access(hash) {
        const key = this.polorizeKey(this.key);
        const separator = Buffer.from(".");
        const buffer = Buffer.concat([hash.toBuffer(), separator, key]);
        return new StorageKey(this.sum256(buffer));
    }
}
/**
 * Represents an accessor for accessing elements in an array by index.
 */
export class ArrayIndexAccessor extends AbstractAccessor {
    index;
    /**
     * Creates a new instance of ArrayIndexAccessor.
     * @param index The index of the element to access.
     */
    constructor(index) {
        super();
        this.index = index;
    }
    /**
     * Generates a slot hash for accessing the element at the given index.
     * @param hash The input hash.
     * @returns The updated hash after accessing the element.
     */
    access(hash) {
        const bytes = this.sum256(hash.toBuffer());
        const slot = new BN(bytes).add(new BN(this.index));
        return new StorageKey(slot);
    }
}
/**
 * Represents an accessor for accessing fields of a class.
 */
export class ClassFieldAccessor extends AbstractAccessor {
    index;
    constructor(index) {
        super();
        this.index = index;
    }
    access(hash) {
        const polorizer = new Polorizer();
        polorizer.polorizeString("a");
        const bytes = this.sum256(hash.toBuffer());
        return new StorageKey(new BN(bytes).add(new BN(this.index)));
    }
}
export function generateStorageKey(base, ...args) {
    let slot = typeof base === "number" ? new StorageKey(base) : base;
    const accessors = Array.isArray(args[0]) ? args[0] : args;
    for (const accessor of accessors) {
        slot = accessor.access(slot);
    }
    return slot;
}
//# sourceMappingURL=accessor.js.map
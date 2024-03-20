"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassFieldAccessor = exports.ArrayIndexAccessor = exports.PropertyAccessor = exports.LengthAccessor = exports.AbstractAccessor = void 0;
const blake2b_1 = require("@noble/hashes/blake2b");
const bn_js_1 = __importDefault(require("bn.js"));
const js_polo_1 = require("js-polo");
/**
 * AbstractAccessor class provides a base implementation of the Accessor interface.
 */
class AbstractAccessor {
    /**
     * Calculates the sum256 hash of a Uint8Array using the blake2b algorithm.
     * @param hash - The input Uint8Array to be hashed.
     * @returns The calculated sum256 hash as a Uint8Array.
     */
    sum256(hash) {
        return (0, blake2b_1.blake2b)(hash, { dkLen: 32 });
    }
}
exports.AbstractAccessor = AbstractAccessor;
/**
 * Represents a LengthAccessor class that extends the AbstractAccessor class.
 *
 * It generates slot hash for accessing the length of an Array/VArray or a Map.
 */
class LengthAccessor extends AbstractAccessor {
    access(hash) {
        return hash;
    }
}
exports.LengthAccessor = LengthAccessor;
/**
 * Generates a slot hash for accessing the key of Map.
 */
class PropertyAccessor extends AbstractAccessor {
    label;
    /**
     * Creates a new instance of PropertyAccessor.
     * @param label The label of the property.
     */
    constructor(label) {
        super();
        this.label = label;
    }
    /**
     * Polorizes the given label and returns it as a Uint8Array.
     * @param label The label to polorize.
     * @returns The polorized label as a Uint8Array.
     */
    polorizeKey(label) {
        const polorizer = new js_polo_1.Polorizer();
        polorizer.polorizeString(label);
        return polorizer.bytes();
    }
    /**
     * Accesses the property with the given hash and returns the resulting hash.
     * @param hash The hash of the property.
     * @returns The resulting hash after accessing the property.
     */
    access(hash) {
        const key = this.polorizeKey(this.label);
        const separator = Buffer.from(".");
        const buffer = Buffer.concat([hash.toBuffer('le', 32), separator, key]);
        return new bn_js_1.default(this.sum256(buffer));
    }
}
exports.PropertyAccessor = PropertyAccessor;
/**
 * Represents an accessor for accessing elements in an array by index.
 */
class ArrayIndexAccessor extends AbstractAccessor {
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
        const bytes = this.sum256(hash.toBuffer('be', 32));
        return new bn_js_1.default(bytes).add(new bn_js_1.default(this.index));
    }
}
exports.ArrayIndexAccessor = ArrayIndexAccessor;
/**
 * Represents an accessor for accessing fields in a class by index.
 */
class ClassFieldAccessor extends AbstractAccessor {
    index;
    constructor(index) {
        super();
        this.index = index;
    }
    access(hash) {
        this.index;
        // console.log("Base Hash", hash.toBuffer('be', 32));
        const bytes = this.sum256(hash.toBuffer('be', 32));
        // console.log("Blake Js", bytes);
        const bn = new bn_js_1.default(bytes).add(new bn_js_1.default(0));
        // console.log(bn);
        return bn;
    }
}
exports.ClassFieldAccessor = ClassFieldAccessor;
//# sourceMappingURL=accessor.js.map
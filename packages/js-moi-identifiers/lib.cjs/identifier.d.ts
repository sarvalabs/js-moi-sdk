import { type Hex } from "js-moi-utils";
import { type Flag } from "./flags";
import { IdentifierTag } from "./identifier-tag";
export declare class Identifier {
    private readonly bytes;
    constructor(value: Uint8Array);
    /**
     * Retrieves the tag associated with the identifier.
     *
     * @returns {IdentifierTag} The tag of the identifier, created from the first byte of the identifier's byte array.
     */
    getTag(): IdentifierTag;
    /**
     * Retrieves the flags from the identifier.
     *
     * @returns {number} The flags as a number.
     */
    getFlags(): number;
    /**
     * Retrieves metadata from the identifier.
     *
     * @returns {Uint8Array} A Uint8Array containing the metadata extracted from the identifier.
     */
    getMetadata(): Uint8Array;
    /**
     * Generates a fingerprint from the identifier bytes.
     *
     * The fingerprint is a subset of the identifier's byte array,
     * starting from the 5th byte (index 4) up to the 28th byte (index 27).
     *
     * @returns {Uint8Array} A new Uint8Array containing the fingerprint bytes.
     */
    getFingerPrint(): Uint8Array;
    private getVariantBytes;
    /**
     * Retrieves the variant from the identifier bytes.
     *
     * This method extracts a slice of the `bytes` array starting from the 28th byte
     * and interprets it as an unsigned 32-bit integer in big-endian order.
     *
     * @returns {number} The variant as an unsigned 32-bit integer.
     */
    getVariant(): number;
    /**
     * Checks if the identifier is a variant.
     *
     * This method retrieves the variant bytes of the identifier and checks if all bytes are zero.
     *
     * @returns {boolean} `true` if all variant bytes are zero, otherwise `false`.
     */
    isVariant(): boolean;
    deriveVariant(variant: number, set: Flag[], unset: Flag[]): Identifier;
    /**
     * Checks if the current identifier is nil (empty or uninitialized).
     *
     * @returns {boolean} `true` if the identifier is nil, otherwise `false`.
     */
    isNill(): boolean;
    /**
     * Converts the current instance's bytes to a Uint8Array.
     *
     * @returns {Uint8Array} The byte array representation of the instance.
     */
    toBytes(): Uint8Array;
    /**
     * Converts the identifier bytes to a hexadecimal string.
     *
     * @returns {Hex} The hexadecimal representation of the identifier bytes.
     */
    toHex(): Hex;
    /**
     * Create an `Identifier` from a hex string.
     *
     * @param value The hex string to create the `Identifier` from.
     * @returns The `Identifier` created from the hex string.
     */
    static fromHex(value: Hex): Identifier;
}
//# sourceMappingURL=identifier.d.ts.map
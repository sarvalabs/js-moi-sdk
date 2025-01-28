import { bytesToHex, ErrorUtils, hexToBytes, type Hex } from "js-moi-utils";
import { getFlag, type Flag } from "./flags";
import { IdentifierTag } from "./identifier-tag";
import type { Identifier } from "./types/identifier";

export abstract class BaseIdentifier implements Identifier {
    private readonly value: Uint8Array;

    constructor(value: Uint8Array | Hex) {
        value = value instanceof Uint8Array ? value : hexToBytes(value);

        if (value.length !== 32) {
            ErrorUtils.throwArgumentError("Invalid identifier length. Expected 32 bytes.", "value", value);
        }

        this.value = value;
    }

    /**
     * Generates a fingerprint for the identifier.
     *
     * The fingerprint is a subset of the byte representation of the identifier,
     * starting from the 5th byte (index 4) and ending at the 28th byte (index 27).
     *
     * @returns {Uint8Array} The fingerprint as a Uint8Array.
     */
    public getFingerprint(): Uint8Array {
        return this.toBytes().slice(4, 28);
    }

    /**
     * Retrieves the tag associated with the current identifier.
     *
     * @returns {IdentifierTag} The tag of the identifier.
     */
    public getTag(): IdentifierTag {
        return BaseIdentifier.getTag(this.value);
    }

    /**
     * Retrieves the variant number from the identifier's value.
     *
     * The variant is extracted from a specific slice of the identifier's value,
     * starting at byte 28 and interpreted as a 32-bit unsigned integer in big-endian order.
     *
     * @returns {number} The variant number.
     */
    public getVariant(): number {
        const blob = new Uint8Array(this.value.slice(28));
        return new DataView(blob.buffer).getUint32(0, false);
    }

    /**
     * Checks if the current identifier has the specified flag.
     *
     * @param flag - The flag to check against the identifier.
     * @returns `true` if the identifier has the specified flag, otherwise `false`.
     */
    public hasFlag(flag: Flag): boolean {
        return flag.supports(this.getTag()) || getFlag(this.value[1], flag.index);
    }

    /**
     * Converts the current value to a byte array.
     *
     * @returns {Uint8Array} A new Uint8Array containing the bytes of the current value.
     */
    public toBytes(): Uint8Array {
        return this.value.slice();
    }

    /**
     * Converts the identifier value to a hexadecimal string.
     *
     * @returns {Hex} The hexadecimal representation of the identifier value.
     */
    public toHex(): Hex {
        return bytesToHex(this.value);
    }

    public toString(): string {
        return this.toHex();
    }

    public toJSON(): string {
        return this.toString();
    }

    /**
     * Retrieves the tag from the given identifier value.
     *
     * @param value - The identifier value as a Uint8Array. Must be 32 bytes in length.
     * @returns An instance of IdentifierTag representing the tag of the identifier.
     * @throws {Error} If the length of the identifier value is not 32 bytes.
     */
    protected static getTag(value: Uint8Array): IdentifierTag {
        if (value.length !== 32) {
            ErrorUtils.throwArgumentError("Invalid identifier length. Expected 32 bytes.", "value", value);
        }

        return new IdentifierTag(value[0]);
    }
}

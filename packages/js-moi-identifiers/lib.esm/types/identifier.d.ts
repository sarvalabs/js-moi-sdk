import { type Hex } from "js-moi-utils";
import { type Flag } from "../flags";
import type { IdentifierTag } from "../identifier-tag";
export interface InvalidReason {
    why: string;
}
export interface Identifier {
    /**
     * Converts the identifier to a byte array.
     *
     * @returns The identifier as a byte array.
     */
    toBytes(): Uint8Array;
    /**
     * Converts the identifier to a hex string.
     *
     * @returns The identifier as a hex string.
     */
    toHex(): Hex;
    /**
     * Retrieves the fingerprint of the identifier.
     *
     * @returns The fingerprint as a Uint8Array.
     */
    getFingerprint(): Uint8Array;
    /**
     * Retrieves the tag associated with the current identifier.
     *
     * @returns The tag of the identifier.
     */
    getTag(): IdentifierTag;
    /**
     * Retrieves the variant number from the identifier's value.
     *
     * @returns The variant number.
     */
    getVariant(): number;
    /**
     * Checks if the current identifier has the specified flag.
     *
     * @returns `true` if the identifier has the specified flag, otherwise `false`.
     */
    hasFlag(flag: Flag): boolean;
    /**
     * Converts the identifier value to a hexadecimal string.
     *
     * @returns The hexadecimal representation of the identifier value.
     */
    toString(): string;
    /**
     * Converts the identifier to a JSON string.
     *
     * @returns The identifier as a JSON string.
     */
    toJSON(): string;
}
//# sourceMappingURL=identifier.d.ts.map
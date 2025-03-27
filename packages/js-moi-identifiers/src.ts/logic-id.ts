import { IdentifierKind } from "./enums";
import { flagMasks } from "./flags";
import { Identifier, type InvalidReason } from "./identifier";
import { hexToBytes, type Hex } from "./utils";

/**
 * Represents a logic identifier which extends the base `Identifier` class.
 */
export class LogicId extends Identifier {
    constructor(value: Uint8Array | Hex | LogicId) {
        super(value);

        const error = LogicId.validate(this.toBytes());

        if (error) {
            throw new Error(`Invalid logic identifier. ${error.why}`);
        }
    }

    /**
     * Validates a given identifier value.
     *
     * @param value - The identifier value to validate. It can be either a Uint8Array or a Hex string.
     * @returns An object containing the reason for invalidity if the identifier is invalid, or null if the identifier is valid.
     */
    public static validate(value: Uint8Array | Hex): InvalidReason | null {
        if (!(value instanceof Uint8Array || typeof value === "string")) {
            return { why: "Invalid type of value, expected bytes or hex string." };
        }

        const logic = value instanceof Uint8Array ? value : hexToBytes(value);
        const tag = this.getTag(logic);
        const kind = tag.getKind();

        if (kind !== IdentifierKind.Logic) {
            return { why: "Invalid identifier kind. Expected a logic identifier." };
        }

        const hasUnsupportedFlags = (logic[1] & (flagMasks.get(tag.value) ?? 0)) !== 0;

        if (hasUnsupportedFlags) {
            return { why: "Invalid Flags. Unsupported flags for identifier" };
        }

        return null;
    }

    /**
     * Checks if the provided value is valid.
     *
     * @param value - The value to be validated, which can be a Uint8Array or a Hex string.
     * @returns A boolean indicating whether the value is valid (true) or not (false).
     */
    public static isValid(value: Uint8Array | Hex): boolean {
        try {
            return this.validate(value) === null;
        } catch (error) {
            return false;
        }
    }
}

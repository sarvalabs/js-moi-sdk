import { BaseIdentifier } from "./base-identifier";
import { IdentifierKind } from "./enums";
import { flagMasks } from "./flags";
import type { Identifier, InvalidReason } from "./types/identifier";
import { hexToBytes, type Hex } from "./utils";

export class LogicId extends BaseIdentifier {
    constructor(value: Uint8Array | Hex) {
        super(value);

        const error = LogicId.validate(this.toBytes());

        if (error) {
            throw new Error(`Invalid logic identifier. ${error.why}`);
        }
    }

    public static validate(value: Uint8Array | Hex): InvalidReason | null {
        const asset = value instanceof Uint8Array ? value : hexToBytes(value);
        const tag = this.getTag(asset);
        const kind = tag.getKind();

        if (kind !== IdentifierKind.Logic) {
            return { why: "Invalid identifier kind. Expected a logic identifier." };
        }

        const hasUnsupportedFlags = (asset[1] & (flagMasks.get(tag.value) ?? 0)) !== 0;

        if (hasUnsupportedFlags) {
            return { why: "Invalid Flags. Unsupported flags for identifier" };
        }

        return null;
    }
}

/**
 * Generates a new LogicId identifier from the given value.
 *
 * @param value - The value to be used for generating the LogicId. It can be either a Uint8Array or a Hex string.
 * @returns An Identifier instance created from the provided value.
 */
export const logicId = (value: Uint8Array | Hex): Identifier => {
    return new LogicId(value);
};

/**
 * Checks if the given identifier is an instance of LogicId.
 *
 * @param value - The identifier to check.
 * @returns True if the identifier is an instance of LogicId, otherwise false.
 */
export const isLogicId = (value: Identifier): value is LogicId => {
    return value instanceof LogicId;
};

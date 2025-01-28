import { BaseIdentifier } from "./base-identifier";
import { IdentifierKind } from "./enums";
import { flagMasks } from "./flags";
import { hexToBytes } from "./utils";
export class LogicId extends BaseIdentifier {
    constructor(value) {
        super(value);
        const error = LogicId.validate(this.toBytes());
        if (error) {
            throw new Error(`Invalid logic identifier. ${error.why}`);
        }
    }
    static validate(value) {
        const logic = value instanceof Uint8Array ? value : hexToBytes(value);
        if (logic.length !== 32) {
            return { why: "Invalid length. Expected a 32-byte identifier." };
        }
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
    static isValid(value) {
        return this.validate(value) === null;
    }
}
/**
 * Generates a new LogicId identifier from the given value.
 *
 * @param value - The value to be used for generating the LogicId. It can be either a Uint8Array or a Hex string.
 * @returns An Identifier instance created from the provided value.
 */
export const logicId = (value) => {
    return new LogicId(value);
};
/**
 * Checks if the given identifier is an instance of LogicId.
 *
 * @param value - The identifier to check.
 * @returns True if the identifier is an instance of LogicId, otherwise false.
 */
export const isLogicId = (value) => {
    return value instanceof LogicId;
};
//# sourceMappingURL=logic-id.js.map
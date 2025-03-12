import { IdentifierKind } from "./enums";
import { flagMasks } from "./flags";
import { Identifier } from "./identifier";
import { hexToBytes } from "./utils";
export class LogicId extends Identifier {
    constructor(value) {
        super(value);
        const error = LogicId.validate(this.toBytes());
        if (error) {
            throw new Error(`Invalid logic identifier. ${error.why}`);
        }
    }
    static validate(value) {
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
    static isValid(value) {
        try {
            return this.validate(value) === null;
        }
        catch (error) {
            return false;
        }
    }
}
//# sourceMappingURL=logic-id.js.map
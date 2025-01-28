"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLogicId = exports.logicId = exports.LogicId = void 0;
const base_identifier_1 = require("./base-identifier");
const enums_1 = require("./enums");
const flags_1 = require("./flags");
const utils_1 = require("./utils");
class LogicId extends base_identifier_1.BaseIdentifier {
    constructor(value) {
        super(value);
        const error = LogicId.validate(this.toBytes());
        if (error) {
            throw new Error(`Invalid logic identifier. ${error.why}`);
        }
    }
    static validate(value) {
        const asset = value instanceof Uint8Array ? value : (0, utils_1.hexToBytes)(value);
        const tag = this.getTag(asset);
        const kind = tag.getKind();
        if (kind !== enums_1.IdentifierKind.Logic) {
            return { why: "Invalid identifier kind. Expected a logic identifier." };
        }
        const hasUnsupportedFlags = (asset[1] & (flags_1.flagMasks.get(tag.value) ?? 0)) !== 0;
        if (hasUnsupportedFlags) {
            return { why: "Invalid Flags. Unsupported flags for identifier" };
        }
        return null;
    }
}
exports.LogicId = LogicId;
/**
 * Generates a new LogicId identifier from the given value.
 *
 * @param value - The value to be used for generating the LogicId. It can be either a Uint8Array or a Hex string.
 * @returns An Identifier instance created from the provided value.
 */
const logicId = (value) => {
    return new LogicId(value);
};
exports.logicId = logicId;
/**
 * Checks if the given identifier is an instance of LogicId.
 *
 * @param value - The identifier to check.
 * @returns True if the identifier is an instance of LogicId, otherwise false.
 */
const isLogicId = (value) => {
    return value instanceof LogicId;
};
exports.isLogicId = isLogicId;
//# sourceMappingURL=logic-id.js.map
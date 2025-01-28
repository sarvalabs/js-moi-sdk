import { bytesToHex, ErrorUtils, hexToBytes, isNullBytes } from "js-moi-utils";
import { IdentifierKind } from "./enums";
import { flagMasks, getFlag } from "./flags";
import { Identifier } from "./identifier";
import { IdentifierTag } from "./identifier-tag";
export class LogicId {
    buff;
    constructor(value) {
        if (value.length !== 32) {
            ErrorUtils.throwArgumentError("Invalid logic id length. Expected 32 bytes.", "value", value);
        }
        this.buff = value;
        const error = LogicId.validate(this);
        if (error != null) {
            ErrorUtils.throwArgumentError(`Invalid logic identifier. ${error.message}`, "value", value);
        }
    }
    toBytes() {
        return this.buff;
    }
    toHex() {
        return bytesToHex(this.buff);
    }
    toIdentifier() {
        return new Identifier(this.toBytes());
    }
    getTag() {
        return new IdentifierTag(this.buff[0]);
    }
    getFingerprint() {
        return new Uint8Array(this.buff.slice(4, 28));
    }
    getVariant() {
        const variant = new Uint8Array(this.buff.slice(28));
        return new DataView(variant.buffer).getUint32(0, true);
    }
    getFlag(flag) {
        if (!flag.supports(this.getTag())) {
            return false;
        }
        return getFlag(this.buff[1], flag.index);
    }
    isVariant() {
        const variant = new Uint8Array(this.buff.slice(28));
        return !isNullBytes(variant);
    }
    static validate(logicId) {
        const tag = logicId.getTag();
        const error = IdentifierTag.validate(tag);
        if (error) {
            return error;
        }
        if (tag.getKind() !== IdentifierKind.Logic) {
            return new Error("Invalid identifier kind. Expected a participant identifier.");
        }
        if ((logicId[1] & (flagMasks.get(tag.getValue()) ?? 0)) !== 0) {
            return new Error("Invalid participant identifier flags.");
        }
        return null;
    }
    static fromHex(value) {
        return new LogicId(hexToBytes(value));
    }
}
//# sourceMappingURL=logic-id.js.map
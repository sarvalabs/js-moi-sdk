"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantId = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const flags_1 = require("./flags");
const identifier_1 = require("./identifier");
const identifier_kind_1 = require("./identifier-kind");
const identifier_tag_1 = require("./identifier-tag");
class ParticipantId {
    bytes;
    constructor(value) {
        if (value.length !== 32) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid byte length for participant identifier. Expected 32 bytes.", "value", value);
        }
        this.bytes = value;
        const error = ParticipantId.validate(this);
        if (error) {
            js_moi_utils_1.ErrorUtils.throwArgumentError(`Invalid participant identifier. ${error.message}`, "value", value);
        }
    }
    getTag() {
        return new identifier_tag_1.IdentifierTag(this.bytes[0]);
    }
    static validate(participant) {
        const tag = participant.getTag();
        const error = identifier_tag_1.IdentifierTag.validate(tag);
        if (error) {
            return error;
        }
        if (tag.getKind() !== identifier_kind_1.IdentifierKind.Participant) {
            return new Error("Invalid identifier kind. Expected a participant identifier.");
        }
        if ((participant[1] & (flags_1.flagMasks.get(tag.getValue()) ?? 0)) !== 0) {
            return new Error("Invalid participant identifier flags.");
        }
        return null;
    }
    static fromHex(value) {
        if (!(0, js_moi_utils_1.isHex)(value)) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid hex value.", "value", value);
        }
        return new ParticipantId((0, js_moi_utils_1.hexToBytes)(value));
    }
    toBytes() {
        return new Uint8Array(this.bytes);
    }
    toHex() {
        return (0, js_moi_utils_1.bytesToHex)(this.bytes);
    }
    toIdentifier() {
        return new identifier_1.Identifier(this.bytes);
    }
    getFingerprint() {
        return new Uint8Array(this.bytes.slice(4, 28));
    }
    getVariant() {
        const variant = new Uint8Array(this.bytes.slice(28));
        return new DataView(variant.buffer).getUint32(0, true);
    }
    isVariant() {
        const variant = new Uint8Array(this.bytes.slice(28));
        return !(0, js_moi_utils_1.isNullBytes)(variant);
    }
    isFlagSupported(flag) {
        if (!flag.supports(this.getTag())) {
            return false;
        }
        return (0, flags_1.getFlag)(this.bytes[1], flag.index);
    }
}
exports.ParticipantId = ParticipantId;
//# sourceMappingURL=participant-id.js.map
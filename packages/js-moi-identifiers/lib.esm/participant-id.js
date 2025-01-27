import { bytesToHex, ErrorUtils, hexToBytes, isHex, isNullBytes } from "js-moi-utils";
import { flagMasks, getFlag } from "./flags";
import { Identifier } from "./identifier";
import { IdentifierKind } from "./identifier-kind";
import { IdentifierTag } from "./identifier-tag";
export class ParticipantId {
    bytes;
    constructor(value) {
        if (value.length !== 32) {
            ErrorUtils.throwArgumentError("Invalid byte length for participant identifier. Expected 32 bytes.", "value", value);
        }
        this.bytes = value;
        const error = ParticipantId.validate(this);
        if (error) {
            ErrorUtils.throwArgumentError(`Invalid participant identifier. ${error.message}`, "value", value);
        }
    }
    getTag() {
        return new IdentifierTag(this.bytes[0]);
    }
    static validate(participant) {
        const tag = participant.getTag();
        const error = IdentifierTag.validate(tag);
        if (error) {
            return error;
        }
        if (tag.getKind() !== IdentifierKind.Participant) {
            return new Error("Invalid identifier kind. Expected a participant identifier.");
        }
        if ((participant[1] & (flagMasks.get(tag.getValue()) ?? 0)) !== 0) {
            return new Error("Invalid participant identifier flags.");
        }
        return null;
    }
    static fromHex(value) {
        if (!isHex(value)) {
            ErrorUtils.throwArgumentError("Invalid hex value.", "value", value);
        }
        return new ParticipantId(hexToBytes(value));
    }
    toBytes() {
        return new Uint8Array(this.bytes);
    }
    toHex() {
        return bytesToHex(this.bytes);
    }
    toIdentifier() {
        return new Identifier(this.bytes);
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
        return !isNullBytes(variant);
    }
    isFlagSupported(flag) {
        if (!flag.supports(this.getTag())) {
            return false;
        }
        return getFlag(this.bytes[1], flag.index);
    }
}
//# sourceMappingURL=participant-id.js.map
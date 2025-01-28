import { bytesToHex, concatBytes, ErrorUtils, hexToBytes } from "js-moi-utils";
import { flagMasks, getFlag, setFlag } from "../flags";
import { IdentifierKind } from "../identifier-kind";
export var IdentifierVersion;
(function (IdentifierVersion) {
    IdentifierVersion[IdentifierVersion["V0"] = 0] = "V0";
})(IdentifierVersion || (IdentifierVersion = {}));
export class IdentifierTag {
    value;
    static MAX_IDENTIFIER_KIND = IdentifierKind.Logic;
    static kindMaxSupportedVersion = {
        [IdentifierKind.Participant]: 0,
        [IdentifierKind.Asset]: 0,
        [IdentifierKind.Logic]: 0,
    };
    constructor(value) {
        const validation = IdentifierTag.validate(value);
        if (validation) {
            ErrorUtils.throwArgumentError(`Invalid identifier value. ${validation.why}`, "value", value);
        }
        this.value = value;
    }
    getKind() {
        return IdentifierTag.getKind(this.value);
    }
    getVersion() {
        return IdentifierTag.getVersion(this.value);
    }
    static getKind(value) {
        return value >> 4;
    }
    static getVersion(value) {
        return value & 0x0f;
    }
    static getMaxSupportedVersion(kind) {
        return IdentifierTag.kindMaxSupportedVersion[kind];
    }
    static getTag(kind, version) {
        return new IdentifierTag((kind << 4) | version);
    }
    static validate(value) {
        if (IdentifierTag.getKind(value) > this.MAX_IDENTIFIER_KIND) {
            return { why: "Unsupported identifier kind." };
        }
        if (IdentifierTag.getVersion(value) > IdentifierTag.getMaxSupportedVersion(IdentifierTag.getKind(value))) {
            return { why: "Unsupported identifier version." };
        }
        return null;
    }
}
export class BaseIdentifier {
    value;
    constructor(value) {
        value = value instanceof Uint8Array ? value : hexToBytes(value);
        if (value.length !== 32) {
            ErrorUtils.throwArgumentError("Invalid identifier length. Expected 32 bytes.", "value", value);
        }
        this.value = value;
    }
    getFingerprint() {
        return this.toBytes().slice(4, 28);
    }
    getTag() {
        return BaseIdentifier.getTag(this.value);
    }
    getVariant() {
        const blob = new Uint8Array(this.value.slice(28));
        return new DataView(blob.buffer).getUint32(0, false);
    }
    hasFlag(flag) {
        return flag.supports(this.getTag()) || getFlag(this.value[1], flag.index);
    }
    toBytes() {
        return this.value.slice();
    }
    toHex() {
        return bytesToHex(this.value);
    }
    toString() {
        return this.toHex();
    }
    toJSON() {
        return this.toString();
    }
    static getTag(value) {
        if (value.length !== 32) {
            ErrorUtils.throwArgumentError("Invalid identifier length. Expected 32 bytes.", "value", value);
        }
        return new IdentifierTag(value[0]);
    }
}
export class ParticipantId extends BaseIdentifier {
    constructor(value) {
        super(value);
        const error = ParticipantId.validate(this.toBytes());
        if (error) {
            ErrorUtils.throwArgumentError(`Invalid participant identifier. ${error.why}`, "value", value);
        }
    }
    static validate(value) {
        const participant = value instanceof Uint8Array ? value : hexToBytes(value);
        const tag = this.getTag(participant);
        const kind = tag.getKind();
        if (kind !== IdentifierKind.Participant) {
            return { why: "Invalid identifier kind. Expected a participant identifier." };
        }
        const hasUnsupportedFlags = (participant[1] & (flagMasks.get(tag.value) ?? 0)) !== 0;
        if (hasUnsupportedFlags) {
            return { why: "Invalid Flags. Unsupported flags for identifier" };
        }
        return null;
    }
    static generateParticipantId(option) {
        if (option.version !== IdentifierVersion.V0) {
            ErrorUtils.throwArgumentError("Invalid identifier version. Expected V0.", "version", option.version);
        }
        if (option.fingerprint.length !== 24) {
            ErrorUtils.throwArgumentError("Invalid fingerprint length. Expected 24 bytes.", "fingerprint", option.fingerprint);
        }
        const metadata = new Uint8Array(4);
        const participantTag = IdentifierTag.getTag(IdentifierKind.Participant, option.version);
        metadata[0] = participantTag.value;
        for (const flag of option.flags ?? []) {
            if (!flag.supports(participantTag)) {
                ErrorUtils.throwArgumentError(`Invalid flag. Unsupported flag for participant identifier.`, "flag", flag);
            }
            metadata[1] = setFlag(metadata[1], flag.index, true);
        }
        const participant = concatBytes(metadata, option.fingerprint, new Uint8Array(4));
        new DataView(participant.buffer).setUint32(28, option.variant, false);
        return new ParticipantId(participant);
    }
}
//# sourceMappingURL=identifier.js.map
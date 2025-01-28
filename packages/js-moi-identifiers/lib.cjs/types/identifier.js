"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantId = exports.BaseIdentifier = exports.IdentifierTag = exports.IdentifierVersion = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const flags_1 = require("../flags");
const identifier_kind_1 = require("../identifier-kind");
var IdentifierVersion;
(function (IdentifierVersion) {
    IdentifierVersion[IdentifierVersion["V0"] = 0] = "V0";
})(IdentifierVersion || (exports.IdentifierVersion = IdentifierVersion = {}));
class IdentifierTag {
    value;
    static MAX_IDENTIFIER_KIND = identifier_kind_1.IdentifierKind.Logic;
    static kindMaxSupportedVersion = {
        [identifier_kind_1.IdentifierKind.Participant]: 0,
        [identifier_kind_1.IdentifierKind.Asset]: 0,
        [identifier_kind_1.IdentifierKind.Logic]: 0,
    };
    constructor(value) {
        const validation = IdentifierTag.validate(value);
        if (validation) {
            js_moi_utils_1.ErrorUtils.throwArgumentError(`Invalid identifier value. ${validation.why}`, "value", value);
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
exports.IdentifierTag = IdentifierTag;
class BaseIdentifier {
    value;
    constructor(value) {
        value = value instanceof Uint8Array ? value : (0, js_moi_utils_1.hexToBytes)(value);
        if (value.length !== 32) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid identifier length. Expected 32 bytes.", "value", value);
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
        return flag.supports(this.getTag()) || (0, flags_1.getFlag)(this.value[1], flag.index);
    }
    toBytes() {
        return this.value.slice();
    }
    toHex() {
        return (0, js_moi_utils_1.bytesToHex)(this.value);
    }
    toString() {
        return this.toHex();
    }
    toJSON() {
        return this.toString();
    }
    static getTag(value) {
        if (value.length !== 32) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid identifier length. Expected 32 bytes.", "value", value);
        }
        return new IdentifierTag(value[0]);
    }
}
exports.BaseIdentifier = BaseIdentifier;
class ParticipantId extends BaseIdentifier {
    constructor(value) {
        super(value);
        const error = ParticipantId.validate(this.toBytes());
        if (error) {
            js_moi_utils_1.ErrorUtils.throwArgumentError(`Invalid participant identifier. ${error.why}`, "value", value);
        }
    }
    static validate(value) {
        const participant = value instanceof Uint8Array ? value : (0, js_moi_utils_1.hexToBytes)(value);
        const tag = this.getTag(participant);
        const kind = tag.getKind();
        if (kind !== identifier_kind_1.IdentifierKind.Participant) {
            return { why: "Invalid identifier kind. Expected a participant identifier." };
        }
        const hasUnsupportedFlags = (participant[1] & (flags_1.flagMasks.get(tag.value) ?? 0)) !== 0;
        if (hasUnsupportedFlags) {
            return { why: "Invalid Flags. Unsupported flags for identifier" };
        }
        return null;
    }
    static generateParticipantId(option) {
        if (option.version !== IdentifierVersion.V0) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid identifier version. Expected V0.", "version", option.version);
        }
        if (option.fingerprint.length !== 24) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid fingerprint length. Expected 24 bytes.", "fingerprint", option.fingerprint);
        }
        const metadata = new Uint8Array(4);
        const participantTag = IdentifierTag.getTag(identifier_kind_1.IdentifierKind.Participant, option.version);
        metadata[0] = participantTag.value;
        for (const flag of option.flags ?? []) {
            if (!flag.supports(participantTag)) {
                js_moi_utils_1.ErrorUtils.throwArgumentError(`Invalid flag. Unsupported flag for participant identifier.`, "flag", flag);
            }
            metadata[1] = (0, flags_1.setFlag)(metadata[1], flag.index, true);
        }
        const participant = (0, js_moi_utils_1.concatBytes)(metadata, option.fingerprint, new Uint8Array(4));
        new DataView(participant.buffer).setUint32(28, option.variant, false);
        return new ParticipantId(participant);
    }
}
exports.ParticipantId = ParticipantId;
//# sourceMappingURL=identifier.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParticipantId = exports.ParticipantId = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const base_identifier_1 = require("./base-identifier");
const enums_1 = require("./enums");
const flags_1 = require("./flags");
const identifier_tag_1 = require("./identifier-tag");
class ParticipantId extends base_identifier_1.BaseIdentifier {
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
        if (kind !== enums_1.IdentifierKind.Participant) {
            return { why: "Invalid identifier kind. Expected a participant identifier." };
        }
        const hasUnsupportedFlags = (participant[1] & (flags_1.flagMasks.get(tag.value) ?? 0)) !== 0;
        if (hasUnsupportedFlags) {
            return { why: "Invalid Flags. Unsupported flags for identifier" };
        }
        return null;
    }
}
exports.ParticipantId = ParticipantId;
/**
 * Generates a participant identifier based on the provided options.
 *
 * @returns A new `ParticipantId` instance.
 *
 * @throws {Error} If the identifier version is not `IdentifierVersion.V0`.
 * @throws {Error} If the fingerprint length is not 24 bytes.
 * @throws {Error} If any flag is unsupported for the participant identifier.
 */
const createParticipantId = (option) => {
    if (option.version !== enums_1.IdentifierVersion.V0) {
        js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid identifier version. Expected V0.", "version", option.version);
    }
    if (option.fingerprint.length !== 24) {
        js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid fingerprint length. Expected 24 bytes.", "fingerprint", option.fingerprint);
    }
    const metadata = new Uint8Array(4);
    const participantTag = identifier_tag_1.IdentifierTag.getTag(enums_1.IdentifierKind.Participant, option.version);
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
};
exports.createParticipantId = createParticipantId;
//# sourceMappingURL=participant-id.js.map
import { BaseIdentifier } from "./base-identifier";
import { IdentifierKind, IdentifierVersion } from "./enums";
import { flagMasks, setFlag } from "./flags";
import { IdentifierTag } from "./identifier-tag";
import { hexToBytes } from "./utils";
export class ParticipantId extends BaseIdentifier {
    constructor(value) {
        super(value);
        const error = ParticipantId.validate(this.toBytes());
        if (error) {
            throw new Error(`Invalid participant identifier. ${error.why}`);
        }
    }
    static validate(value) {
        const participant = value instanceof Uint8Array ? value : hexToBytes(value);
        if (participant.length !== 32) {
            return { why: "Invalid length. Expected a 32-byte identifier." };
        }
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
    static isValid(value) {
        return this.validate(value) === null;
    }
}
/**
 * Generates a participant identifier based on the provided options.
 *
 * @returns A new `ParticipantId` instance.
 *
 * @throws {Error} If the identifier version is not `IdentifierVersion.V0`.
 * @throws {Error} If the fingerprint length is not 24 bytes.
 * @throws {Error} If any flag is unsupported for the participant identifier.
 */
export const createParticipantId = (option) => {
    if (option.version !== IdentifierVersion.V0) {
        throw new TypeError("Invalid identifier version. Expected V0.");
    }
    if (option.fingerprint.length !== 24) {
        throw new TypeError("Invalid fingerprint length. Expected 24 bytes.");
    }
    const metadata = new Uint8Array(4);
    const participantTag = IdentifierTag.getTag(IdentifierKind.Participant, option.version);
    metadata[0] = participantTag.value;
    for (const flag of option.flags ?? []) {
        if (!flag.supports(participantTag)) {
            throw new Error(`Invalid flag. Unsupported flag for participant identifier.`);
        }
        metadata[1] = setFlag(metadata[1], flag.index, true);
    }
    const participant = Uint8Array.from([...metadata, ...option.fingerprint, ...new Uint8Array(4)]);
    new DataView(participant.buffer).setUint32(28, option.variant, false);
    return new ParticipantId(participant);
};
/**
 * Creates a new `Identifier` instance from the given value.
 *
 * @param value - The value to create the `ParticipantId` from. It can be either a `Uint8Array` or a `Hex` string.
 * @returns A new `ParticipantId` instance.
 */
export const participantId = (value) => {
    if (value instanceof Uint8Array || typeof value === "string") {
        return new ParticipantId(value);
    }
    if (typeof value === "object") {
        return createParticipantId(value);
    }
    throw new Error("Invalid value. Expected a Uint8Array, Hex string or object.");
};
/**
 * Checks if the given value is a valid ParticipantId.
 *
 * @param value - The value to check, which can be a Uint8Array, Hex, or Identifier.
 * @returns True if the value is a valid ParticipantId, otherwise false.
 */
export const isParticipantId = (value) => {
    return value instanceof ParticipantId;
};
//# sourceMappingURL=participant-id.js.map
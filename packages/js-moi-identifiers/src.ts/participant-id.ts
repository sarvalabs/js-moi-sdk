import { concatBytes, ErrorUtils, hexToBytes, type Hex } from "js-moi-utils";
import { BaseIdentifier } from "./base-identifier";
import { IdentifierKind, IdentifierVersion } from "./enums";
import { flagMasks, setFlag, type Flag } from "./flags";
import { IdentifierTag } from "./identifier-tag";
import type { InvalidReason } from "./types/identifier";

export interface GenerateParticipantOption {
    version: IdentifierVersion;
    fingerprint: Uint8Array;
    variant: number;
    flags?: Flag[];
}

export class ParticipantId extends BaseIdentifier {
    constructor(value: Uint8Array | Hex) {
        super(value);

        const error = ParticipantId.validate(this.toBytes());

        if (error) {
            ErrorUtils.throwArgumentError(`Invalid participant identifier. ${error.why}`, "value", value);
        }
    }

    public static validate(value: Uint8Array | Hex): InvalidReason | null {
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
export const createParticipantId = (option: GenerateParticipantOption): ParticipantId => {
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
};

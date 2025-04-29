import { IdentifierKind } from "./enums";
import { flagMasks, setFlag, type Flag } from "./flags";
import { Identifier, type InvalidReason } from "./identifier";
import { IdentifierTag } from "./identifier-tag";
import { hexToBytes, type Hex } from "./utils";

export interface GenerateParticipantOption {
    tag: IdentifierTag;
    fingerprint: Uint8Array;
    variant: number;
    flags?: Flag[];
}

export class ParticipantId extends Identifier {
    constructor(value: Uint8Array | Hex | Identifier) {
        super(value);

        const error = ParticipantId.validate(this.toBytes());

        if (error) {
            throw new Error(`Invalid participant identifier. ${error.why}`);
        }
    }

    public static validate(value: Uint8Array | Hex): InvalidReason | null {
        if (!(value instanceof Uint8Array || typeof value === "string")) {
            return { why: "Invalid type of value, expected bytes or hex string." };
        }

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

    public static isValid(value: Uint8Array | Hex): boolean {
        try {
            return this.validate(value) === null;
        } catch (error) {
            return false;
        }
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
    if (option.fingerprint.length !== 24) {
        throw new TypeError("Invalid fingerprint length. Expected 24 bytes.");
    }

    const metadata = new Uint8Array(4);
    metadata[0] = option.tag.value;

    for (const flag of option.flags ?? []) {
        if (!flag.supports(option.tag)) {
            throw new Error(`Invalid flag. Unsupported flag for participant identifier.`);
        }

        metadata[1] = setFlag(metadata[1], flag.index, true);
    }

    const participant = Uint8Array.from([...metadata, ...option.fingerprint, ...new Uint8Array(4)]);
    new DataView(participant.buffer).setUint32(28, option.variant, false);

    return new ParticipantId(participant);
};

import { bytesToHex, concatBytes, ErrorUtils, hexToBytes, type Hex } from "js-moi-utils";
import { flagMasks, getFlag, setFlag, type Flag } from "../flags";
import { IdentifierKind } from "../identifier-kind";

export interface InvalidReason {
    why: string;
}

export enum IdentifierVersion {
    V0 = 0,
}

export class IdentifierTag {
    public readonly value: number;

    private static MAX_IDENTIFIER_KIND = IdentifierKind.Logic;

    private static kindMaxSupportedVersion: Record<IdentifierKind, number> = {
        [IdentifierKind.Participant]: 0,
        [IdentifierKind.Asset]: 0,
        [IdentifierKind.Logic]: 0,
    };

    constructor(value: number) {
        const validation = IdentifierTag.validate(value);

        if (validation) {
            ErrorUtils.throwArgumentError(`Invalid identifier value. ${validation.why}`, "value", value);
        }

        this.value = value;
    }

    public getKind(): IdentifierKind {
        return IdentifierTag.getKind(this.value);
    }

    public getVersion(): number {
        return IdentifierTag.getVersion(this.value);
    }

    public static getKind(value: number): IdentifierKind {
        return value >> 4;
    }

    public static getVersion(value: number): number {
        return value & 0x0f;
    }

    public static getMaxSupportedVersion(kind: IdentifierKind): number {
        return IdentifierTag.kindMaxSupportedVersion[kind];
    }

    public static getTag(kind: IdentifierKind, version: IdentifierVersion): IdentifierTag {
        return new IdentifierTag((kind << 4) | version);
    }

    public static validate(value: number): InvalidReason | null {
        if (IdentifierTag.getKind(value) > this.MAX_IDENTIFIER_KIND) {
            return { why: "Unsupported identifier kind." };
        }

        if (IdentifierTag.getVersion(value) > IdentifierTag.getMaxSupportedVersion(IdentifierTag.getKind(value))) {
            return { why: "Unsupported identifier version." };
        }

        return null;
    }
}

export interface Identifier {
    toBytes(): Uint8Array;

    toHex(): Hex;

    getFingerprint(): Uint8Array;

    getTag(): IdentifierTag;

    getVariant(): number;

    hasFlag(flag: Flag): boolean;

    toString(): string;

    toJSON(): string;
}

export abstract class BaseIdentifier implements Identifier {
    private readonly value: Uint8Array;

    constructor(value: Uint8Array | Hex) {
        value = value instanceof Uint8Array ? value : hexToBytes(value);

        if (value.length !== 32) {
            ErrorUtils.throwArgumentError("Invalid identifier length. Expected 32 bytes.", "value", value);
        }

        this.value = value;
    }

    public getFingerprint(): Uint8Array {
        return this.toBytes().slice(4, 28);
    }

    public getTag(): IdentifierTag {
        return BaseIdentifier.getTag(this.value);
    }

    public getVariant(): number {
        const blob = new Uint8Array(this.value.slice(28));
        return new DataView(blob.buffer).getUint32(0, false);
    }

    public hasFlag(flag: Flag): boolean {
        return flag.supports(this.getTag()) || getFlag(this.value[1], flag.index);
    }

    public toBytes(): Uint8Array {
        return this.value.slice();
    }

    public toHex(): Hex {
        return bytesToHex(this.value);
    }

    public toString(): string {
        return this.toHex();
    }

    public toJSON(): string {
        return this.toString();
    }

    protected static getTag(value: Uint8Array): IdentifierTag {
        if (value.length !== 32) {
            ErrorUtils.throwArgumentError("Invalid identifier length. Expected 32 bytes.", "value", value);
        }

        return new IdentifierTag(value[0]);
    }
}

interface GenerateParticipantOption {
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

    public static generateParticipantId(option: GenerateParticipantOption): ParticipantId {
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

import { type Hex } from "js-moi-utils";
import { type Flag } from "../flags";
import { IdentifierKind } from "../identifier-kind";
export interface InvalidReason {
    why: string;
}
export declare enum IdentifierVersion {
    V0 = 0
}
export declare class IdentifierTag {
    readonly value: number;
    private static MAX_IDENTIFIER_KIND;
    private static kindMaxSupportedVersion;
    constructor(value: number);
    getKind(): IdentifierKind;
    getVersion(): number;
    static getKind(value: number): IdentifierKind;
    static getVersion(value: number): number;
    static getMaxSupportedVersion(kind: IdentifierKind): number;
    static getTag(kind: IdentifierKind, version: IdentifierVersion): IdentifierTag;
    static validate(value: number): InvalidReason | null;
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
export declare abstract class BaseIdentifier implements Identifier {
    private readonly value;
    constructor(value: Uint8Array | Hex);
    getFingerprint(): Uint8Array;
    getTag(): IdentifierTag;
    getVariant(): number;
    hasFlag(flag: Flag): boolean;
    toBytes(): Uint8Array;
    toHex(): Hex;
    toString(): string;
    toJSON(): string;
    protected static getTag(value: Uint8Array): IdentifierTag;
}
interface GenerateParticipantOption {
    version: IdentifierVersion;
    fingerprint: Uint8Array;
    variant: number;
    flags?: Flag[];
}
export declare class ParticipantId extends BaseIdentifier {
    constructor(value: Uint8Array | Hex);
    static validate(value: Uint8Array | Hex): InvalidReason | null;
    static generateParticipantId(option: GenerateParticipantOption): ParticipantId;
}
export {};
//# sourceMappingURL=identifier.d.ts.map
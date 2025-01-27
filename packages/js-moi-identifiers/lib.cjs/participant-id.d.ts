import { type Hex } from "js-moi-utils";
import { type Flag } from "./flags";
import { Identifier } from "./identifier";
import { IdentifierTag } from "./identifier-tag";
export declare class ParticipantId {
    private readonly bytes;
    constructor(value: Uint8Array);
    getTag(): IdentifierTag;
    static validate(participant: ParticipantId): Error | null;
    static fromHex(value: Hex): ParticipantId;
    toBytes(): Uint8Array;
    toHex(): Hex;
    toIdentifier(): Identifier;
    getFingerprint(): Uint8Array<ArrayBuffer>;
    getVariant(): number;
    isVariant(): boolean;
    isFlagSupported(flag: Flag): boolean;
    static generateParticipantIdV0(fingerprint: Uint8Array, variant: number, ...flags: Flag[]): ParticipantId;
}
//# sourceMappingURL=participant-id.d.ts.map
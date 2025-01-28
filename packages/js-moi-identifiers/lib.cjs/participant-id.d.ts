import { type Hex } from "js-moi-utils";
import { BaseIdentifier } from "./base-identifier";
import { IdentifierVersion } from "./enums";
import { type Flag } from "./flags";
import type { InvalidReason } from "./types/identifier";
export interface GenerateParticipantOption {
    version: IdentifierVersion;
    fingerprint: Uint8Array;
    variant: number;
    flags?: Flag[];
}
export declare class ParticipantId extends BaseIdentifier {
    constructor(value: Uint8Array | Hex);
    static validate(value: Uint8Array | Hex): InvalidReason | null;
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
export declare const createParticipantId: (option: GenerateParticipantOption) => ParticipantId;
//# sourceMappingURL=participant-id.d.ts.map
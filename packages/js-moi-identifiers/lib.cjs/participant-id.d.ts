import { IdentifierVersion } from "./enums";
import { type Flag } from "./flags";
import { Identifier, type InvalidReason } from "./identifier";
import { type Hex } from "./utils";
export interface GenerateParticipantOption {
    version: IdentifierVersion;
    fingerprint: Uint8Array;
    variant: number;
    flags?: Flag[];
}
/**
 * Represents a participant identifier which extends the base `Identifier` class.
 * This class ensures that the provided identifier is valid according to specific rules
 * for participant identifiers.
 *
 * @param value - The identifier value as a `Uint8Array`, `Hex`, or `Identifier`.
 */
export declare class ParticipantId extends Identifier {
    constructor(value: Uint8Array | Hex | Identifier);
    static validate(value: Uint8Array | Hex): InvalidReason | null;
    static isValid(value: Uint8Array | Hex): boolean;
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
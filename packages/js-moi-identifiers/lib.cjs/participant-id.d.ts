import { BaseIdentifier } from "./base-identifier";
import { IdentifierVersion } from "./enums";
import { type Flag } from "./flags";
import type { Identifier, InvalidReason } from "./types/identifier";
import { type Hex } from "./utils";
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
/**
 * Creates a new `Identifier` instance from the given value.
 *
 * @param value - The value to create the `ParticipantId` from. It can be either a `Uint8Array` or a `Hex` string.
 * @returns A new `ParticipantId` instance.
 */
export declare const participantId: (value: Uint8Array | Hex | GenerateParticipantOption) => Identifier;
/**
 * Checks if the given value is a valid ParticipantId.
 *
 * @param value - The value to check, which can be a Uint8Array, Hex, or Identifier.
 * @returns True if the value is a valid ParticipantId, otherwise false.
 */
export declare const isParticipantId: (value: Identifier) => value is ParticipantId;
//# sourceMappingURL=participant-id.d.ts.map
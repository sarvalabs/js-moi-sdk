import { randomBytes } from "crypto";
import { createParticipantId, Flag, Identifier, IdentifierKind, ParticipantId, ParticipantTagV0 } from "../src.ts";
import { hexToBytes } from "../src.ts/utils";

const VALID_PARTICIPANT_ID = "0x0000000067bc504a470c5e31586eeedbefe73ccef20e0a49e1dc75ed00000000";
const INVALID_PARTICIPANT_ID = "0x208300005edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f7800000000";

describe(ParticipantId, () => {
    describe("constructor", () => {
        it.concurrent("should throw error for invalid participant id", () => {
            expect(() => new ParticipantId(INVALID_PARTICIPANT_ID)).toThrow();
        });

        it.concurrent("should throw error if identifier kind is not participant", () => {
            expect(() => new ParticipantId(new Identifier(INVALID_PARTICIPANT_ID))).toThrow();
        });

        it.concurrent("should create a new participant id", () => {
            const participant = new ParticipantId(VALID_PARTICIPANT_ID);

            expect(participant).toBeInstanceOf(ParticipantId);
            expect(participant.getTag().getKind()).toBe(IdentifierKind.Participant);
            expect(participant.getFingerprint()).toEqual(hexToBytes(VALID_PARTICIPANT_ID).slice(4, 28));
            expect(participant.getVariant()).toBe(0);
        });
    });

    describe(ParticipantId.validate, () => {
        it.concurrent("should return reason for invalid participant id", () => {
            expect(ParticipantId.validate(INVALID_PARTICIPANT_ID)).not.toBeNull();
        });

        it.concurrent("should return null for valid participant id", () => {
            expect(ParticipantId.validate(VALID_PARTICIPANT_ID)).toBeNull();
        });

        it.concurrent("should return a reason for when has invalid flag", () => {
            const participant = hexToBytes(VALID_PARTICIPANT_ID);
            participant[1] = 0x08;

            expect(ParticipantId.validate(participant)).not.toBeNull();
        });

        it.concurrent.each([
            {
                value: new Uint8Array(randomBytes(5)),
                expected: "Invalid identifier length. Expected 32 bytes.",
            },
            {
                value: 5 as any,
            },
            {
                value: "invalid value",
                expected: "Invalid hex string",
            },
            {
                value: null!, // ! is used to make value as any
            },
            {
                value: undefined!, // ! is used to make value as any,
            },
        ])(`should throw an error when value is "$value"`, ({ value, expected }) => {
            expect(() => new ParticipantId(value)).toThrow(expected);
            expect(ParticipantId.isValid(value)).toBe(false);
        });
    });
});

describe(createParticipantId, () => {
    it.concurrent("should generate a valid participant id from object", () => {
        const participant = createParticipantId({
            fingerprint: globalThis.crypto.getRandomValues(new Uint8Array(24)),
            variant: 0,
            tag: ParticipantTagV0,
        });

        expect(participant).toBeInstanceOf(ParticipantId);
    });

    it.concurrent("should throw error for when created with object using invalid flags", () => {
        expect(() =>
            createParticipantId({
                fingerprint: globalThis.crypto.getRandomValues(new Uint8Array(24)),
                variant: 0,
                tag: ParticipantTagV0,
                flags: [new Flag(IdentifierKind.Participant, 2, 3)],
            })
        ).toThrow();
    });
});

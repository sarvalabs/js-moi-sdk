import { hexToBytes, randomBytes } from "js-moi-utils";
import { Flag, IdentifierKind, IdentifierVersion, isParticipantId, logicId, ParticipantId, participantId } from "../src.ts";

const VALID_PARTICIPANT_ID = "0x0000000067bc504a470c5e31586eeedbefe73ccef20e0a49e1dc75ed00000000";
const NOT_A_PARTICIPANT_ID = "0x208300005edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f7800000000";

describe(ParticipantId, () => {
    describe("constructor", () => {
        it.concurrent("should throw error for invalid participant id", () => {
            expect(() => new ParticipantId(NOT_A_PARTICIPANT_ID)).toThrow();
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
        it.concurrent("should invalid result for invalid participant id", () => {
            expect(ParticipantId.validate(NOT_A_PARTICIPANT_ID)).not.toBeNull();
        });

        it.concurrent("should return null for valid participant id", () => {
            expect(ParticipantId.validate(VALID_PARTICIPANT_ID)).toBeNull();
        });
    });
});

describe(participantId, () => {
    it.concurrent("should generate a valid participant id from object", () => {
        const participant = participantId({
            fingerprint: randomBytes(24),
            variant: 0,
            version: IdentifierVersion.V0,
        });

        expect(participant).toBeInstanceOf(ParticipantId);
    });

    it.concurrent("should throw error for when created with object using invalid flags", () => {
        expect(() =>
            participantId({
                fingerprint: randomBytes(24),
                variant: 0,
                version: IdentifierVersion.V0,
                flags: [new Flag(IdentifierKind.Participant, 2, 3)],
            })
        ).toThrow();
    });

    it.concurrent("should generate a valid participant id from hex", () => {
        const participant = participantId(VALID_PARTICIPANT_ID);

        expect(participant).toBeInstanceOf(ParticipantId);
    });

    it.concurrent("should generate a valid participant id from bytes", () => {
        const participant = participantId(hexToBytes(VALID_PARTICIPANT_ID));

        expect(participant).toBeInstanceOf(ParticipantId);
    });
});

describe(isParticipantId, () => {
    it.concurrent("should return true for valid participant id", () => {
        const participant = participantId(VALID_PARTICIPANT_ID);

        expect(isParticipantId(participant)).toBe(true);
    });

    it.concurrent("should return false for invalid participant id", () => {
        const identifier = logicId(NOT_A_PARTICIPANT_ID);

        expect(isParticipantId(identifier)).toBe(false);
    });
});

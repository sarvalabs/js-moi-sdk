import { randomBytes } from "js-moi-utils";
import { Flag, IdentifierKind, ParticipantId, TagParticipantV0 } from "../src.ts";

describe("v0", () => {
    describe("Generate Participant ID", () => {
        it("should generate a participant id", () => {
            const randomFingerPrint = randomBytes(24);
            const participantId = ParticipantId.generateParticipantIdV0(randomFingerPrint, 42, new Flag(IdentifierKind.Participant, 0, 0));

            expect(participantId.getTag().getValue()).toBe(TagParticipantV0.getValue());
            expect(participantId.getVariant()).toBe(42);
        });

        it("should throw an error if flag is incorrect", () => {
            const randomFingerPrint = randomBytes(24);

            expect(() => {
                ParticipantId.generateParticipantIdV0(randomFingerPrint, 42, new Flag(IdentifierKind.Asset, 0, 0));
            }).toThrow();
        });
    });
});

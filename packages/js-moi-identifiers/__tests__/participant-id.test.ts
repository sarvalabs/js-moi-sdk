import { hexToBytes } from "js-moi-utils";
import { ParticipantId } from "../src.ts";

describe(ParticipantId, () => {
    describe("constructor", () => {
        it.concurrent("should create a participant id", () => {
            const bytes = hexToBytes("0x000000002ac4f9a56ac7e8938e85cbc7ba1dd83f85594b2b162a59e400000000");
            const id = new ParticipantId(bytes);

            expect(id).toBeInstanceOf(ParticipantId);
        });

        it.concurrent("should throw an error if the tag is incorrect", () => {
            const bytes = new Uint8Array(32);
            bytes[0] = 0x21;

            expect(() => {
                new ParticipantId(bytes);
            }).toThrow();
        });
    });

    describe(ParticipantId.fromHex, () => {
        it.concurrent("should create a participant id from hex", () => {
            const hex = "0x0000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee600000000";
            const id = ParticipantId.fromHex(hex);

            expect(id).toBeInstanceOf(ParticipantId);
        });
    });
});

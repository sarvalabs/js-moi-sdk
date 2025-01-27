import { bytesToHex, hexToBytes } from "js-moi-utils";
import { LogicId } from "../src.ts";

describe(LogicId, () => {
    const buff = hexToBytes("0x2001001001020304050607081112131415161718212223242526272800000042");
    const fingerprint = "0x010203040506070811121314151617182122232425262728";

    describe("constructor", () => {
        it.concurrent("should create an asset id", () => {
            const id = new LogicId(buff);

            expect(id).toBeInstanceOf(LogicId);
            expect(bytesToHex(id.getFingerprint())).toBe(fingerprint);
        });
    });

    describe(LogicId.fromHex, () => {
        it.concurrent("should create an asset id from hex", () => {
            const id = LogicId.fromHex(bytesToHex(buff));

            expect(id).toBeInstanceOf(LogicId);
            expect(bytesToHex(id.getFingerprint())).toBe(fingerprint);
        });
    });
});

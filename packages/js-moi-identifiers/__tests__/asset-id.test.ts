import { bytesToHex, hexToBytes } from "js-moi-utils";
import { AssetId } from "../src.ts";

describe(AssetId, () => {
    const buff = hexToBytes("0x1001001001020304050607081112131415161718212223242526272800000042");
    const fingerprint = "0x010203040506070811121314151617182122232425262728";

    describe("constructor", () => {
        it.concurrent("should create an asset id", () => {
            const id = new AssetId(buff);

            expect(id).toBeInstanceOf(AssetId);
            expect(bytesToHex(id.getFingerprint())).toBe(fingerprint);
        });
    });

    describe(AssetId.fromHex, () => {
        it.concurrent("should create an asset id from hex", () => {
            const id = AssetId.fromHex("0x1001001001020304050607081112131415161718212223242526272800000042");

            expect(id).toBeInstanceOf(AssetId);
            expect(bytesToHex(id.getFingerprint())).toBe(fingerprint);
        });
    });

    const id = new AssetId(buff);

    describe(id.getStandard, () => {
        it.concurrent("should return the asset standard", () => {
            expect(id.getStandard()).toBe(16);
        });
    });
});

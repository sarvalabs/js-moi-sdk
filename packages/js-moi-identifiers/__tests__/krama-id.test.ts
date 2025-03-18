import { KramaId, KramaIdKind, KramaIdVersion, NetworkZone } from "../src.ts/index";
import type { Hex } from "../src.ts/utils";

describe(KramaId, () => {
    const validPeerId = "16Uiu2HAm2itTsAm1YonwaN8c4XQoqa4egGJAMxwMuXpzNKTwh68E";
    const invalidPeerId = "1126Uiu2HAm2itTsAm1YonwaN8c4XQoqa4egGJAMxwMuXpzNKTwh68E";
    const invalidPrivateKeys: (Hex | Uint8Array)[] = [new Uint8Array([0x1, 0x2, 0x3, 0x4, 0x5]), "0x0102030405"];
    const validPrivateKey = new Uint8Array([
        168, 131, 47, 130, 40, 186, 33, 74, 193, 101, 106, 74, 96, 115, 149, 8, 170, 218, 100, 173, 136, 168, 168, 152, 217, 61, 174, 250, 255, 240, 143, 147,
    ]);

    it.concurrent.each(invalidPrivateKeys)("should throw an error creating from invalid private key", async (privateKey) => {
        await expect(() => KramaId.fromPrivateKey(KramaIdKind.Guardian, KramaIdVersion.V0, NetworkZone.Zone0, privateKey)).rejects.toThrow("Invalid private key length");
    });

    it.concurrent.each([
        {
            name: "when network zone is 3",
            callback: async () => await KramaId.fromPrivateKey(KramaIdKind.Guardian, KramaIdVersion.V0, NetworkZone.Zone3, validPrivateKey),
            expected: "1q16Uiu2HAm2itTsAm1YonwaN8c4XQoqa4egGJAMxwMuXpzNKTwh68E",
        },
        {
            name: "when private key is valid",
            callback: async () => await KramaId.fromPrivateKey(KramaIdKind.Guardian, KramaIdVersion.V0, NetworkZone.Zone0, validPrivateKey),
            expected: "1116Uiu2HAm2itTsAm1YonwaN8c4XQoqa4egGJAMxwMuXpzNKTwh68E",
        },
        {
            name: "when created using peer id",
            callback: async () => KramaId.fromPeerId(KramaIdKind.Guardian, KramaIdVersion.V0, NetworkZone.Zone0, validPeerId),
            expected: `11${validPeerId}`,
        },
    ])("should create a KramaId $name", async ({ callback, expected }) => {
        const kramaId = await callback();
        expect(kramaId.toString()).toBe(expected);
        expect(kramaId.toJSON()).toBe(expected);
        expect(kramaId.getDecodedPeerId().toB58String()).toBe(validPeerId);
    });

    it.concurrent("should throw an error when creating from invalid peer id", async () => {
        expect(() => KramaId.fromPeerId(KramaIdKind.Guardian, KramaIdVersion.V0, NetworkZone.Zone0, invalidPeerId)).toThrow("Unable to decode multibase string");
    });

    it.concurrent("should throw an error when creating from unsupported version", async () => {
        expect(() => KramaId.fromPeerId(KramaIdKind.Guardian, 1 as KramaIdVersion, NetworkZone.Zone0, invalidPeerId)).toThrow("Invalid KramaIdTag: Unsupported KramaId version");
    });

    it.concurrent("should create a Krama Id from a valid string", () => {
        const kramaId = "1116Uiu2HAm2itTsAm1YonwaN8c4XQoqa4egGJAMxwMuXpzNKTwh68E";

        const kramaIdInstance = new KramaId(kramaId);
        expect(kramaIdInstance.toString()).toBe(kramaId);
    });

    it.concurrent.each([
        {
            name: "when empty string is provided",
            value: "",
            error: /KramaId must be a non-empty string/,
        },
        {
            name: "when invalid peer id is provided",
            value: invalidPeerId,
            error: /Unable to decode multibase string/,
        },
    ])("should thrown an error when $name", ({ value, error }) => {
        expect(() => new KramaId(value)).toThrow(error);
    });
});

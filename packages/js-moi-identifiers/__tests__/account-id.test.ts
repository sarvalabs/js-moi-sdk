import { newAccountFingerprint, deriveAssetId, deriveLogicId, type AccountIdSender } from "../src.ts";

const SENDER: AccountIdSender = {
    id: "0x0000000067bc504a470c5e31586eeedbefe73ccef20e0a49e1dc75ed00000000",
    sequence: 0,
    key_id: 0,
};

describe(newAccountFingerprint, () => {
    it.concurrent("returns a 24-byte fingerprint", () => {
        const fingerprint = newAccountFingerprint(SENDER);

        expect(fingerprint).toHaveLength(24);
    });

    it.concurrent("is deterministic for the same sender", () => {
        expect(newAccountFingerprint(SENDER)).toEqual(newAccountFingerprint({ ...SENDER }));
    });

    it.concurrent("changes when sequence changes", () => {
        const a = newAccountFingerprint(SENDER);
        const b = newAccountFingerprint({ ...SENDER, sequence: 5 });

        expect(a).not.toEqual(b);
    });

    it.concurrent("changes when key_id changes", () => {
        const a = newAccountFingerprint(SENDER);
        const b = newAccountFingerprint({ ...SENDER, key_id: 1 });

        expect(a).not.toEqual(b);
    });

    it.concurrent("changes when the account id changes", () => {
        const a = newAccountFingerprint(SENDER);
        const b = newAccountFingerprint({ ...SENDER, id: "0x0000000067bc504a470c5e31586eeedbefe73ccef20e0a49e1dc75ed00000001" });

        expect(a).not.toEqual(b);
    });
});

describe(deriveLogicId, () => {
    it.concurrent("produces a valid v0 logic id with the expected byte layout", () => {
        const logicId = deriveLogicId(SENDER);
        const bytes = logicId.toBytes();

        expect(bytes[0]).toBe(0x20); // LogicTagV0
        expect(bytes[1]).toBe(0x00); // flags: always empty per the blockchain's LogicPayload.Flags()
        expect(logicId.getVariant()).toBe(0);
        expect(logicId.getFingerprint()).toEqual(newAccountFingerprint(SENDER));
    });

    it.concurrent("is deterministic for the same sender", () => {
        expect(deriveLogicId(SENDER).toHex()).toBe(deriveLogicId({ ...SENDER }).toHex());
    });

    it.concurrent("differs for a different sequence", () => {
        expect(deriveLogicId(SENDER).toHex()).not.toBe(deriveLogicId({ ...SENDER, sequence: 1 }).toHex());
    });
});

describe(deriveAssetId, () => {
    it.concurrent("produces a valid v0 asset id with the expected byte layout", () => {
        const assetId = deriveAssetId(SENDER, 2);
        const bytes = assetId.toBytes();

        expect(bytes[0]).toBe(0x10); // AssetTagV0
        expect(bytes[1]).toBe(0x03); // flags: AssetLogical | AssetStateful, always set per the blockchain
        expect(assetId.getStandard()).toBe(2);
        expect(assetId.getFingerprint()).toEqual(newAccountFingerprint(SENDER));
    });

    it.concurrent("is deterministic for the same sender and standard", () => {
        expect(deriveAssetId(SENDER, 0).toHex()).toBe(deriveAssetId({ ...SENDER }, 0).toHex());
    });

    it.concurrent("differs for a different standard", () => {
        expect(deriveAssetId(SENDER, 0).toHex()).not.toBe(deriveAssetId(SENDER, 1).toHex());
    });
});

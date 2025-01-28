import { AssetStandard, hexToBytes } from "js-moi-utils";
import { assetId, AssetId, IdentifierKind, isAssetId, participantId } from "../src.ts";

const TEST_ASSET_ID = "0x108000004cd973c4eb83cdb8870c0de209736270491b7acc99873da100000000";
const NOT_A_ASSET_ID = "0x0000000067bc504a470c5e31586eeedbefe73ccef20e0a49e1dc75ed00000000";

describe(AssetId, () => {
    describe("constructor", () => {
        it.concurrent("should throw error for invalid asset id", () => {
            expect(() => new AssetId(NOT_A_ASSET_ID)).toThrow();
        });

        it.concurrent("should create instance for valid asset id", () => {
            const assetId = new AssetId(TEST_ASSET_ID);

            expect(assetId).toBeInstanceOf(AssetId);
            expect(assetId.getTag().getKind()).toBe(IdentifierKind.Asset);
            expect(assetId.getFingerprint()).toEqual(hexToBytes(TEST_ASSET_ID).slice(4, 28));
            expect(assetId.getStandard()).toBe(AssetStandard.MAS0);
        });
    });

    describe(AssetId.validate, () => {
        it.concurrent("should return null for valid asset id", () => {
            expect(AssetId.validate(hexToBytes(TEST_ASSET_ID))).toBeNull();
        });

        it.concurrent("should return error for invalid asset id", () => {
            expect(AssetId.validate(hexToBytes(NOT_A_ASSET_ID))).not.toBeNull();
        });
    });
});

describe(assetId, () => {
    it.concurrent("should create asset from hex string", () => {
        const asset = assetId(TEST_ASSET_ID);

        expect(asset).toBeInstanceOf(AssetId);
    });

    it.concurrent("should create asset from Uint8Array", () => {
        const asset = assetId(hexToBytes(TEST_ASSET_ID));

        expect(asset).toBeInstanceOf(AssetId);
    });

    it.concurrent("should throw error for invalid asset id", () => {
        expect(() => assetId(NOT_A_ASSET_ID)).toThrow();
    });
});

describe(isAssetId, () => {
    it.concurrent("should return true for valid asset id", () => {
        const identifier = assetId(TEST_ASSET_ID);

        expect(isAssetId(identifier)).toBe(true);
    });

    it.concurrent("should return false for invalid asset id", () => {
        const identifier = participantId(NOT_A_ASSET_ID);

        expect(isAssetId(identifier)).toBe(false);
    });
});

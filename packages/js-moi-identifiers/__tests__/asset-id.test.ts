import { randomBytes } from "crypto";
import { AssetId, Identifier, IdentifierKind } from "../src.ts";
import { hexToBytes } from "../src.ts/utils";

const VALID_ASSET_ID = "0x108000004cd973c4eb83cdb8870c0de209736270491b7acc99873da100000000";
const INVALID_ASSET_ID = "0x0000000067bc504a470c5e31586eeedbefe73ccef20e0a49e1dc75ed00000000";

describe(AssetId, () => {
    describe("constructor", () => {
        it.concurrent("should throw error for invalid asset id", () => {
            expect(() => new AssetId(INVALID_ASSET_ID)).toThrow();
        });

        it.concurrent("should throw error if identifier kind is not asset", () => {
            expect(() => new AssetId(new Identifier(INVALID_ASSET_ID))).toThrow();
        });

        it.concurrent("should create instance for valid asset id", () => {
            const assetId = new AssetId(VALID_ASSET_ID);

            expect(assetId).toBeInstanceOf(AssetId);
            expect(assetId.getTag().getKind()).toBe(IdentifierKind.Asset);
            expect(assetId.getFingerprint()).toEqual(hexToBytes(VALID_ASSET_ID).slice(4, 28));
            expect(assetId.getStandard()).toBe(0);
        });
    });

    describe(AssetId.validate, () => {
        it.concurrent("should return null for valid asset id", () => {
            expect(AssetId.validate(hexToBytes(VALID_ASSET_ID))).toBeNull();
        });

        it.concurrent("should return error for invalid asset id", () => {
            expect(AssetId.validate(hexToBytes(INVALID_ASSET_ID))).not.toBeNull();
        });
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
        expect(() => new AssetId(value)).toThrow(expected);
    });
});

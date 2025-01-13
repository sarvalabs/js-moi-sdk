import { AssetId, ensureHexPrefix, LogicId, type Hex } from "../src.ts";

interface TestCase<TVal, TExpected> {
    value: TVal;
    expected: TExpected;
}

const logicId = "0x0800005edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f780d88233a4e57b10a";
const assetId = "0x08020001cb1dc89688d0eb37bfde940341a476a8912cc4555e778f3483724fd9afac0190";

describe(LogicId, () => {
    it.concurrent("should validate a logic id", () => {
        const cases: TestCase<Hex, boolean>[] = [
            { value: "0x", expected: false },
            { value: "0x0800005edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f780d88233a4e57b10a", expected: true },
            { value: "0x0000000", expected: false },
            { value: "0x00000000", expected: false },
        ];

        for (const { value, expected } of cases) {
            expect(LogicId.isValid(value)).toBe(expected);
        }
    });

    it.concurrent("should create a logic id", () => {
        const id = new LogicId(logicId);
        expect(id.toString()).toBe(logicId);
    });

    type Field = {
        persistent: boolean;
        ephemeral: boolean;
        intractable: boolean;
        version: number;
        edition: number;
        address: Hex;
    };

    const cases: TestCase<Hex, Field>[] = [
        {
            value: "0x0f00010064f8471bc7f7df3105f29311362f6dfaa4cd49cd3c5dcc6b758eb5de4706dd",
            expected: {
                version: 0,
                persistent: true,
                address: "0x0064f8471bc7f7df3105f29311362f6dfaa4cd49cd3c5dcc6b758eb5de4706dd",
                ephemeral: true,
                intractable: true,
                edition: 1,
            },
        },
        {
            value: "0x0b000afb1263bd90686b1f5c0835eb8b87da334767c3ccf02f805e0f379f1c33754934",
            expected: {
                version: 0,
                persistent: true,
                address: "0xfb1263bd90686b1f5c0835eb8b87da334767c3ccf02f805e0f379f1c33754934",
                ephemeral: false,
                intractable: true,
                edition: 10,
            },
        },
    ];

    test.each(cases)("should parse a logic id = $value", ({ value, expected }) => {
        const id = new LogicId(value);

        expect(id.getVersion()).toBe(expected.version);
        expect(id.isPersistent()).toBe(expected.persistent);
        expect(id.isEphemeral()).toBe(expected.ephemeral);
        expect(id.isIntractable()).toBe(expected.intractable);
        expect(id.getEdition()).toBe(expected.edition);
        expect(id.getAddress()).toBe(expected.address);
    });
});

describe(AssetId, () => {
    test.concurrent.each([
        "0x08020001cac7de60d805b9bd7f0f2c1e1994481c4e650e8065993af4e20726b4ecbafd14",
        "0x08020001cb1dc89688d0eb37bfde940341a476a8912cc4555e778f3483724fd9afac0190",
        "0x08020001f53be405d2395c09be654032d5ac248fa85ed68a74ad65eea4676c53d78866a5",
    ])("should return true for valid AssetId: %s", (value) => {
        expect(AssetId.isValid(value)).toBe(true);
    });

    test.concurrent.each([
        "0x",
        "0x0000000",
        "0x00000000",
        "0xG8020001cac7de60d805b9bd7f0f2c1e1994481c4e650e8065993af4e20726b4ecbafd14", // Invalid hex char
        "08020001cac7de60d805b9bd7f0f2c1e1994481c4e650e8065993af4e20726b4ecbafd14", // Missing 0x prefix
        "0x08020001cac7de60d805b9bd7f0f2c1e1994481c4e650e8065993af4e20726b4ecbafd1", // Too short
        "0x08020001cac7de60d805b9bd7f0f2c1e1994481c4e650e8065993af4e20726b4ecbafd145", // Too long
        "",
        "invalid",
    ])("should return false for invalid AssetId: %s", (value) => {
        expect(AssetId.isValid(value)).toBe(false);
    });

    it.concurrent("should create an asset id", () => {
        const id = new AssetId(assetId);
        expect(id.toString()).toBe(assetId);
    });

    test.each([
        {
            value: "0x08020001cac7de60d805b9bd7f0f2c1e1994481c4e650e8065993af4e20726b4ecbafd14",
            expected: {
                address: "0xcac7de60d805b9bd7f0f2c1e1994481c4e650e8065993af4e20726b4ecbafd14",
                version: 0,
                standard: 1,
                dimension: 2,
                isLogical: true,
                isStateful: false,
            },
        },
        {
            value: "0x040100009f12a8bcbe0bc6623ee32bdc6530ebf0d7666de4a05a268f6e845fddb5e6da9d",
            expected: {
                address: "0x9f12a8bcbe0bc6623ee32bdc6530ebf0d7666de4a05a268f6e845fddb5e6da9d",
                version: 0,
                standard: 0,
                dimension: 1,
                isLogical: false,
                isStateful: true,
            },
        },
    ])("should parse an asset id = $item.value", ({ value, expected }) => {
        const id = new AssetId(ensureHexPrefix(value));

        expect(id.getAddress()).toBe(expected.address);
        expect(id.getVersion()).toBe(expected.version);
        expect(id.getStandard()).toBe(expected.standard);
        expect(id.getDimension()).toBe(expected.dimension);
        expect(id.isLogical()).toBe(expected.isLogical);
        expect(id.isStateful()).toBe(expected.isStateful);
    });
});

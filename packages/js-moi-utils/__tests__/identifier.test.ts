import { LogicId, type Hex } from "../src.ts";

interface TestCase<TVal, TExpected> {
    value: TVal;
    expected: TExpected;
}

const logicId = "0x0800005edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f780d88233a4e57b10a";

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

    it.concurrent("should parse a logic id", () => {
        for (const { value, expected } of cases) {
            const id = new LogicId(value);

            expect(id.getVersion()).toBe(expected.version);
            expect(id.isPersistent()).toBe(expected.persistent);
            expect(id.isEphemeral()).toBe(expected.ephemeral);
            expect(id.isIntractable()).toBe(expected.intractable);
            expect(id.getEdition()).toBe(expected.edition);
            expect(id.getAddress()).toBe(expected.address);
        }
    });
});

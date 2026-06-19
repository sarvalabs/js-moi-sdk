import type { LogicManifest } from "../lib.cjs";
import { ManifestCoder } from "../src.ts/manifest";
import { ManifestCoderFormat } from "../src.ts/manifest-coder/serialization-format";
import { loadFile, loadManifestFromFile } from "./utils/helper";

const FIXTURE_MANIFESTS = [
    { manifest: "../../manifests/tokenledger.json", polo: "../../manifests/tokenledger.polo" },
    { manifest: "../../manifests/flipper.json",     polo: "../../manifests/flipper.polo" },
    { manifest: "../../manifests/lock-ledger.json", polo: "../../manifests/lock-ledger.polo" },
];

const normalize = (obj: unknown): unknown =>
    JSON.parse(
        JSON.stringify(obj, (_key, value) =>
            value instanceof Uint8Array ? Array.from(value) : value
        )
    );

describe("ManifestCoder", () => {
    let tokenledgerManifest: LogicManifest.Manifest;
    let tokenledgerCoder: ManifestCoder;

    beforeAll(async () => {
        tokenledgerManifest = await loadManifestFromFile("../../manifests/tokenledger.json");
        tokenledgerCoder = new ManifestCoder(tokenledgerManifest);
    });

    describe("encodeManifest", () => {
        test.each(FIXTURE_MANIFESTS)(
            "encodes $manifest to the expected POLO bytes",
            async ({ manifest: manifestPath, polo: poloPath }) => {
                const [manifest, expected] = await Promise.all([
                    loadManifestFromFile(manifestPath),
                    loadFile(poloPath),
                ]);

                expect(ManifestCoder.encodeManifest(manifest)).toBe(expected);
            }
        );
    });

    describe("decodeManifest (JSON format)", () => {
        test.each(FIXTURE_MANIFESTS)(
            "decodes $polo back to the original JSON manifest",
            async ({ manifest: manifestPath, polo: poloPath }) => {
                const [polo, expected] = await Promise.all([
                    loadFile(poloPath),
                    loadManifestFromFile(manifestPath),
                ]);

                expect(normalize(ManifestCoder.decodeManifest(polo, ManifestCoderFormat.JSON))).toEqual(
                    normalize(expected)
                );
            }
        );
    });

    describe("decodeManifest (YAML format) round-trip", () => {
        test.each(FIXTURE_MANIFESTS)(
            "POLO → YAML → POLO is lossless for $polo",
            async ({ polo: poloPath }) => {
                const polo = await loadFile(poloPath);
                const yaml = ManifestCoder.decodeManifest(polo, ManifestCoderFormat.YAML);

                expect(ManifestCoder.encodeManifest(yaml)).toBe(polo);
                expect(ManifestCoder.decodeManifest(polo, ManifestCoderFormat.YAML)).toEqual(yaml);
            }
        );
    });

    describe("encodeArguments", () => {
        test("encodes Seed(symbol, supply) to the correct POLO bytes", () => {
            const calldata = tokenledgerCoder.encodeArguments("Seed", "MOI", 100_000_000);
            expect(calldata).toBe("0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49");
        });

        test("is idempotent: calling twice with the same args produces identical output", () => {
            const first = tokenledgerCoder.encodeArguments("Seed", "MOI", 100_000_000);
            const second = tokenledgerCoder.encodeArguments("Seed", "MOI", 100_000_000);
            expect(first).toBe(second);
        });

        test("encodes a struct-typed argument (nested encoding fix)", () => {
            const manifest = {
                syntax: 1,
                engine: { kind: "PISA", flags: [], version: "0.5.0" },
                kind: "logic",
                elements: [
                    {
                        ptr: 0,
                        kind: "class",
                        data: {
                            name: "Point",
                            fields: [
                                { slot: 0, label: "x", type: "u64" },
                                { slot: 1, label: "y", type: "u64" },
                            ],
                            methods: null,
                        } as LogicManifest.Class,
                    },
                    {
                        ptr: 1,
                        kind: "callable",
                        data: {
                            name: "Move",
                            mode: "dynamic",
                            kind: "invoke",
                            accepts: [{ slot: 0, label: "point", type: "class.Point" }],
                            returns: [],
                            executes: { bin: [], hex: "", asm: [] },
                            catches: [],
                        } as LogicManifest.Routine,
                    },
                ],
            };

            const coder = new ManifestCoder(manifest as any);
            const point = { x: 10, y: 20 };

            const encoded = coder.encodeArguments("Move", point);
            expect(encoded).toBe("0x0d2f0655706f696e740d4f0615364578030a790314");
        });

        test("struct encoding is idempotent across multiple calls (regression for nested mutation bug)", () => {
            const manifest = {
                syntax: 1,
                engine: { kind: "PISA", flags: [], version: "0.5.0" },
                kind: "logic",
                elements: [
                    {
                        ptr: 0,
                        kind: "class",
                        data: { name: "Point", fields: [
                            { slot: 0, label: "x", type: "u64" },
                            { slot: 1, label: "y", type: "u64" },
                        ], methods: null } as LogicManifest.Class,
                    },
                    {
                        ptr: 1,
                        kind: "class",
                        data: { name: "Line", fields: [
                            { slot: 0, label: "start", type: "class.Point" },
                            { slot: 1, label: "end",   type: "class.Point" },
                        ], methods: null } as LogicManifest.Class,
                    },
                    {
                        ptr: 2,
                        kind: "callable",
                        data: {
                            name: "DrawLine",
                            mode: "dynamic",
                            kind: "invoke",
                            accepts: [{ slot: 0, label: "line", type: "class.Line" }],
                            returns: [],
                            executes: { bin: [], hex: "", asm: [] },
                            catches: [],
                        } as LogicManifest.Routine,
                    },
                ],
            };

            const coder = new ManifestCoder(manifest as any);
            const line = { start: { x: 0, y: 0 }, end: { x: 10, y: 20 } };

            const first  = coder.encodeArguments("DrawLine", line);
            const second = coder.encodeArguments("DrawLine", line);

            expect(first).toBe("0x0d2f06456c696e650d6f0635f601c502656e640d4f0615364578030a79031473746172740d4f0615263578037903");
            expect(first).toBe(second);
        });

        test("does not mutate the original argument object", () => {
            const manifest = {
                syntax: 1,
                engine: { kind: "PISA", flags: [], version: "0.5.0" },
                kind: "logic",
                elements: [
                    {
                        ptr: 0,
                        kind: "class",
                        data: { name: "Point", fields: [
                            { slot: 0, label: "x", type: "u64" },
                            { slot: 1, label: "y", type: "u64" },
                        ], methods: null } as LogicManifest.Class,
                    },
                    {
                        ptr: 1,
                        kind: "callable",
                        data: {
                            name: "Move",
                            mode: "dynamic",
                            kind: "invoke",
                            accepts: [{ slot: 0, label: "point", type: "class.Point" }],
                            returns: [],
                            executes: { bin: [], hex: "", asm: [] },
                            catches: [],
                        } as LogicManifest.Routine,
                    },
                ],
            };

            const coder = new ManifestCoder(manifest as any);
            const point = { x: 5, y: 7 };
            const pointSnapshot = { ...point };

            coder.encodeArguments("Move", point);

            expect(point).toEqual(pointSnapshot);
        });
    });

    describe("decodeArguments", () => {
        test("decodes POLO calldata back to the original argument values", () => {
            const calldata = "0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49";
            const decoded = tokenledgerCoder.decodeArguments<[string, number]>("Seed", calldata);

            expect(decoded).not.toBeNull();
            expect(decoded![0]).toBe("MOI");
            expect(decoded![1]).toBe(100_000_000);
        });

        test("returns null for a routine that accepts no arguments", () => {
            const decoded = tokenledgerCoder.decodeArguments("Decimals", "0x");
            expect(decoded).toBeNull();
        });
    });

    describe("decodeOutput", () => {
        test("decodes BalanceOf output to { balance: number }", () => {
            const calldata = "0x0e1f0305f5e100";
            const result = tokenledgerCoder.decodeOutput<{ balance: number }>("BalanceOf", calldata);
            expect(result).toEqual({ balance: expect.any(Number) });
        });
    });

    describe("decodeException", () => {
        test("decodes a POLO-encoded exception into a structured Exception object", () => {
            const error =
                "0x0e6f0666d104de04737472696e67696e73756666696369656e742062616c616e636520666f722073656e6465723f06e60172756e74696d652e726f6f742829726f7574696e652e5472616e736665722829205b3078635d202e2e2e205b307831623a205448524f57203078355d";

            expect(ManifestCoder.decodeException(error)).toEqual({
                class: "string",
                error: "insufficient balance for sender",
                revert: false,
                trace: ["runtime.root()", "routine.Transfer() [0xc] ... [0x1b: THROW 0x5]"],
            });
        });

        test("returns null for an empty or missing exception string", () => {
            expect(ManifestCoder.decodeException("")).toBeNull();
            expect(ManifestCoder.decodeException(null as any)).toBeNull();
        });
    });

    describe("decodeEventOutput", () => {
        test("decodes a builtin.Log event", () => {
            const log = "0x0d2f065576616c756506736565646564206239306633396663663334366261333236303531383636393439356635643336386138643162623830323335383466363765386135363731636633633536636520776974682031303030303030302044554d4d";
            const decoded = tokenledgerCoder.decodeEventOutput("builtin.Log", log);

            expect(decoded).not.toBeNull();
            expect(decoded).toEqual({ value: expect.any(String) });
        });

        test("decodes a Transfer event with sender, receiver, and amount", () => {
            const log = "0x0daf010665860185029606f506616d6f756e740364726563656976657206190f39fcf346ba3260518669495f5d368a8d1bb8023584f67e8a5671cf3c56ce73656e64657206b90f39fcf346ba3260518669495f5d368a8d1bb8023584f67e8a5671cf3c56ce";
            const decoded = tokenledgerCoder.decodeEventOutput("Transfer", log);

            expect(decoded).not.toBeNull();
            expect(decoded).toMatchObject({
                amount: expect.any(Number),
                receiver: expect.any(Uint8Array),
                sender: expect.any(Uint8Array),
            });
        });
    });
});

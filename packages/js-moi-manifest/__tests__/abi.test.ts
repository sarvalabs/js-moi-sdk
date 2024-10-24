import type { LogicManifest } from "../lib.cjs";
import { ManifestCoder } from "../src.ts/manifest";
import { loadFile, loadManifestFromFile } from "./utils/helper";

describe("Test ManifestCoder", () => {
    let manifest: LogicManifest.Manifest;
    let manifestCoder: ManifestCoder;

    beforeAll(async () => {
        manifest = await loadManifestFromFile("../../manifests/tokenledger.json") as LogicManifest.Manifest
        manifestCoder = new ManifestCoder(manifest);
    });


    test("Encode ABI/Manifest into polo format", async () => {
        const encodedABI = ManifestCoder.encodeManifest(await loadManifestFromFile("../../manifests/tokenledger.json"));
        expect(encodedABI).toBe(await loadFile("../../manifests/tokenledger-polo.txt"));
    });

    describe("Encode arguments into polo format", () => {
        test("When the field is passed as a routine name", () => {
            const calldata = manifestCoder.encodeArguments("Seed", "MOI", 100_000_000);

            expect(calldata).toBe("0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49");
        });

        test("When the field is passed as a routine schema", () => {
            const routineElement = manifest.elements.find((element: LogicManifest.Element) => {
                element.data = element.data as LogicManifest.Routine;
                return element.data.name === "Seed";
            });
            const routine = routineElement?.data as LogicManifest.Routine;
            const fields = routine.accepts ? routine.accepts : [];
            const calldata = manifestCoder.encodeArguments(fields, "MOI", 100_000_000);

            expect(calldata).toBe("0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49");
        });
    });

    describe("Decode polo encoded arguments", () => {
        test("When the field is passed as a routine name", () => {
            const calldata = "0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49";
            const args = ["MOI", 100_000_000];
            const decoded = manifestCoder.decodeArguments<[symbol: string, supply: number]>("Seed", calldata);

            for (let i = 0; i < args.length; i++) {
                expect(decoded[i]).toEqual(args[i]);
            }
        });

        test("When the field is passed as a routine schema", () => {
            const routineElement = manifest.elements.find((element: LogicManifest.Element) => {
                element.data = element.data as LogicManifest.Routine;
                return element.data.name === "Seed";
            });
            const calldata = "0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49"
            const routine = routineElement?.data as LogicManifest.Routine;
            const fields = routine.accepts ? routine.accepts : [];
            const args = ["MOI", 100000000];
            const decoded = manifestCoder.decodeArguments<[symbol: string, supply: number]>(fields, calldata);

            for (let i = 0; i < args.length; i++) {
                expect(decoded[i]).toEqual(args[i]);
            }
        });
    });

    describe("Decode polo encoded arguments", () => {
        const calldata = "0x0e1f0305f5e100";
        const callsite = "BalanceOf";

        test("When the field is passed as a routine name", () => {
            const args = manifestCoder.decodeOutput<{ balance: number }>(callsite, calldata);

            expect(args).toEqual({ balance: expect.any(Number) });
        });

        test("When the field is passed as a routine schema", () => {
            const output = "0x0e1f0305f5e100";
            const routineElement = manifest.elements.find((element: LogicManifest.Element) => {
                element.data = element.data as LogicManifest.Routine;
                return element.data.name === callsite;
            });
            const routine = routineElement?.data as LogicManifest.Routine;
            const fields = routine.returns ? routine.returns : [];
            const decodedOutput = manifestCoder.decodeOutput(fields, output);

            expect(decodedOutput).toEqual({ balance: expect.any(Number) });
        });
    });

    test("Decode polo encoded exception", () => {
        const error =
            "0x0e6f0666d104de04737472696e67696e73756666696369656e742062616c616e636520666f722073656e6465723f06e60172756e74696d652e726f6f742829726f7574696e652e5472616e736665722829205b3078635d202e2e2e205b307831623a205448524f57203078355d";
        const exception = ManifestCoder.decodeException(error);

        expect(exception).toBeDefined();
        expect(exception).toEqual({
            class: "string",
            error: "insufficient balance for sender",
            revert: false,
            trace: ["runtime.root()", "routine.Transfer() [0xc] ... [0x1b: THROW 0x5]"],
        });
    });

    test("Decode polo encoded property of a state", () => {
        const data = "0x0652494f";
        const state: any = manifest.elements.find((element) => element.kind === "state");
        const output = manifestCoder.decodeState(data, "Symbol", state?.data.fields);

        expect(output).toBe("RIO");
    });

    test("Decode event log", () => {
      const testTable = [
        {
          event: "builtin.Log",
          log: "0x0d2f065576616c756506736565646564206239306633396663663334366261333236303531383636393439356635643336386138643162623830323335383466363765386135363731636633633536636520776974682031303030303030302044554d4d",
          expected: {
            value: expect.any(String),
          },
        },
        {
            event: "Transfer",
            log: "0x0daf010665860185029606f506616d6f756e740364726563656976657206190f39fcf346ba3260518669495f5d368a8d1bb8023584f67e8a5671cf3c56ce73656e64657206b90f39fcf346ba3260518669495f5d368a8d1bb8023584f67e8a5671cf3c56ce",
            expected: {
              amount: expect.any(Number),
              receiver: expect.any(Uint8Array),
              sender: expect.any(Uint8Array),
            },
          },
      ];

      for (const test of testTable) {
        const decoded = manifestCoder.decodeEventOutput(test.event, test.log);
        expect(decoded).not.toBeNull();
        expect(decoded).toEqual(test.expected);
      }
    });
    
});

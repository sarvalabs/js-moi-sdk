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
            const args = ["MOI", 100_000_000];
            const calldata = manifestCoder.encodeArguments("Seeder", args);

            expect(calldata).toBe("0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49");
        });

        test("When the field is passed as a routine schema", () => {
            const routineElement = manifest.elements.find((element: LogicManifest.Element) => {
                element.data = element.data as LogicManifest.Routine;
                return element.data.name === "Seeder";
            });
            const routine = routineElement?.data as LogicManifest.Routine;
            const fields = routine.accepts ? routine.accepts : [];
            const args = ["MOI", 100000000];
            const calldata = manifestCoder.encodeArguments(fields, args);

            expect(calldata).toBe("0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49");
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
        const output = manifestCoder.decodeState(data, "symbol", state?.data.fields);

        expect(output).toBe("RIO");
    });

    
});

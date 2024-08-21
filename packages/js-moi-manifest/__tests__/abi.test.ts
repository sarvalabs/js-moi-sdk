import type { LogicManifest } from "../lib.cjs";
import { ManifestCoder } from "../src.ts/manifest";
import { loadFile, loadManifestFromFile } from "./utils/helper";

describe("Test ManifestCoder", () => {
    const elements = new Map();
    const classDefs = new Map();
    let manifest: LogicManifest.Manifest;

    beforeAll(async () => {
        manifest = await loadManifestFromFile("../../manifests/tokenledger.json");

        manifest.elements.forEach((element: LogicManifest.Element) => {
            elements.set(element.ptr, element);

            if (element.kind === "class") {
                element.data = element.data as LogicManifest.Routine;
                classDefs.set(element.data.name, element.ptr);
            }
        });
    });

    const manifestCoder = new ManifestCoder(elements, classDefs);

    test("Encode ABI/Manifest into polo format", async () => {
        const encodedABI = ManifestCoder.encodeManifest(await loadManifestFromFile("../../manifests/tokenledger.json"));
        expect(encodedABI).toBe(await loadFile("../../manifests/tokenledger-polo.txt"));
    });

    test("Encode arguments into polo format", () => {
        const DEPLOYER_ROUTINE = "Seed"
        const routineElement = manifest.elements.find((element: LogicManifest.Element) => {
            element.data = element.data as LogicManifest.Routine;
            return element.data.name === DEPLOYER_ROUTINE;
        });
        const routine = routineElement?.data as LogicManifest.Routine;
        const fields = routine.accepts ? routine.accepts : [];
        const args = ["MOI", 100000000];
        const calldata = manifestCoder.encodeArguments(fields, args);

        expect(routine).toBeDefined();
        expect(calldata).toBe("0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49");
    });

    test("Decode polo encoded output", () => {
        const output = "0x0e1f0305f5e100";

        const routineElement = manifest.elements.find((element: LogicManifest.Element) => {
            element.data = element.data as LogicManifest.Routine;
            return element.data.name === "BalanceOf";
        });

        const routine = routineElement?.data as LogicManifest.Routine;

        const fields = routine.returns ? routine.returns : [];

        const decodedOutput = manifestCoder.decodeOutput(output, fields);

        expect(decodedOutput).toEqual({ balance: 100000000 });
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
});

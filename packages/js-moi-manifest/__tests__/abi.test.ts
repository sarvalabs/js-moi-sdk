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
        const encodedABI = ManifestCoder.encodeManifest(await loadManifestFromFile("../../manifests/guardian-registry.json"));
        expect(encodedABI).toBe(await loadFile("../../manifests/guardian-registry-polo.txt"));
    });

    test("Encode arguments into polo format", () => {
        const routineElement = manifest.elements.find((element: LogicManifest.Element) => {
            element.data = element.data as LogicManifest.Routine;
            return element.data.name === "Seeder";
        });
        const routine = routineElement?.data as LogicManifest.Routine;
        const fields = routine.accepts ? routine.accepts : [];
        const args = ["MOI-Token", "MOI", 100000000, "ffcd8ee6a29ec442dbbf9c6124dd3aeb833ef58052237d521654740857716b34"];
        const calldata = manifestCoder.encodeArguments(fields, args);

        expect(routine).toBeDefined();
        expect(calldata).toBe(
            "0x0def010645e601c502d606b5078608e5086e616d65064d4f492d546f6b656e73656564657206ffcd8ee6a29ec442dbbf9c6124dd3aeb833ef58052237d521654740857716b34737570706c790305f5e10073796d626f6c064d4f49"
        );
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
        const error = "0x0e4f0666ae03737472696e67536f6d657468696e672077656e742077726f6e673f06b60166756e6374696f6e31282966756e6374696f6e322829";
        const exception = ManifestCoder.decodeException(error);

        expect(exception).toEqual({
            class: "string",
            data: "Something went wrong",
            trace: ["function1()", "function2()"],
        });
    });

    test("Decode polo encoded property of a state", () => {
        const data = "0x0652494f";
        const state: any = manifest.elements.find((element) => element.kind === "state");
        const output = manifestCoder.decodeState(data, "symbol", state?.data.fields);

        expect(output).toBe("RIO");
    });
});

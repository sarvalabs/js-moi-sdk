import { type LogicManifest } from "../lib.cjs";
import { ManifestCoder } from "../src.ts/manifest";
import { ManifestFormat } from "../src.ts/manifest-format";
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

    test("it should encode ABI/Manifest into polo format", async () => {
        const testcases = [
            {
                manifest: "../../manifests/tokenledger.json",
                expected: "../../manifests/tokenledger-polo.txt",
            },
            {
                manifest: "../../manifests/flipper.json",
                expected: "../../manifests/flipper-polo.txt",
            },
            {
                manifest: "../../manifests/guardian.json",
                expected: "../../manifests/guardian-polo.txt",
            }
        ]


        await Promise.all(testcases.map(async (testCase) => {
            const [manifest, expected] = await Promise.all([
                loadManifestFromFile(testCase.manifest),
                loadFile(testCase.expected),
            ]);
            const polo = ManifestCoder.encodeManifest(manifest);

            expect(polo).toBe(expected);
        }));
    });

    test("it should encode arguments into polo format", () => {
        const routineElement = manifest.elements.find((element: LogicManifest.Element) => {
            element.data = element.data as LogicManifest.Routine;
            return element.data.name === "Seeder";
        });
        const routine = routineElement?.data as LogicManifest.Routine;
        const fields = routine.accepts ? routine.accepts : [];
        const args = ["MOI", 100000000];
        const calldata = manifestCoder.encodeArguments(fields, args);

        expect(routine).toBeDefined();
        expect(calldata).toBe("0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49");
    });

    test("it should decode polo encoded output", () => {
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

    test("it should polo encoded exception", () => {
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

    test("it should decode polo encoded property of a state", () => {
        const data = "0x0652494f";
        const state: any = manifest.elements.find((element) => element.kind === "state");
        const output = manifestCoder.decodeState(data, "symbol", state?.data.fields);

        expect(output).toBe("RIO");
    });

    test("it should decode polo-encoded manifest", async () => {
        const testCases = [
            {
                manifest: "../../manifests/tokenledger-polo.txt",
                expected: "../../manifests/tokenledger.json",
            },
            {
                manifest: "../../manifests/flipper-polo.txt",
                expected: "../../manifests/flipper.json",
            },
            {
                manifest: "../../manifests/guardian-polo.txt",
                expected: "../../manifests/guardian.json",
            }
        ];

        await Promise.all(testCases.map(async (testCase) => {
            const [polo, expected] = await Promise.all([
                loadFile(testCase.manifest),
                loadManifestFromFile(testCase.expected),
            ]);

            const manifest = ManifestCoder.decodeManifest(polo, ManifestFormat.JSON);
            expect(manifest).toEqual(expected);
        }));
    });
});

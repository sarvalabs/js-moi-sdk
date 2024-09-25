import { Schema } from "../src.ts/schema";
import { LogicManifest } from "../types/manifest";
import { loadManifestFromFile } from "./utils/helper";

describe("Test Schema", () => {
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

    const schema = new Schema(elements, classDefs);

    test("Parse fields and create schema", () => {
        const stateElement = manifest.elements.find((element) => element.kind === "state");
        const state = stateElement?.data as LogicManifest.State;
        const stateSchema = schema.parseFields(state.fields);

        expect(stateSchema).toEqual({
            kind: "struct",
            fields: {
                Symbol: {
                    kind: "string",
                },
                Supply: {
                    kind: "integer",
                },
                Balances: {
                    kind: "map",
                    fields: {
                        keys: {
                            kind: "bytes",
                        },
                        values: {
                            kind: "integer",
                        },
                    },
                },
            },
        });
    });
});

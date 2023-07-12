import { Schema } from "../src/schema";
import manifest from "../manifests/erc20.json";
import { LogicManifest } from "../types/manifest";

describe("Test Schema", () => {
    const elements = new Map();
    const classDefs = new Map();

    manifest.elements.forEach((element: LogicManifest.Element) => {
        elements.set(element.ptr, element);

        if(element.kind === "class") {
            element.data = element.data as LogicManifest.Routine;
            classDefs.set(element.data.name, element.ptr);
        }
    })

    const schema = new Schema(elements, classDefs);

    test("Parse fields and create schema", () => {
        const stateElement = manifest.elements.find(element =>
            element.kind === "state"
        )

        const state = stateElement?.data as LogicManifest.State;

        const stateSchema = schema.parseFields(state.fields);

        expect(stateSchema).toEqual({
            kind: 'struct',
            fields: {
              name: { kind: 'string' },
              symbol: { kind: 'string' },
              supply: { kind: 'integer' },
              balances: {
                kind: 'map',
                fields: { keys: { kind: 'bytes' }, values: { kind: 'integer' } }
              },
              allowances: {
                kind: 'map',
                fields: {
                  keys: { kind: 'bytes' },
                  values: {
                    kind: 'map',
                    fields: { keys: { kind: 'bytes' }, values: { kind: 'integer' } }
                  }
                }
              }
            }
        })
    })
})

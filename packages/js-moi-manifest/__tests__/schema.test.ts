import { isPrimitiveType, Schema } from "../src.ts/schema";
import type { LogicManifest } from "../types/manifest";
import { loadManifestFromFile } from "./utils/helper";

describe("Schema", () => {
    let manifest: LogicManifest.Manifest;
    let elements: Map<number, LogicManifest.Element>;
    let classDefs: Map<string, number>;
    let schema: Schema;

    beforeAll(async () => {
        manifest = await loadManifestFromFile("../../manifests/tokenledger.json");

        elements = new Map();
        classDefs = new Map();

        manifest.elements.forEach((element) => {
            elements.set(element.ptr, element);
            if (element.kind === "class") {
                const classData = element.data as LogicManifest.Class;
                classDefs.set("class." + classData.name, element.ptr);
            }
        });

        schema = new Schema(elements, classDefs);
    });

    describe("isPrimitiveType", () => {
        const primitives = ["null", "bool", "bytes", "identifier", "string", "u64", "u256", "i64", "i256", "bigint"];

        test.each(primitives)("returns true for '%s'", (type) => {
            expect(isPrimitiveType(type)).toBe(true);
        });

        test("returns false for 'address' (renamed to identifier)", () => {
            expect(isPrimitiveType("address")).toBe(false);
        });

        test("returns false for unknown types", () => {
            expect(isPrimitiveType("class.Foo")).toBe(false);
            expect(isPrimitiveType("map[string]u64")).toBe(false);
            expect(isPrimitiveType("[]u64")).toBe(false);
        });
    });

    describe("static schemas", () => {
        test("PISA_LITERAL_SCHEMA exists (replaced PISA_CONSTANT_SCHEMA)", () => {
            expect(Schema.PISA_LITERAL_SCHEMA).toBeDefined();
            expect(Schema.PISA_LITERAL_SCHEMA.kind).toBe("struct");
            expect(Schema.PISA_LITERAL_SCHEMA.fields).toHaveProperty("type");
            expect(Schema.PISA_LITERAL_SCHEMA.fields).toHaveProperty("value");
        });

        test("PISA_EXTERN_SCHEMA exists with name, logic, actor, and endpoint fields", () => {
            expect(Schema.PISA_EXTERN_SCHEMA).toBeDefined();
            expect(Schema.PISA_EXTERN_SCHEMA.kind).toBe("struct");
            const fields = Schema.PISA_EXTERN_SCHEMA.fields as Record<string, unknown>;
            expect(fields).toHaveProperty("name");
            expect(fields).toHaveProperty("logic");
            expect(fields).toHaveProperty("actor");
            expect(fields).toHaveProperty("endpoint");
        });

        test("PISA_ASSET_SCHEMA exists with an engine field", () => {
            expect(Schema.PISA_ASSET_SCHEMA).toBeDefined();
            expect(Schema.PISA_ASSET_SCHEMA.kind).toBe("struct");
            const fields = Schema.PISA_ASSET_SCHEMA.fields as Record<string, unknown>;
            expect(fields).toHaveProperty("engine");
        });

        test("PISA_ENGINE_SCHEMA includes a version field", () => {
            expect(Schema.PISA_ENGINE_SCHEMA).toBeDefined();
            const fields = Schema.PISA_ENGINE_SCHEMA.fields as Record<string, unknown>;
            expect(fields).toHaveProperty("version");
        });
    });

    describe("parseDataType", () => {
        test("'identifier' maps to bytes (same as 'bytes')", () => {
            const result = Schema.parseDataType("identifier", classDefs, elements);
            expect(result).toEqual({ kind: "bytes" });
        });

        test("'string' maps to string", () => {
            expect(Schema.parseDataType("string", classDefs, elements)).toEqual({ kind: "string" });
        });

        test("'u64' maps to integer", () => {
            expect(Schema.parseDataType("u64", classDefs, elements)).toEqual({ kind: "integer" });
        });

        test("'bool' maps to bool", () => {
            expect(Schema.parseDataType("bool", classDefs, elements)).toEqual({ kind: "bool" });
        });

        test("'bytes' maps to bytes", () => {
            expect(Schema.parseDataType("bytes", classDefs, elements)).toEqual({ kind: "bytes" });
        });

        test("array type maps to an array schema with a values sub-schema", () => {
            const result = Schema.parseDataType("[]u64", classDefs, elements);
            expect(result).toEqual({
                kind: "array",
                fields: { values: { kind: "integer" } },
            });
        });

        test("map type maps to a map schema with keys and values sub-schemas", () => {
            const result = Schema.parseDataType("map[identifier]u256", classDefs, elements);
            expect(result).toEqual({
                kind: "map",
                fields: {
                    keys: { kind: "bytes" },
                    values: { kind: "integer" },
                },
            });
        });

        test("throws for an unsupported primitive type", () => {
            expect(() =>
                Schema.parseDataType("unknown_type", classDefs, elements)
            ).toThrow();
        });
    });

    describe("parseFields", () => {
        test("generates a struct schema from the tokenledger persistent state fields", () => {
            const stateElement = manifest.elements.find((el) => el.kind === "state");
            const state = stateElement?.data as LogicManifest.State;

            expect(schema.parseFields(state.fields)).toEqual({
                kind: "struct",
                fields: {
                    Symbol: { kind: "string" },
                    Supply: { kind: "integer" },
                    Balances: {
                        kind: "map",
                        fields: {
                            keys: { kind: "bytes" },
                            values: { kind: "integer" },
                        },
                    },
                },
            });
        });

        test("returns an empty struct schema for an empty fields array", () => {
            expect(schema.parseFields([])).toEqual({ kind: "struct", fields: {} });
        });

        test("throws when fields is not an array", () => {
            expect(() => schema.parseFields(null as any)).toThrow();
        });

        test("throws when a field is missing a label or type", () => {
            expect(() => schema.parseFields([{ slot: 0 } as any])).toThrow();
        });
    });
});

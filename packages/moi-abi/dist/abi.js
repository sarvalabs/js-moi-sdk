"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ABICoder = void 0;
const js_polo_1 = require("js-polo");
const schema_1 = require("./schema");
const moi_utils_1 = require("moi-utils");
class ABICoder {
    static encodeABI(manifest) {
        const polorizer = new js_polo_1.Polorizer();
        polorizer.polorizeString(manifest.syntax);
        polorizer.polorize(manifest.engine, schema_1.Schema.PISA_ENGINE_SCHEMA);
        if (manifest.elements) {
            const elements = new js_polo_1.Polorizer();
            manifest.elements.forEach((value) => {
                const element = new js_polo_1.Polorizer();
                element.polorizeInteger(value.ptr);
                element.polorizeString(value.kind);
                element.polorize(value.deps, schema_1.Schema.PISA_DEPS_SCHEMA);
                switch (value.kind) {
                    case "constant":
                        element.polorize(value.data, schema_1.Schema.PISA_CONSTANT_SCHEMA);
                        break;
                    case "typedef":
                        element.polorize(value.data, schema_1.Schema.PISA_TYPEDEF_SCHEMA);
                        break;
                    case "routine":
                        element.polorize(value.data, schema_1.Schema.PISA_ROUTINE_SCHEMA);
                        break;
                    case "state":
                        element.polorize(value.data, schema_1.Schema.PISA_STATE_SCHEMA);
                        break;
                    default:
                        throw new Error("Unsupported kind");
                }
                elements.polorizePacked(element);
            });
            polorizer.polorizePacked(elements);
        }
        const bytes = polorizer.bytes();
        return (0, moi_utils_1.bytesToHex)(bytes);
    }
    static parseCalldata(schema, arg) {
        if (schema.kind === "bytes" && typeof arg === "string") {
            return (0, moi_utils_1.hexToBytes)(arg);
        }
        else if (schema.kind === "array" && ["bytes", "array", "map"].includes(schema.fields.values.kind)) {
            return arg.map(value => this.parseCalldata(schema.fields.values, value));
        }
        else if (schema.kind === "map" && (["bytes", "array", "map"].includes(schema.fields.keys.kind) ||
            ["bytes", "array", "map"].includes(schema.fields.values.kind))) {
            const map = new Map();
            // Loop through the entries of the Map
            for (const [key, value] of arg.entries()) {
                map.set(this.parseCalldata(schema.fields.keys, key), this.parseCalldata(schema.fields.values, value));
            }
            return map;
        }
        return arg;
    }
    static encodeArguments(fields, args) {
        const schema = schema_1.Schema.parseFields(fields);
        let calldata = {};
        Object.values(fields).forEach((field) => {
            calldata[field.label] = this.parseCalldata(schema.fields[field.label], args[field.slot]);
        });
        const document = (0, js_polo_1.documentEncode)(calldata, schema);
        const bytes = document.bytes();
        const data = (0, moi_utils_1.bytesToHex)(new Uint8Array(bytes));
        return data;
    }
}
exports.ABICoder = ABICoder;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ABICoder = void 0;
const js_polo_1 = require("js-polo");
const schema_1 = require("./schema");
const moi_utils_1 = require("moi-utils");
class ABICoder {
    schema;
    constructor(elements, classDefs) {
        this.schema = new schema_1.Schema(elements, classDefs);
    }
    static encodeABI(manifest) {
        const polorizer = new js_polo_1.Polorizer();
        polorizer.polorizeString(manifest.syntax);
        polorizer.polorize(manifest.engine, schema_1.Schema.PISA_ENGINE_SCHEMA);
        if (manifest.elements) {
            const elements = new js_polo_1.Polorizer();
            manifest.elements.forEach((value) => {
                const element = new js_polo_1.Polorizer();
                element.polorizeInteger(value.ptr);
                element.polorize(value.deps, schema_1.Schema.PISA_DEPS_SCHEMA);
                element.polorizeString(value.kind);
                switch (value.kind) {
                    case "constant":
                        element.polorize(value.data, schema_1.Schema.PISA_CONSTANT_SCHEMA);
                        break;
                    case "typedef":
                        element.polorize(value.data, schema_1.Schema.PISA_TYPEDEF_SCHEMA);
                        break;
                    case "class":
                        element.polorize(value.data, schema_1.Schema.PISA_CLASS_SCHEMA);
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
        return "0x" + (0, moi_utils_1.bytesToHex)(bytes);
    }
    parseCalldata(schema, arg) {
        if (schema.kind === "bytes" && typeof arg === "string") {
            return (0, moi_utils_1.hexToBytes)(arg);
        }
        else if (schema.kind === "array" && ["bytes", "array", "map", "struct"].includes(schema.fields.values.kind)) {
            return arg.map(value => this.parseCalldata(schema.fields.values, value));
        }
        else if (schema.kind === "map" && (["bytes", "array", "map", "struct"].includes(schema.fields.keys.kind) ||
            ["bytes", "array", "map"].includes(schema.fields.values.kind))) {
            const map = new Map();
            // Loop through the entries of the Map
            for (const [key, value] of arg.entries()) {
                map.set(this.parseCalldata(schema.fields.keys, key), this.parseCalldata(schema.fields.values, value));
            }
            return map;
        }
        else if (schema.kind === "struct") {
            const doc = (0, js_polo_1.documentEncode)(arg, schema);
            schema.kind = "document";
            delete schema.fields;
            return doc.document;
        }
        return arg;
    }
    encodeArguments(fields, args) {
        const schema = this.schema.parseFields(fields);
        const calldata = {};
        Object.values(fields).forEach((field) => {
            calldata[field.label] = this.parseCalldata(schema.fields[field.label], args[field.slot]);
        });
        const document = (0, js_polo_1.documentEncode)(calldata, schema);
        const bytes = document.bytes();
        const data = "0x" + (0, moi_utils_1.bytesToHex)(new Uint8Array(bytes));
        return data;
    }
    decodeOutput(output, fields) {
        if (output) {
            const decodedOutput = (0, moi_utils_1.hexToBytes)(output);
            const depolorizer = new js_polo_1.Depolorizer(decodedOutput);
            const schema = this.schema.parseFields(fields);
            return depolorizer.depolorize(schema);
        }
        return null;
    }
    static decodeException(error) {
        if (error) {
            const decodedError = (0, moi_utils_1.hexToBytes)(error);
            const depolorizer = new js_polo_1.Depolorizer(decodedError);
            const exception = depolorizer.depolorize(schema_1.Schema.PISA_EXCEPTION_SCHEMA);
            return exception;
        }
        return null;
    }
    decodeState(data, field, fields) {
        const decodedData = (0, moi_utils_1.hexToBytes)(data);
        const depolorizer = new js_polo_1.Depolorizer(decodedData);
        const schema = this.schema.parseFields(fields);
        return depolorizer.depolorize(schema.fields[field]);
    }
}
exports.ABICoder = ABICoder;

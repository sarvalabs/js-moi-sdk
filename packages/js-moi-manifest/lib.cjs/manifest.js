"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManifestCoder = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_polo_1 = require("js-polo");
const manifest_format_1 = require("./manifest-format");
const schema_1 = require("./schema");
/**
 * ManifestCoder is a class that provides encoding and decoding functionality
 * for Logic Interface.It allows encoding manifests and arguments, as well as
 * decoding output, exceptions and logic states based on both a predefined and
 * runtime schema.
 *
 * @class
 */
class ManifestCoder {
    schema;
    constructor(elements, classDefs) {
        this.schema = new schema_1.Schema(elements, classDefs);
    }
    /**
     * Encodes a logic manifest into POLO format. The manifest is processed and
     * serialized according to the predefined schema.
     * Returns the POLO-encoded data as a hexadecimal string prefixed with "0x".
     *
     * @static
     * @param {LogicManifest.Manifest} manifest - The logic manifest to encode.
     * @returns {string} The POLO-encoded data.
     */
    static encodeManifest(manifest) {
        const polorizer = new js_polo_1.Polorizer();
        polorizer.polorizeInteger(manifest.syntax);
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
                    case "method":
                        element.polorize(value.data, schema_1.Schema.PISA_METHOD_SCHEMA);
                        break;
                    case "routine":
                        element.polorize(value.data, schema_1.Schema.PISA_ROUTINE_SCHEMA);
                        break;
                    case "event":
                        element.polorize(value.data, schema_1.Schema.PISA_EVENT_SCHEMA);
                        break;
                    case "state":
                        element.polorize(value.data, schema_1.Schema.PISA_STATE_SCHEMA);
                        break;
                    default:
                        js_moi_utils_1.ErrorUtils.throwError(`Unsupported kind: ${value.kind}`, js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
                }
                elements.polorizePacked(element);
            });
            polorizer.polorizePacked(elements);
        }
        const bytes = polorizer.bytes();
        return "0x" + (0, js_moi_utils_1.bytesToHex)(bytes);
    }
    /**
     * Parses the calldata arguments based on the provided POLO Schema.
     * The calldata arguments is recursively processed and transformed according to the schema.
     *
     * @private
     * @param {PoloSchema} schema - The schema definition for the calldata.
     * @param {*} arg - The calldata argument to parse.
     * @param {boolean} [updateType=true] - Indicates whether to update the schema type during parsing.
     * @returns {*} The parsed calldata argument.
     */
    parseCalldata(schema, arg, updateType = true) {
        const parsableKinds = ["bytes", "array", "map", "struct"];
        const reconstructSchema = (schema) => {
            Object.keys(schema.fields).forEach(key => {
                if (schema.fields[key].kind === "struct") {
                    schema.fields[key].kind = "document";
                }
            });
            return schema;
        };
        const parseArray = (schema, arg) => {
            return arg.map((value, index) => this.parseCalldata(schema, value, arg.length - 1 === index));
        };
        const parseMap = (schema, arg) => {
            const map = new Map();
            const entries = Array.from(arg.entries());
            // Loop through the entries of the Map
            entries.forEach((entry, index) => {
                const [key, value] = entry;
                map.set(this.parseCalldata(schema.fields.keys, key, entries.length - 1 === index), this.parseCalldata(schema.fields.values, value, entries.length - 1 === index));
            });
            return map;
        };
        const parseStruct = (schema, arg, updateType) => {
            Object.keys(arg).forEach(key => {
                arg[key] = this.parseCalldata(schema.fields[key], arg[key], false);
            });
            const doc = (0, js_polo_1.documentEncode)(arg, reconstructSchema((0, js_moi_utils_1.deepCopy)(schema)));
            if (updateType) {
                schema.kind = "document";
                delete schema.fields;
            }
            return doc.getData();
        };
        switch (schema.kind) {
            case "string":
                return (0, js_moi_utils_1.trimHexPrefix)(arg);
            case "bytes":
                if (typeof arg === "string") {
                    return (0, js_moi_utils_1.hexToBytes)(arg);
                }
                break;
            case "array":
                if (parsableKinds.includes(schema.fields.values.kind)) {
                    return parseArray(schema.fields.values, arg);
                }
                break;
            case "map":
                if ((parsableKinds.includes(schema.fields.keys.kind) ||
                    parsableKinds.includes(schema.fields.values.kind))) {
                    return parseMap(schema, arg);
                }
                break;
            case "struct":
                return parseStruct(schema, arg, updateType);
            default:
                break;
        }
        return arg;
    }
    /**
     * Encodes the provided arguments based on the given manifest routine
     * parmeters and its types (the accepts property in routine).
     *
     * The arguments are mapped to their corresponding fields, and the calldata
     * is generated by parsing and encoding the arguments based on the dynamically
     * created schema from fields.
     *
     * @param {LogicManifest.TypeField[]} fields - The fields associated with the
     routine parameters (arguments).
     * @param {any[]} args - The arguments to encode.
     * @returns {string} The POLO-encoded calldata as a hexadecimal string
     prefixed with "0x".
     */
    encodeArguments(fields, args) {
        const schema = this.schema.parseFields(fields);
        const calldata = {};
        Object.values(fields).forEach((field) => {
            calldata[field.label] = this.parseCalldata(schema.fields[field.label], args[field.slot]);
        });
        const document = (0, js_polo_1.documentEncode)(calldata, schema);
        const bytes = document.bytes();
        const data = "0x" + (0, js_moi_utils_1.bytesToHex)(new Uint8Array(bytes));
        return data;
    }
    /**
     * Decodes the output data returned from a logic routine call.
     * The output data is decoded using the provided fields and schema.
     * Returns the decoded output data as an unknown type, or null if the output is empty.
     *
     * @param {string} output - The output data to decode, represented as a
     hexadecimal string prefixed with "0x".
     * @param {LogicManifest.TypeField[]} fields - The fields associated with the output data.
     * @returns {unknown | null} The decoded output data, or null if the output is empty.
     */
    decodeOutput(output, fields) {
        if (output && output != "0x" && fields && fields.length) {
            const decodedOutput = (0, js_moi_utils_1.hexToBytes)(output);
            const depolorizer = new js_polo_1.Depolorizer(decodedOutput);
            const schema = this.schema.parseFields(fields);
            return depolorizer.depolorize(schema);
        }
        return null;
    }
    /**
     * Decodes an exception thrown by a logic routine call.
     * The exception data is decoded using the predefined exception schema.
     * Returns the decoded exception object, or null if the error is empty.
     *
     * @param {string} error - The error data to decode, represented as a
     hexadecimal string prefixed with "0x".
     * @returns {Exception | null} The decoded exception object, or null if
     the error is empty.
     */
    static decodeException(error) {
        if (error && error !== "0x") {
            const decodedError = (0, js_moi_utils_1.hexToBytes)(error);
            const depolorizer = new js_polo_1.Depolorizer(decodedError);
            return depolorizer.depolorize(schema_1.Schema.PISA_EXCEPTION_SCHEMA);
        }
        return null;
    }
    /**
     * Decodes a specific state field from the data retrieved from a logic.
     * The state data is decoded using the provided fields and schema.
     * Returns the decoded value of the specified field, or null if the data is empty.
     *
     * @param {string} data - The state data to decode, represented as a
     hexadecimal string prefixed with "0x".
     * @param {string} field - The field to be decoded from the state data.
     * @param {LogicManifest.TypeField[]} fields - The fields associated with the state data.
     * @returns {unknown | null} The decoded value of the specified field, or
     null if the data is empty.
     */
    decodeState(data, field, fields) {
        if (data && data != "0x") {
            const decodedData = (0, js_moi_utils_1.hexToBytes)(data);
            const depolorizer = new js_polo_1.Depolorizer(decodedData);
            const schema = this.schema.parseFields(fields);
            return depolorizer.depolorize(schema.fields[field]);
        }
        return null;
    }
    /**
     * Converts a manifest hash to JSON representation.
     *
     * @param manifest - The manifest hash as a Uint8Array.
     * @returns The JSON representation of the manifest.
     */
    static fromManifestHashToJson(manifest) {
        const decoded = new js_polo_1.Depolorizer(manifest).depolorize(this.MANIFEST_SCHEMA);
        for (let i = 0; i < decoded.elements.length; i += 1) {
            const element = decoded.elements[i];
            if (element.deps.length == 0) {
                delete element.deps;
            }
            let buff = null;
            let schema = null;
            switch (element.kind) {
                case "constant": {
                    buff = new Uint8Array([
                        js_polo_1.WireType.WIRE_PACK,
                        ...element.data,
                    ]);
                    schema = schema_1.Schema.PISA_CONSTANT_SCHEMA;
                    break;
                }
                case "typedef": {
                    buff = new Uint8Array([
                        js_polo_1.WireType.WIRE_WORD,
                        ...element.data,
                    ]);
                    schema = schema_1.Schema.PISA_TYPEDEF_SCHEMA;
                    break;
                }
                case "state": {
                    buff = new Uint8Array([
                        js_polo_1.WireType.WIRE_PACK,
                        ...element.data,
                    ]);
                    schema = schema_1.Schema.PISA_STATE_SCHEMA;
                    break;
                }
                case "routine": {
                    buff = new Uint8Array([
                        js_polo_1.WireType.WIRE_PACK,
                        ...element.data,
                    ]);
                    schema = schema_1.Schema.PISA_ROUTINE_SCHEMA;
                    break;
                }
                case "method": {
                    buff = new Uint8Array([
                        js_polo_1.WireType.WIRE_PACK,
                        ...element.data,
                    ]);
                    schema = schema_1.Schema.PISA_METHOD_SCHEMA;
                    break;
                }
                case "class": {
                    buff = new Uint8Array([
                        js_polo_1.WireType.WIRE_PACK,
                        ...element.data,
                    ]);
                    schema = schema_1.Schema.PISA_CLASS_SCHEMA;
                    break;
                }
                case "event": {
                    buff = new Uint8Array([
                        js_polo_1.WireType.WIRE_PACK,
                        ...element.data,
                    ]);
                    schema = schema_1.Schema.PISA_EVENT_SCHEMA;
                    break;
                }
                default:
                    js_moi_utils_1.ErrorUtils.throwError(`Unsupported kind: ${element.kind}`, js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
            }
            if (schema == null || buff == null) {
                js_moi_utils_1.ErrorUtils.throwError("Invalid schema or buffer", js_moi_utils_1.ErrorCode.UNEXPECTED_ARGUMENT);
            }
            const polo = new js_polo_1.Depolorizer(buff);
            element.data = polo.depolorize(schema);
            if (["routine", "method"].includes(element.kind)) {
                for (const [key, value] of Object.entries(element.data.executes)) {
                    // If value of `Instruction[key]` is empty, remove it
                    if (value === "") {
                        delete element.data.executes[key];
                    }
                    // If value of `Instruction` is empty, remove it
                    if (Array.isArray(value) && value.length === 0) {
                        delete element.data.executes[key];
                    }
                    // Required to convert Uint8Array to integer array
                    if (value instanceof Uint8Array) {
                        element.data.executes[key] = Array.from(value);
                    }
                }
            }
        }
        return decoded;
    }
    /**
     * Decodes a POLO encoded manifest into a `LogicManifest.Manifest` object.
     *
     * @param {string | Uint8Array} manifest - The manifest `string` or `Uint8Array` to decode.
     * @param {ManifestFormat} format - The format of the manifest.
     * @returns {LogicManifest.Manifest} The decoded `LogicManifest.Manifest` object
     *
     * @throws {Error} If the manifest is invalid or the format is unsupported.
     */
    static decodeManifest(manifest, format) {
        if (typeof manifest === "string") {
            if (!(0, js_moi_utils_1.isHex)(manifest)) {
                js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid manifest", "manifest", manifest);
            }
            manifest = (0, js_moi_utils_1.hexToBytes)(manifest);
        }
        if (format === manifest_format_1.ManifestFormat.JSON) {
            return this.fromManifestHashToJson(manifest);
        }
        js_moi_utils_1.ErrorUtils.throwArgumentError("Unsupported format", "format", format);
    }
    static MANIFEST_SCHEMA = {
        kind: "struct",
        fields: {
            syntax: {
                kind: "integer",
            },
            engine: schema_1.Schema.PISA_ENGINE_SCHEMA,
            elements: {
                kind: "array",
                fields: {
                    values: {
                        kind: "struct",
                        fields: {
                            ptr: {
                                kind: "integer",
                            },
                            deps: schema_1.Schema.PISA_DEPS_SCHEMA,
                            kind: {
                                kind: "string",
                            },
                            data: {
                                kind: "raw",
                            }
                        },
                    },
                },
            },
        },
    };
}
exports.ManifestCoder = ManifestCoder;
//# sourceMappingURL=manifest.js.map
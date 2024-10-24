"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManifestCoder = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_polo_1 = require("js-polo");
const element_descriptor_1 = require("./element-descriptor");
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
    elementDescriptor;
    /**
     * Creates an instance of ManifestCoder.
     */
    constructor(manifest) {
        this.elementDescriptor = new element_descriptor_1.ElementDescriptor(manifest.elements);
    }
    get schema() {
        return new schema_1.Schema(this.elementDescriptor.getElements(), this.elementDescriptor.getClassDefs());
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
     *
     * The arguments are mapped to their corresponding fields, and the calldata
     * is generated by parsing and encoding the arguments based on the dynamically
     * created schema from fields.
     *
     * @param {(LogicManifest.Routine | string)} routine - The routine object or name of it
     * @param {any[]} args - The arguments to encode.
     * @returns {string} The POLO-encoded calldata as a hexadecimal string prefixed with "0x".
     */
    encodeArguments(routine, ...args) {
        let fields;
        if (typeof routine === "string") {
            const element = this.elementDescriptor.getRoutineElement(routine).data;
            fields = element.accepts;
        }
        else {
            fields = routine.accepts;
        }
        const schema = this.schema.parseFields(fields ?? []);
        const calldata = Object.values(fields).reduce((acc, field) => {
            acc[field.label] = this.parseCalldata(schema.fields[field.label], args[field.slot]);
            return acc;
        }, {});
        return "0x" + (0, js_moi_utils_1.bytesToHex)(((0, js_polo_1.documentEncode)(calldata, schema).bytes()));
    }
    /**
     * Decodes the arguments passed to a logic routine call.
     * The arguments are decoded using the provided fields and schema.
     *
     * @param {(LogicManifest.Routine | string)} fields - The fields associated with the arguments or the name of the routine.
     * @param {string} calldata - The calldata to decode, represented as a hexadecimal string prefixed with "0x".
     *
     * @returns {T | null} The decoded arguments.
     */
    decodeArguments(routine, calldata) {
        let fields;
        if (typeof routine === "string") {
            const element = this.elementDescriptor.getRoutineElement(routine).data;
            fields = element.accepts;
        }
        else {
            fields = routine.accepts;
        }
        if (fields && fields.length === 0) {
            return null;
        }
        const schema = this.schema.parseFields(fields ?? []);
        const decodedCalldata = new js_polo_1.Depolorizer((0, js_moi_utils_1.hexToBytes)(calldata)).depolorize(schema);
        return fields.map((field) => decodedCalldata[field.label]);
    }
    /**
     * Decodes the output data returned from a logic routine call.
     * The output data is decoded using the provided fields and schema.
     * Returns the decoded output data as an unknown type, or null if the output is empty.
     *
     * @param {string} routineOrCallsite - The routine or callsite associated with the output data.
     * @param {string} output - The output data to decode, represented as a hexadecimal string prefixed with "0x".
     * @returns {T | null} The decoded output data, or null if the output is empty.
     */
    decodeOutput(routineOrCallsite, output) {
        let fields;
        if (typeof routineOrCallsite === "string") {
            const element = this.elementDescriptor.getRoutineElement(routineOrCallsite).data;
            fields = element.returns;
        }
        else {
            fields = routineOrCallsite.returns;
        }
        if (output && output != "0x" && fields && fields.length) {
            const schema = this.schema.parseFields(fields);
            return new js_polo_1.Depolorizer((0, js_moi_utils_1.hexToBytes)(output)).depolorize(schema);
        }
        return null;
    }
    /**
     * Decodes a log data from an event emitted in a logic.
     *
     * @param {string} event - The name of the event.
     * @param {string} logData - The POLO encoded log data to be decoded.
     * @returns {T | null} The decoded event log data, or null if the log data is empty.
     */
    decodeEventOutput(event, logData) {
        if (event === "builtin.Log") {
            return new js_polo_1.Depolorizer((0, js_moi_utils_1.hexToBytes)(logData)).depolorize(js_moi_utils_1.builtInLogEventSchema);
        }
        const element = this.elementDescriptor.getEventElement(event);
        if (element == null) {
            throw new Error(`Event ${event} not found in manifest`);
        }
        if (logData && logData !== "0x") {
            const element = this.elementDescriptor.getEventElement(event);
            const schema = this.schema.parseFields(element.data.fields);
            return new js_polo_1.Depolorizer((0, js_moi_utils_1.hexToBytes)(logData)).depolorize(schema);
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
     * Converts a manifest hash to JSON representation.
     *
     * @param manifest - The manifest hash as a Uint8Array.
     * @returns The JSON representation of the manifest.
     */
    static decodeManifestToJson(manifest) {
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
            return this.decodeManifestToJson(manifest);
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
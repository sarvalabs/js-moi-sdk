import { bytesToHex, deepCopy, DEFAULT_EVENT_SCHEMA, ErrorCode, ErrorUtils, hexToBytes, trimHexPrefix } from "js-moi-utils";
import { Depolorizer, documentEncode, Polorizer } from "js-polo";
import { ElementDescriptor } from "./element-descriptor";
import { Schema } from "./schema";
/**
 * ManifestCoder is a class that provides encoding and decoding functionality
 * for Logic Interface.It allows encoding manifests and arguments, as well as
 * decoding output, exceptions and logic states based on both a predefined and
 * runtime schema.
 *
 * @class
 */
export class ManifestCoder {
    elementDescriptor;
    /**
     * Creates an instance of ManifestCoder.
     */
    constructor(descriptorOrManifest) {
        this.elementDescriptor = descriptorOrManifest instanceof ElementDescriptor ? descriptorOrManifest : new ElementDescriptor(descriptorOrManifest);
    }
    get schema() {
        return new Schema(this.elementDescriptor.getElements(), this.elementDescriptor.getClassDefs());
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
        const polorizer = new Polorizer();
        polorizer.polorizeInteger(manifest.syntax);
        polorizer.polorize(manifest.engine, Schema.PISA_ENGINE_SCHEMA);
        if (manifest.elements) {
            const elements = new Polorizer();
            manifest.elements.forEach((value) => {
                const element = new Polorizer();
                element.polorizeInteger(value.ptr);
                element.polorize(value.deps, Schema.PISA_DEPS_SCHEMA);
                element.polorizeString(value.kind);
                switch (value.kind) {
                    case "constant":
                        element.polorize(value.data, Schema.PISA_CONSTANT_SCHEMA);
                        break;
                    case "typedef":
                        element.polorize(value.data, Schema.PISA_TYPEDEF_SCHEMA);
                        break;
                    case "class":
                        element.polorize(value.data, Schema.PISA_CLASS_SCHEMA);
                        break;
                    case "method":
                        element.polorize(value.data, Schema.PISA_METHOD_SCHEMA);
                        break;
                    case "routine":
                        element.polorize(value.data, Schema.PISA_ROUTINE_SCHEMA);
                        break;
                    case "event":
                        element.polorize(value.data, Schema.PISA_EVENT_SCHEMA);
                        break;
                    case "state":
                        element.polorize(value.data, Schema.PISA_STATE_SCHEMA);
                        break;
                    default:
                        ErrorUtils.throwError(`Unsupported kind: ${value.kind}`, ErrorCode.UNSUPPORTED_OPERATION);
                }
                elements.polorizePacked(element);
            });
            polorizer.polorizePacked(elements);
        }
        const bytes = polorizer.bytes();
        return "0x" + bytesToHex(bytes);
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
            const doc = documentEncode(arg, reconstructSchema(deepCopy(schema)));
            if (updateType) {
                schema.kind = "document";
                delete schema.fields;
            }
            return doc.getData();
        };
        switch (schema.kind) {
            case "string":
                return trimHexPrefix(arg);
            case "bytes":
                if (typeof arg === "string") {
                    return hexToBytes(arg);
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
     * parameters and its types (the accepts property in routine).
     *
     * The arguments are mapped to their corresponding fields, and the calldata
     * is generated by parsing and encoding the arguments based on the dynamically
     * created schema from fields.
     *
     * @param {(LogicManifest.TypeField[] | string)} fields - The fields associated with the routine parameters (arguments) or the name of the routine.
     * @param {any[]} args - The arguments to encode.
     * @returns {string} The POLO-encoded calldata as a hexadecimal string prefixed with "0x".
     */
    encodeArguments(fields, args) {
        if (typeof fields === "string") {
            const element = this.elementDescriptor.getRoutineElement(fields).data;
            fields = element.accepts;
        }
        const schema = this.schema.parseFields(fields);
        const calldata = Object.values(fields).reduce((acc, field) => {
            acc[field.label] = this.parseCalldata(schema.fields[field.label], args[field.slot]);
            return acc;
        }, {});
        return "0x" + bytesToHex((documentEncode(calldata, schema).bytes()));
    }
    /**
     * Decodes the output data returned from a logic routine call.
     * The output data is decoded using the provided fields and schema.
     * Returns the decoded output data as an unknown type, or null if the output is empty.
     *
     * @param {string} output - The output data to decode, represented as a hexadecimal string prefixed with "0x".
     * @param {string} fields - The name of the routine associated with the output data.
     * @returns {T | null} The decoded output data, or null if the output is empty.
     */
    decodeOutput(fields, output) {
        if (typeof fields === "string") {
            const element = this.elementDescriptor.getRoutineElement(fields).data;
            fields = element.returns;
        }
        if (output && output != "0x" && fields && fields.length) {
            const schema = this.schema.parseFields(fields);
            return new Depolorizer(hexToBytes(output)).depolorize(schema);
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
            return new Depolorizer(hexToBytes(logData)).depolorize(DEFAULT_EVENT_SCHEMA);
        }
        const element = this.elementDescriptor.getEventElement(event);
        if (element == null) {
            throw new Error(`Event ${event} not found in manifest`);
        }
        if (logData && logData !== "0x") {
            const element = this.elementDescriptor.getEventElement(event);
            const schema = this.schema.parseFields(element.data.fields);
            return new Depolorizer(hexToBytes(logData)).depolorize(schema);
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
            const decodedError = hexToBytes(error);
            const depolorizer = new Depolorizer(decodedError);
            return depolorizer.depolorize(Schema.PISA_EXCEPTION_SCHEMA);
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
            const decodedData = hexToBytes(data);
            const depolorizer = new Depolorizer(decodedData);
            const schema = this.schema.parseFields(fields);
            return depolorizer.depolorize(schema.fields[field]);
        }
        return null;
    }
}
//# sourceMappingURL=manifest.js.map
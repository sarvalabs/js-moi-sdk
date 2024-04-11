"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManifestCoder = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_polo_1 = require("js-polo");
const element_descriptor_1 = require("./element-descriptor");
const schema_1 = require("./schema");
/**
 * ManifestCoder is a class that provides encoding and decoding functionality
 * for Logic Interface. It allows encoding manifests and arguments, as well as
 * decoding output, exceptions and logic states based on both a predefined and
 * runtime schema.
 *
 * @class
 */
class ManifestCoder {
    elementDescriptor;
    constructor(argument) {
        this.elementDescriptor = argument instanceof element_descriptor_1.ElementDescriptor ? argument : new element_descriptor_1.ElementDescriptor(argument);
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
                    case "method":
                        element.polorize(value.data, schema_1.Schema.PISA_METHOD_SCHEMA);
                        break;
                    case "routine":
                        element.polorize(value.data, schema_1.Schema.PISA_ROUTINE_SCHEMA);
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
            Object.keys(schema.fields).forEach((key) => {
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
            Object.keys(arg).forEach((key) => {
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
                if (parsableKinds.includes(schema.fields.keys.kind) || parsableKinds.includes(schema.fields.values.kind)) {
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
     * Retrieves the routine with the specified name from the logic manifest.
     *
     * @param routineName - The name of the routine to retrieve.
     * @returns The routine object from the logic manifest.
     * @throws {Error} If the callsite is not found or if the routine kind is invalid.
     */
    getRoutine(routineName) {
        const callsite = this.elementDescriptor.getCallsites().get(routineName);
        if (callsite == null) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Callsite not found", "routineName", routineName);
        }
        const element = this.elementDescriptor.getElements().get(callsite.ptr);
        if (element.kind !== "routine" && element.kind !== "deployer") {
            js_moi_utils_1.ErrorUtils.throwError("Invalid routine kind", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        return element.data;
    }
    /**
     * Encodes the provided arguments based on the given manifest routine
     * parameters or routine name. The arguments are encoded into POLO format.
     *
     * ```javascript
     * const manifestCoder = new ManifestCoder(manifest);
     * const address = "0x89c28b823b5f71388e0d6dd2c56b44dd965bb64dae4b6c69abace47cf68f6948"
     * const calldata = manifestCoder.encodeArguments("BalanceOf", [address]);
     * ```
     *
     * @param {LogicManifest.TypeField[] | string} fields - The fields associated with the routine parameters (arguments) or the routine name.
     * @param {any[]} args - The arguments to encode.
     * @returns {string} The POLO-encoded calldata as a hexadecimal string prefixed with "0x".
     *
     */
    encodeArguments(fields, args) {
        if (typeof fields === "string") {
            fields = this.getRoutine(fields).accepts;
        }
        const schema = this.schema.parseFields(fields);
        const calldata = Object.values(fields).reduce((acc, field) => {
            acc[field.label] = this.parseCalldata(schema.fields[field.label], args[field.slot]);
            return acc;
        }, {});
        const document = (0, js_polo_1.documentEncode)(calldata, schema);
        return (0, js_moi_utils_1.encodeToString)(document.bytes());
    }
    /**
     * Decodes the output data returned from a logic routine call.
     * The output data is decoded using the provided fields or routine name.
     *
     * ```javascript
     * const manifestCoder = new ManifestCoder(manifest);
     * const output = "0x0e1f0305f5e100";
     * const decodedOutput = manifestCoder.decodeOutput(output, "BalanceOf");
     * console.log(decodedOutput); // { balance: 100000000 }
     * ```
     *
     * @param {string} output - The POLO encoded output data to decode, represented as a hexadecimal string prefixed with "0x".
     * @param {LogicManifest.TypeField[] | string} fields - The fields associated with the output data or the routine name.
     * @returns {unknown | null} The decoded output data, or null if the output is empty.
     */
    decodeOutput(output, fields) {
        if (output === "0x") {
            return null;
        }
        if (typeof fields === "string") {
            const returnedTypeFields = this.getRoutine(fields).returns;
            if (returnedTypeFields == null) {
                return null;
            }
            fields = returnedTypeFields;
        }
        if (fields && fields.length) {
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
            const exception = depolorizer.depolorize(schema_1.Schema.PISA_EXCEPTION_SCHEMA);
            return exception;
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
}
exports.ManifestCoder = ManifestCoder;
//# sourceMappingURL=manifest-coder.js.map
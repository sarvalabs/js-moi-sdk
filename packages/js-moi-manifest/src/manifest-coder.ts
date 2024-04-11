import { bytesToHex, deepCopy, encodeToString, ErrorCode, ErrorUtils, hexToBytes, trimHexPrefix } from "js-moi-utils";
import { Depolorizer, documentEncode, Polorizer, Schema as PoloSchema } from "js-polo";
import { LogicManifest } from "../types/manifest";
import { Exception } from "../types/response";
import { ElementDescriptor } from "./element-descriptor";
import { Schema } from "./schema";

/**
 * ManifestCoder is a class that provides encoding and decoding functionality
 * for Logic Interface. It allows encoding manifests and arguments, as well as
 * decoding output, exceptions and logic states based on both a predefined and
 * runtime schema.
 *
 * @class
 */
export class ManifestCoder {
    private readonly elementDescriptor: ElementDescriptor;

    /**
     * Creates an instance of ManifestCoder.
     *
     * @param {LogicManifest.Manifest} manifest - The logic manifest.
     */
    constructor(manifest: LogicManifest.Manifest);
    /**
     * Create an instance of ManifestCoder.
     * @param elementDescriptor a element descriptor of the logic manifest
     */
    constructor(elementDescriptor: ElementDescriptor);
    constructor(argument: LogicManifest.Manifest | ElementDescriptor) {
        this.elementDescriptor = argument instanceof ElementDescriptor ? argument : new ElementDescriptor(argument);
    }

    private get schema(): Schema {
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
    public static encodeManifest(manifest: LogicManifest.Manifest): string {
        const polorizer = new Polorizer();
        polorizer.polorizeString(manifest.syntax);
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
    private parseCalldata(schema: PoloSchema, arg: any, updateType: boolean = true): any {
        const parsableKinds = ["bytes", "array", "map", "struct"];

        const reconstructSchema = (schema: PoloSchema): PoloSchema => {
            Object.keys(schema.fields).forEach((key) => {
                if (schema.fields[key].kind === "struct") {
                    schema.fields[key].kind = "document";
                }
            });

            return schema;
        };

        const parseArray = (schema: PoloSchema, arg: any[]) => {
            return arg.map((value: any, index: number) => this.parseCalldata(schema, value, arg.length - 1 === index));
        };

        const parseMap = (schema: PoloSchema, arg: Map<any, any>) => {
            const map = new Map();
            const entries = Array.from(arg.entries());

            // Loop through the entries of the Map
            entries.forEach((entry: [any, any], index: number) => {
                const [key, value] = entry;

                map.set(
                    this.parseCalldata(schema.fields.keys, key, entries.length - 1 === index),
                    this.parseCalldata(schema.fields.values, value, entries.length - 1 === index)
                );
            });

            return map;
        };

        const parseStruct = (schema: PoloSchema, arg: any, updateType: boolean) => {
            Object.keys(arg).forEach((key) => {
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
    private getRoutine(routineName: string): LogicManifest.Routine {
        const callsite = this.elementDescriptor.getCallsites().get(routineName);

        if (callsite == null) {
            ErrorUtils.throwArgumentError("Callsite not found", "routineName", routineName);
        }

        const element = this.elementDescriptor.getElements().get(callsite.ptr);
        if (element.kind !== "routine" && element.kind !== "deployer") {
            ErrorUtils.throwError("Invalid routine kind", ErrorCode.INVALID_ARGUMENT);
        }

        return element.data as LogicManifest.Routine;
        
    }

    /**
     * Encodes the provided arguments based on the given manifest routine 
     * parameters or routine name. The arguments are encoded into POLO format.
     * 
     * @example
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
    public encodeArguments(fields: LogicManifest.TypeField[] | string, args: any[]): string {
        if (typeof fields === "string") {
            fields = this.getRoutine(fields).accepts;
        }

        const schema = this.schema.parseFields(fields);
        const calldata = Object.values(fields).reduce((acc, field) => {
            acc[field.label] = this.parseCalldata(schema.fields[field.label], args[field.slot]);
            return acc;
        }, {});

        const document = documentEncode(calldata, schema);
        return encodeToString(document.bytes());
    }

    /**
     * Decodes the output data returned from a logic routine call.
     * The output data is decoded using the provided fields or routine name.
     * 
     * @example
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
    public decodeOutput<T = unknown>(output: string, fields: LogicManifest.TypeField[] | string): T | null {
        if(output === "0x") {
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
            const decodedOutput = hexToBytes(output);
            const depolorizer = new Depolorizer(decodedOutput);
            const schema = this.schema.parseFields(fields);
            return depolorizer.depolorize(schema) as T;
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
    public static decodeException(error: string): Exception | null {
        if (error && error !== "0x") {
            const decodedError = hexToBytes(error);
            const depolorizer = new Depolorizer(decodedError);
            const exception = depolorizer.depolorize(Schema.PISA_EXCEPTION_SCHEMA);

            return exception as Exception;
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
    public decodeState(data: string, field: string, fields: LogicManifest.TypeField[]): unknown | null {
        if (data && data != "0x") {
            const decodedData = hexToBytes(data);
            const depolorizer = new Depolorizer(decodedData);
            const schema = this.schema.parseFields(fields);
            return depolorizer.depolorize(schema.fields[field]);
        }

        return null;
    }
}

import { builtInLogEventSchema, bytesToHex, deepCopy, ErrorCode, ErrorUtils, hexToBytes, isHex, trimHexPrefix } from "js-moi-utils";
import { Depolorizer, documentEncode, Polorizer, Schema as PoloSchema, WireType } from "js-polo";
import { LogicManifest } from "../types/manifest";
import { Exception } from "../types/response";
import { ElementDescriptor } from "./element-descriptor";
import { ManifestFormat } from "./manifest-format";
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
    private readonly elementDescriptor: ElementDescriptor;

    /**
     * Creates an instance of ManifestCoder.
     * 
     * @param {LogicManifest.Manifest} manifest - The logic manifest.
     * @constructor
     */
    constructor(manifest: LogicManifest.Manifest);
    /**
     * Creates an instance of ManifestCoder.
     */
    constructor(manifest: LogicManifest.Manifest) {
        this.elementDescriptor = new ElementDescriptor(manifest.elements);
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
        polorizer.polorizeInteger(manifest.syntax);
        polorizer.polorize(manifest.engine, Schema.PISA_ENGINE_SCHEMA);
    
        if(manifest.elements) {
            const elements = new Polorizer();
        
            manifest.elements.forEach((value) => {
                const element = new Polorizer();
        
                element.polorizeInteger(value.ptr);
                element.polorize(value.deps, Schema.PISA_DEPS_SCHEMA);
                element.polorizeString(value.kind);
        
                switch(value.kind) {    
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
                        ErrorUtils.throwError(
                            `Unsupported kind: ${value.kind}`, 
                            ErrorCode.UNSUPPORTED_OPERATION,
                        );
                }
        
                elements.polorizePacked(element);
            })
        
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
            Object.keys(schema.fields).forEach(key => {
                if(schema.fields[key].kind === "struct") {
                    schema.fields[key].kind = "document";
                }
            });
        
            return schema;
        }

        const parseArray = (schema: PoloSchema, arg: any[]) => {
            return arg.map((value: any, index: number) => 
                this.parseCalldata(schema, value, arg.length - 1 === index)
            );
        }

        const parseMap = (schema: PoloSchema, arg: Map<any, any>) => {
            const map = new Map()
            const entries = Array.from(arg.entries());

            // Loop through the entries of the Map
            entries.forEach((entry:[any, any], index: number) => {
                const [key, value] = entry;

                map.set(
                    this.parseCalldata(
                        schema.fields.keys, 
                        key, 
                        entries.length - 1 === index
                    ), 
                    this.parseCalldata(
                        schema.fields.values, 
                        value, 
                        entries.length - 1 === index
                    )
                );
            });

            return map;
        }

        const parseStruct = (schema: PoloSchema, arg: any, updateType: boolean) => {
            Object.keys(arg).forEach(key => {
                arg[key] = this.parseCalldata(schema.fields[key], arg[key], false)
            });

            const doc = documentEncode(arg, reconstructSchema(deepCopy(schema)))

            if(updateType) {
                schema.kind = "document";
                delete schema.fields;
            }

            return doc.getData();
        }

        switch(schema.kind) {
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
                if((parsableKinds.includes(schema.fields.keys.kind) || 
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
     * Encodes the arguments for a specified routine into a hexadecimal string.
     *
     * @param routine - The name of the routine for which the arguments are being encoded.
     * @param args - The arguments to be encoded, passed as a variadic parameter.
     * @returns A hexadecimal string representing the encoded arguments.
     */
    public encodeArguments(routine: string, ...args: any[]): string {
        const element  = this.elementDescriptor.getRoutineElement(routine).data as LogicManifest.Routine
        const schema = this.schema.parseFields(element.accepts ?? []);
        const calldata = Object.values(element.accepts).reduce((acc, field: LogicManifest.TypeField) => {
            acc[field.label] = this.parseCalldata(schema.fields[field.label], args[field.slot]);
            return acc;
        }, {});

        return "0x" + bytesToHex((documentEncode(calldata, schema).bytes()))
    }

   
    /**
     * Decodes the provided calldata into the expected arguments for a given routine.
     *
     * @template T - The type of the decoded arguments.
     * @param {string} routine - The name of the routine whose arguments are to be decoded.
     * @param {string} calldata - The calldata to decode.
     * @returns {T | null} - The decoded arguments as an object of type T, or null if the routine accepts no arguments.
     */
    public decodeArguments<T>(routine: string, calldata: string): T | null {
        const element  = this.elementDescriptor.getRoutineElement(routine).data as LogicManifest.Routine

        if (element && element.accepts.length === 0) {
            return null
        }

        const schema = this.schema.parseFields(element.accepts ?? []);
        const decodedCalldata = new Depolorizer(hexToBytes(calldata)).depolorize(schema);
        return element.accepts.map((field: LogicManifest.TypeField) => decodedCalldata[field.label]) as T;
    }

    /**
     * Decodes the output of a routine.
     *
     * @template T - The type to which the output should be decoded.
     * @param {string} routine - The name of the routine whose output is to be decoded.
     * @param {string} output - The output string to decode.
     * @returns {T | null} - The decoded output as type T, or null if the output is invalid or the routine has no return schema.
     */
    public decodeOutput<T>(routine: string, output: string): T | null {
        const element  = this.elementDescriptor.getRoutineElement(routine).data as LogicManifest.Routine
        

        if(output && output != "0x" && element.returns && element.returns.length) {
            const schema = this.schema.parseFields(element.returns);
            return new Depolorizer(hexToBytes(output)).depolorize(schema) as T
        }

        return null
    }

    /**
     * Decodes a log data from an event emitted in a logic.
     * 
     * @param {string} event - The name of the event.
     * @param {string} logData - The log data to decode, represented as a hexadecimal string prefixed with "0x".
     * @returns {T | null} The decoded event log data, or null if the log data is empty.
     */
    public decodeEventOutput<T>(event: string, logData: string): T | null;
    /**
     * Decodes a log data from an event emitted in a logic.
     * 
     * @param {string} logData - The log data to decode, represented as a hexadecimal string prefixed with "0x".
     * @returns {T | null} The decoded event log data, or null if the log data is empty.
     */
    public decodeEventOutput(event: "builtin.Log", logData: string): { value: string } | null;
    /**
     * Decodes a log data from an event emitted in a logic.
     * 
     * @param {string} event - The name of the event.
     * @param {string} logData - The POLO encoded log data to be decoded.
     * @returns {T | null} The decoded event log data, or null if the log data is empty.
     */
    public decodeEventOutput<T>(event: string, logData: string): T | null {
        if (event === "builtin.Log") {
            return new Depolorizer(hexToBytes(logData)).depolorize(builtInLogEventSchema) as T;
        }

        const element = this.elementDescriptor.getEventElement(event);

        if (element == null) {
            throw new Error(`Event ${event} not found in manifest`);
        }

        if (logData && logData !== "0x") {
            const element = this.elementDescriptor.getEventElement(event);
            const schema = this.schema.parseFields(element.data.fields);
            return  new Depolorizer(hexToBytes(logData)).depolorize(schema) as T;
        }

        return null
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
        if(error && error !== "0x") {
            const decodedError = hexToBytes(error)
            const depolorizer = new Depolorizer(decodedError)
            return depolorizer.depolorize(Schema.PISA_EXCEPTION_SCHEMA) as Exception
        }

        return null
    }

    /**
     * Converts a manifest hash to JSON representation.
     * 
     * @param manifest - The manifest hash as a Uint8Array.
     * @returns The JSON representation of the manifest.
     */
    private static decodeManifestToJson(manifest: Uint8Array): LogicManifest.Manifest {
        const decoded: any = new Depolorizer(manifest).depolorize(this.MANIFEST_SCHEMA);

        for (let i = 0; i < decoded.elements.length; i += 1) {
            const element = decoded.elements[i];

            if (element.deps.length == 0) {
                delete element.deps;
            }

            let buff: Uint8Array | null = null;
            let schema = null;

            switch (element.kind) {
                case "constant": {
                    buff = new Uint8Array([
                        WireType.WIRE_PACK,
                        ...element.data,
                    ]);
                    schema = Schema.PISA_CONSTANT_SCHEMA;
                    break;
                }

                case "typedef": {
                    buff = new Uint8Array([
                        WireType.WIRE_WORD,
                        ...element.data,
                    ]);
                    schema = Schema.PISA_TYPEDEF_SCHEMA;
                    break;
                }

                case "state": {
                    buff = new Uint8Array([
                        WireType.WIRE_PACK,
                        ...element.data,
                    ]);
                    schema = Schema.PISA_STATE_SCHEMA;
                    break;
                }

                case "routine": {
                    buff = new Uint8Array([
                        WireType.WIRE_PACK,
                        ...element.data,
                    ]);
                    schema = Schema.PISA_ROUTINE_SCHEMA;
                    break;
                }

                case "method": {
                    buff = new Uint8Array([
                        WireType.WIRE_PACK,
                        ...element.data,
                    ]);
                    schema = Schema.PISA_METHOD_SCHEMA;
                    break;
                }

                case "class": {
                    buff = new Uint8Array([
                        WireType.WIRE_PACK,
                        ...element.data,
                    ]);
                    schema = Schema.PISA_CLASS_SCHEMA;
                    break;
                }

                case "event": {
                    buff = new Uint8Array([
                        WireType.WIRE_PACK,
                        ...element.data,
                    ]);
                    schema = Schema.PISA_EVENT_SCHEMA;
                    break;
                }

                default: 
                    ErrorUtils.throwError(`Unsupported kind: ${element.kind}`, ErrorCode.UNSUPPORTED_OPERATION);
            }

            if (schema == null || buff == null) {
                ErrorUtils.throwError("Invalid schema or buffer", ErrorCode.UNEXPECTED_ARGUMENT);
            }

            const polo = new Depolorizer(buff);
            element.data = polo.depolorize(schema);

            if (["routine", "method"].includes(element.kind)) {
                for (const [key, value] of Object.entries(
                    element.data.executes
                )) {
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
    public static decodeManifest(manifest: string | Uint8Array, format: ManifestFormat): LogicManifest.Manifest {
        if (typeof manifest === "string") {
            if (!isHex(manifest)) {
                ErrorUtils.throwArgumentError(
                    "Invalid manifest",
                    "manifest",
                    manifest
                );
            }

            manifest = hexToBytes(manifest);
        }

        if (format === ManifestFormat.JSON) {
            return this.decodeManifestToJson(manifest);
        }

        ErrorUtils.throwArgumentError("Unsupported format", "format", format);
    }

    private static MANIFEST_SCHEMA = {
        kind: "struct",
        fields: {
            syntax: {
                kind: "integer",
            },
            engine: Schema.PISA_ENGINE_SCHEMA,
            elements: {
                kind: "array",
                fields: {
                    values: {
                        kind: "struct",
                        fields: {
                            ptr: {
                                kind: "integer",
                            },
                            deps: Schema.PISA_DEPS_SCHEMA,
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
    }
}

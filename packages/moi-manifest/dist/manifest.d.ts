import { Exception } from "../types/response";
import { LogicManifest } from "moi-utils";
/**
 * ManifestCoder is a class that provides encoding and decoding functionality
 * for Logic Interface.It allows encoding manifests and arguments, as well as
 * decoding output, exceptions and logic states based on both a predefined and
 * runtime schema.
 *
 * @class
 */
export declare class ManifestCoder {
    private schema;
    constructor(elements: Map<number, LogicManifest.Element>, classDefs: Map<string, number>);
    /**
     * encodeManifest
     *
     * Encodes a logic manifest into POLO format. The manifest is processed and
     * serialized according to the predefined schema.
     * Returns the POLO-encoded data as a hexadecimal string prefixed with "0x".
     *
     * @static
     * @param {LogicManifest.Manifest} manifest - The logic manifest to encode.
     * @returns {string} The POLO-encoded data.
     */
    static encodeManifest(manifest: LogicManifest.Manifest): string;
    /**
     * parseCalldata
     *
     * Parses the calldata arguments based on the provided POLO Schema.
     * The calldata arguments is recursively processed and transformed according to the schema.
     *
     * @private
     * @param {PoloSchema} schema - The schema definition for the calldata.
     * @param {*} arg - The calldata argument to parse.
     * @param {boolean} [updateType=true] - Indicates whether to update the schema type during parsing.
     * @returns {*} The parsed calldata argument.
     */
    private parseCalldata;
    /**
     * encodeArguments
     *
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
    encodeArguments(fields: LogicManifest.TypeField[], args: any[]): string;
    /**
     * decodeOutput
     *
     * Decodes the output data returned from a logic routine call.
     * The output data is decoded using the provided fields and schema.
     * Returns the decoded output data as an unknown type, or null if the output is empty.
     *
     * @param {string} output - The output data to decode, represented as a
     hexadecimal string prefixed with "0x".
     * @param {LogicManifest.TypeField[]} fields - The fields associated with the output data.
     * @returns {unknown | null} The decoded output data, or null if the output is empty.
     */
    decodeOutput(output: string, fields: LogicManifest.TypeField[]): unknown | null;
    /**
     * decodeException
     *
     * Decodes an exception thrown by a logic routine call.
     * The exception data is decoded using the predefined exception schema.
     * Returns the decoded exception object, or null if the error is empty.
     *
     * @param {string} error - The error data to decode, represented as a
     hexadecimal string prefixed with "0x".
     * @returns {Exception | null} The decoded exception object, or null if
     the error is empty.
     */
    static decodeException(error: string): Exception | null;
    /**
     * decodeState
     *
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
    decodeState(data: string, field: string, fields: LogicManifest.TypeField[]): unknown | null;
}

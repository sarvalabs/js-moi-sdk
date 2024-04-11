import { LogicManifest } from "../types/manifest";
import { Exception } from "../types/response";
import { ElementDescriptor } from "./element-descriptor";
/**
 * ManifestCoder is a class that provides encoding and decoding functionality
 * for Logic Interface. It allows encoding manifests and arguments, as well as
 * decoding output, exceptions and logic states based on both a predefined and
 * runtime schema.
 *
 * @class
 */
export declare class ManifestCoder {
    private readonly elementDescriptor;
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
    private get schema();
    /**
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
     * Retrieves the routine with the specified name from the logic manifest.
     *
     * @param routineName - The name of the routine to retrieve.
     * @returns The routine object from the logic manifest.
     * @throws {Error} If the callsite is not found or if the routine kind is invalid.
     */
    private getRoutine;
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
    encodeArguments(fields: LogicManifest.TypeField[] | string, args: any[]): string;
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
    decodeOutput<T = unknown>(output: string, fields: LogicManifest.TypeField[] | string): T | null;
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
    static decodeException(error: string): Exception | null;
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
    decodeState(data: string, field: string, fields: LogicManifest.TypeField[]): unknown | null;
}
//# sourceMappingURL=manifest-coder.d.ts.map
/**
 * Marshals the given json object into a Uint8Array by converting it to
 * JSON string and encoding as UTF-8.
 *
 * @param {object} data - The data object to marshal.
 * @returns {Uint8Array} - The marshaled data as a Uint8Array.
 */
export declare const marshal: (data: object) => Uint8Array;
/**
 * Unmarshals the given Uint8Array into its original json object by decoding
 * it as UTF-8 and parsing the JSON string.
 *
 * @param {Uint8Array} bytes - The bytes to unmarshal.
 * @returns {any} - The unmarshaled data object.
 * @throws {Error} - If there is an error while deserializing the data.
 */
export declare const unmarshal: (bytes: Uint8Array) => any;

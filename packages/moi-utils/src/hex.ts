import BN from "bn.js";

/**
 * numToHex
 * 
 * Converts a number, bigint, or BN instance to a hexadecimal string representation.
 * If the input value is not already a BN instance, it is converted to one.
 * Throws an error if the input value is a negative number.
 *
 * @param {number | bigint | BN} value - The value to convert to a hexadecimal string.
 * @returns {string} - The hexadecimal string representation of the value.
 * @throws {Error} - If the input value is a negative number.
 */
export const numToHex = (value: number | bigint | BN): string => {
    if (!BN.isBN(value)) {
        value = new BN(value)   
    }
    
    if (value.lt(new BN(0))) {
        throw new Error('Input must be a positive BN value');
    }
  
    const bigNum = new BN(value.toString()); // Convert bigint to bn.js BN instance

    return bigNum.toString(16).toUpperCase();
}

/**
 * toQuantity
 * 
 * Converts a number, bigint, or BN instance to a quantity string representation.
 * The quantity string is prefixed with "0x" and is obtained by calling `numToHex` function.
 *
 * @param {number | bigint | BN} value - The value to convert to a quantity string.
 * @returns {string} - The quantity string representation of the value.
 * @throws {Error} - If an error occurs during the conversion.
 */
export const toQuantity = (value: number | bigint | BN): string => {
  try {
    return "0x" + numToHex(value)
  } catch(err) {
    throw err
  }
}

/**
 * encodeToString
 * 
 * Converts a Uint8Array to a hexadecimal string representation.
 *
 * @param {Uint8Array} data - The Uint8Array to encode as a hexadecimal string.
 * @returns {string} - The hexadecimal string representation of the Uint8Array.
 */
export const encodeToString = (data: Uint8Array): string => {
    return "0x" + Buffer.from(data).toString('hex');
}

/**
 * hexToBytes
 * 
 * Converts a hexadecimal string to a Uint8Array.
 *
 * @param {string} str - The hexadecimal string to convert to a Uint8Array.
 * @returns {Uint8Array} - The Uint8Array representation of the hexadecimal string.
 * @throws {Error} - If the input string is not a valid hexadecimal string.
 */
export const hexToBytes = (str: string): Uint8Array => {
  const hex = str.replace(/^0x/, '').trim();
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }

  return bytes;
}

/**
 * hexToBN
 * 
 * Converts a hexadecimal string to a bigint or number.
 * If the resulting value is too large to fit in a number, it is returned as a BigInt.
 * Otherwise, it is returned as a number.
 *
 * @param {string} hex - The hexadecimal string to convert.
 * @returns {bigint | number} - The resulting value as a bigint or number.
 */
export const hexToBN = (hex: string): bigint | number => {
  let value: BN;

  hex = hex.trim()
  // Check if the hex string starts with "0x"
  if (hex.startsWith("0x")) {
    // If it does, create a BN instance from the hex string without the "0x" prefix
    hex = hex.slice(2);
  }

  value = new BN(hex, 16);

  // Check if the number is too large to fit in a number
  if (value.bitLength() > 53) {
    // If so, return it as a BigInt
    return BigInt(`0x${value.toString(16)}`);
  }

  // Otherwise, return it as a number
  return value.toNumber();
}

/**
 * bytesToHex
 * 
 * Converts a Uint8Array to a hexadecimal string representation.
 *
 * @param {Uint8Array} data - The Uint8Array to convert to a hexadecimal string.
 * @returns {string} - The hexadecimal string representation of the Uint8Array.
 */
export const bytesToHex = (data: Uint8Array): string => {
  return Buffer.from(data).toString('hex');
}

/**
 * trimHexPrefix
 * 
 * Removes the '0x' prefix from a hexadecimal string if present.
 *
 * @param {string} hex - The input string.
 * @returns {string} - The trimmed hexadecimal string.
 */
export const trimHexPrefix = (hex: string): string => {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }

  return hex;
};

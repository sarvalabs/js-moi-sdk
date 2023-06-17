import {ErrorUtils, ErrorCode} from "./errors"

/**
 * isHexable
 * 
 * Checks if the given value has a "toHexString" method, indicating it is hexable.
 *
 * @param {any} value - The value to check.
 * @returns {boolean} - True if the value is hexable, false otherwise.
 */
const isHexable = (value: any): boolean => {
    return !!(value.toHexString);
}

/**
 * addSlice
 * 
 * Adds the "slice" method to the array if it is not already present.
 * This is used to ensure that the array is sliceable.
 *
 * @param {any} array - The array to add the "slice" method to.
 * @returns {any} - The array with the "slice" method added.
 */
const addSlice = (array: any): any => {
    if (array.slice) {
        return array;
    }
    array.slice = function () {
        return addSlice(new Uint8Array(Array.prototype.slice.apply(array)));
    };
    return array;
}

/**
 * isArrayish
 * 
 * Checks if the given value is arrayish.
 * An arrayish value is an array-like object with valid integer values within the range [0, 255].
 *
 * @param {any} value - The value to check.
 * @returns {boolean} - True if the value is arrayish, false otherwise.
 */
const isArrayish = (value: any): boolean => {
    if (!value || parseInt(String(value.length)) !== value.length || typeof (value) === 'string') {
        return false;
    }
    for (var i = 0; i < value.length; i++) {
        var v = value[i];
        if (v < 0 || v >= 256 || parseInt(String(v)) != v) {
            return false;
        }
    }
    return true;
}

/**
 * hexToUint8
 * 
 * Converts a hexadecimal string or hexable value to a Uint8Array.
 *
 * @param {any} value - The value to convert to Uint8Array.
 * @returns {Uint8Array} - The converted Uint8Array.
 * @throws {Error} - If the value is not a valid hexidecimal string or arrayish value.
 */
export const hexToUint8 = (value: any): Uint8Array => {
    try {
        if (value == null) {
            ErrorUtils.throwError('cannot convert null value to array', ErrorCode.INVALID_ARGUMENT, { arg: 'value', value: value });
        }
        if (isHexable(value)) {
            value = value.toHexString();
        }
        if (typeof (value) === 'string') {
            var match = value.match(/^(0x)?[0-9a-fA-F]*$/);
            if (!match) {
                ErrorUtils.throwError('invalid hexidecimal string', ErrorCode.INVALID_ARGUMENT, { arg: 'value', value: value });
            }
            value = value.substring(2);
            if (value.length % 2) {
                value = '0' + value;
            }
            var result = [];
            for (var i = 0; i < value.length; i += 2) {
                result.push(parseInt(value.substr(i, 2), 16));
            }
            return addSlice(new Uint8Array(result));
        }
        if (isArrayish(value)) {
            return addSlice(new Uint8Array(value));
        }
        ErrorUtils.throwError('invalid arrayify value', ErrorCode.UNEXPECTED_ARGUMENT, { arg: 'value', value: value, type: typeof (value) });
    } catch(err) {
        throw err
    }
}

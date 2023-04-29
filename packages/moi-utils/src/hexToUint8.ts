import {Errors, ErrorCode} from "./errors"

const isHexable = (value: any) => {
    return !!(value.toHexString);
}

const addSlice = (array: any) => {
    if (array.slice) {
        return array;
    }
    array.slice = function () {
        return addSlice(new Uint8Array(Array.prototype.slice.apply(array)));
    };
    return array;
}

const isArrayish = (value: any) => {
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

export const hexToUint8 = (value: any) => {
    try {
        if (value == null) {
            Errors.throwError('cannot convert null value to array', ErrorCode.INVALID_ARGUMENT, { arg: 'value', value: value });
        }
        if (isHexable(value)) {
            value = value.toHexString();
        }
        if (typeof (value) === 'string') {
            var match = value.match(/^(0x)?[0-9a-fA-F]*$/);
            if (!match) {
                Errors.throwError('invalid hexidecimal string', ErrorCode.INVALID_ARGUMENT, { arg: 'value', value: value });
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
        Errors.throwError('invalid arrayify value', undefined, { arg: 'value', value: value, type: typeof (value) });
    } catch(err) {
        throw err
    }
}
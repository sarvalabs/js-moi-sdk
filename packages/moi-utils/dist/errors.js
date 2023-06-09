"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorUtils = exports.CustomError = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["UNKNOWN_ERROR"] = "ERROR_UNKNOWN";
    ErrorCode["NOT_IMPLEMENTED"] = "ERROR_NOT_IMPLEMENTED";
    ErrorCode["UNSUPPORTED_OPERATION"] = "ERROR_UNSUPPORTED_OPERATION";
    ErrorCode["NETWORK_ERROR"] = "ERROR_NETWORK";
    ErrorCode["SERVER_ERROR"] = "ERROR_SERVER";
    ErrorCode["TIMEOUT"] = "ERROR_TIMEOUT";
    ErrorCode["BUFFER_OVERRUN"] = "ERROR_BUFFER_OVERRUN";
    ErrorCode["NUMERIC_FAULT"] = "ERROR_NUMERIC_FAULT";
    ErrorCode["MISSING_NEW"] = "ERROR_MISSING_NEW";
    ErrorCode["INVALID_ARGUMENT"] = "ERROR_INVALID_ARGUMENT";
    ErrorCode["MISSING_ARGUMENT"] = "ERROR_MISSING_ARGUMENT";
    ErrorCode["UNEXPECTED_ARGUMENT"] = "ERROR_UNEXPECTED_ARGUMENT";
    ErrorCode["CALL_EXCEPTION"] = "ERROR_CALL_EXCEPTION";
    ErrorCode["INSUFFICIENT_FUNDS"] = "ERROR_INSUFFICIENT_FUNDS";
    ErrorCode["NONCE_EXPIRED"] = "ERROR_NONCE_EXPIRED";
    ErrorCode["REPLACEMENT_UNDERPRICED"] = "ERROR_REPLACEMENT_UNDERPRICED";
    ErrorCode["UNPREDICTABLE_GAS_LIMIT"] = "ERROR_UNPREDICTABLE_GAS_LIMIT";
    ErrorCode["TRANSACTION_REPLACED"] = "ERROR_TRANSACTION_REPLACED";
    ErrorCode["ACTION_REJECTED"] = "ERROR_ACTION_REJECTED";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
class CustomError extends Error {
    code;
    reason;
    params;
    constructor(message, code = ErrorCode.UNKNOWN_ERROR, params = {}) {
        super(message);
        this.code = code;
        this.reason = message;
        this.params = params;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
    toString() {
        const messageDetails = Object.entries(this.params)
            .map(([key, value]) => `${key}=${serializeValue(value)}`)
            .join(', ');
        const errorMessageStack = messageDetails ? ` (${messageDetails})` : '';
        return `${this.reason}${errorMessageStack}`;
    }
}
exports.CustomError = CustomError;
class ErrorUtils {
    static throwError(message, code = ErrorCode.UNKNOWN_ERROR, params = {}) {
        throw new CustomError(message, code, params);
    }
    static throwArgumentError(message, name, value) {
        ErrorUtils.throwError(message, ErrorCode.INVALID_ARGUMENT, {
            argument: name,
            value: serializeValue(value),
        });
    }
}
exports.ErrorUtils = ErrorUtils;
// helper function
const serializeValue = (value) => {
    try {
        return JSON.stringify(value);
    }
    catch (error) {
        return String(value);
    }
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
    ErrorCode["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
    ErrorCode["UNSUPPORTED_OPERATION"] = "UNSUPPORTED_OPERATION";
    ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCode["SERVER_ERROR"] = "SERVER_ERROR";
    ErrorCode["TIMEOUT"] = "TIMEOUT";
    ErrorCode["BUFFER_OVERRUN"] = "BUFFER_OVERRUN";
    ErrorCode["NUMERIC_FAULT"] = "NUMERIC_FAULT";
    ErrorCode["MISSING_NEW"] = "MISSING_NEW";
    ErrorCode["INVALID_ARGUMENT"] = "INVALID_ARGUMENT";
    ErrorCode["MISSING_ARGUMENT"] = "MISSING_ARGUMENT";
    ErrorCode["UNEXPECTED_ARGUMENT"] = "UNEXPECTED_ARGUMENT";
    ErrorCode["CALL_EXCEPTION"] = "CALL_EXCEPTION";
    ErrorCode["INSUFFICIENT_FUNDS"] = "INSUFFICIENT_FUNDS";
    ErrorCode["NONCE_EXPIRED"] = "NONCE_EXPIRED";
    ErrorCode["REPLACEMENT_UNDERPRICED"] = "REPLACEMENT_UNDERPRICED";
    ErrorCode["UNPREDICTABLE_GAS_LIMIT"] = "UNPREDICTABLE_GAS_LIMIT";
    ErrorCode["TRANSACTION_REPLACED"] = "TRANSACTION_REPLACED";
    ErrorCode["ACTION_REJECTED"] = "ACTION_REJECTED";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
;
class Errors {
    static createError(message, code, params) {
        if (!code) {
            code = ErrorCode.UNKNOWN_ERROR;
        }
        if (!params) {
            params = {};
        }
        let messageDetails = [];
        Object.keys(params).map(key => {
            try {
                messageDetails.push(key + '=' + JSON.stringify(params[key]));
            }
            catch (error) {
                messageDetails.push(key + '=' + JSON.stringify(params[key].toString()));
            }
        });
        let errorMessageStack = "";
        if (messageDetails.length) {
            errorMessageStack += ' (' + messageDetails.join(', ') + ')';
        }
        const error = new Error(message);
        error.code = code;
        error.reason = message;
        if (errorMessageStack) {
            error.stack = errorMessageStack;
        }
        return error;
    }
    static throwError(message, code, params) {
        throw this.createError(message, code, params);
    }
    static throwArgumentError(message, name, value) {
        return this.throwError(message, ErrorCode.INVALID_ARGUMENT, {
            argument: name,
            value: value
        });
    }
}
exports.Errors = Errors;

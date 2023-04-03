export enum ErrorCode {
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
    NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
    UNSUPPORTED_OPERATION = "UNSUPPORTED_OPERATION",
    NETWORK_ERROR = "NETWORK_ERROR",
    SERVER_ERROR = "SERVER_ERROR",
    TIMEOUT = "TIMEOUT",
    BUFFER_OVERRUN = "BUFFER_OVERRUN",
    NUMERIC_FAULT = "NUMERIC_FAULT",
    MISSING_NEW = "MISSING_NEW",
    INVALID_ARGUMENT = "INVALID_ARGUMENT",
    MISSING_ARGUMENT = "MISSING_ARGUMENT",
    UNEXPECTED_ARGUMENT = "UNEXPECTED_ARGUMENT",
    CALL_EXCEPTION = "CALL_EXCEPTION",
    INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
    NONCE_EXPIRED = "NONCE_EXPIRED",
    REPLACEMENT_UNDERPRICED = "REPLACEMENT_UNDERPRICED",
    UNPREDICTABLE_GAS_LIMIT = "UNPREDICTABLE_GAS_LIMIT",
    TRANSACTION_REPLACED = "TRANSACTION_REPLACED",
    ACTION_REJECTED = "ACTION_REJECTED",
};

interface ErrorParams {
    [name:string]:any
}

export class Errors {
    private static createError(message: string, code?: ErrorCode, params?: ErrorParams): Error {
        if (!code) { code = ErrorCode.UNKNOWN_ERROR; }
        if (!params) { params = {}; }

        let messageDetails = [];
        Object.keys(params).map(key => {
            try {
                messageDetails.push(key + '=' + JSON.stringify(params[key]));
            } catch (error) {
                messageDetails.push(key + '=' + JSON.stringify(params[key].toString()));
            }
        });
    
        let errorMessageStack = ""
        if (messageDetails.length) {
            errorMessageStack += ' (' + messageDetails.join(', ') + ')';
        }

        // @TODO: Any??
        const error: any = new Error(message);
        error.code = code;
        error.reason = message;
        error.stack = errorMessageStack;

        return error;
    }

    public static throwError(message: string, code?: ErrorCode, params?: any): never {
        throw this.createError(message, code, params);
    }

    public static throwArgumentError(message: string, name: string, value: any): never {
        return this.throwError(message, ErrorCode.INVALID_ARGUMENT, {
            argument: name,
            value: value
        });
    }
}
export enum ErrorCode {
    UNKNOWN_ERROR = "ERROR_UNKNOWN",
    NOT_IMPLEMENTED = "ERROR_NOT_IMPLEMENTED",
    UNSUPPORTED_OPERATION = "ERROR_UNSUPPORTED_OPERATION",
    NETWORK_ERROR = "ERROR_NETWORK",
    SERVER_ERROR = "ERROR_SERVER",
    TIMEOUT = "ERROR_TIMEOUT",
    BUFFER_OVERRUN = "ERROR_BUFFER_OVERRUN",
    NUMERIC_FAULT = "ERROR_NUMERIC_FAULT",
    MISSING_NEW = "ERROR_MISSING_NEW",
    INVALID_ARGUMENT = "ERROR_INVALID_ARGUMENT",
    MISSING_ARGUMENT = "ERROR_MISSING_ARGUMENT",
    UNEXPECTED_ARGUMENT = "ERROR_UNEXPECTED_ARGUMENT",
    NOT_INITIALIZED = "ERROR_NOT_INITIALIZED",
    PROPERTY_NOT_DEFINED = "ERROR_PROPERTY_NOT_DEFINED",
    CALL_EXCEPTION = "ERROR_CALL_EXCEPTION",
    INSUFFICIENT_FUNDS = "ERROR_INSUFFICIENT_FUNDS",
    NONCE_EXPIRED = "ERROR_NONCE_EXPIRED",
    REPLACEMENT_UNDERPRICED = "ERROR_REPLACEMENT_UNDERPRICED",
    UNPREDICTABLE_GAS_LIMIT = "ERROR_UNPREDICTABLE_GAS_LIMIT",
    TRANSACTION_REPLACED = "ERROR_TRANSACTION_REPLACED",
    ACTION_REJECTED = "ERROR_ACTION_REJECTED",
    INVALID_SIGNATURE = "ERROR_INVALID_SIGNATURE"
}
  
interface ErrorParams {
    [name: string]: any;
}

export class CustomError extends Error {
    public code: ErrorCode;
    public reason: string;
    public params: ErrorParams;

    constructor(message: string, code: ErrorCode = ErrorCode.UNKNOWN_ERROR, params: ErrorParams = {}) {
        super(message);
        this.code = code;
        this.reason = message;
        this.params = params;
        Object.setPrototypeOf(this, CustomError.prototype);
    }

    public toString(): string {
        const messageDetails = Object.entries(this.params)
            .map(([key, value]) => `${key}=${serializeValue(value)}`)
            .join(', ');

        const errorMessageStack = messageDetails ? ` (${messageDetails})` : '';

        return `${this.reason}${errorMessageStack}`;
    }
}

export class ErrorUtils {
    public static throwError(message: string, code: ErrorCode = ErrorCode.UNKNOWN_ERROR, params: ErrorParams = {}): never {
        throw new CustomError(message, code, params);
    }

    public static throwArgumentError(message: string, name: string, value: any): never {
        ErrorUtils.throwError(message, ErrorCode.INVALID_ARGUMENT, {
            argument: name,
            value: serializeValue(value),
        });
    }
}

// helper function
const serializeValue = (value: any): string => {
    try {
        return JSON.stringify(value);
    } catch (error) {
        return String(value);
    }
}

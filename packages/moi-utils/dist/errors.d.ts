export declare enum ErrorCode {
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
export declare class CustomError extends Error {
    code: ErrorCode;
    reason: string;
    params: ErrorParams;
    constructor(message: string, code?: ErrorCode, params?: ErrorParams);
    toString(): string;
}
export declare class ErrorUtils {
    static throwError(message: string, code?: ErrorCode, params?: ErrorParams): never;
    static throwArgumentError(message: string, name: string, value: any): never;
}
export {};

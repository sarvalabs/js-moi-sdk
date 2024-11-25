"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonRpcProvider = void 0;
const js_moi_utils_1 = require("@zenz-solutions/js-moi-utils");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const base_provider_1 = require("./base-provider");
/**
 * A class that represents a JSON-RPC provider for making RPC calls over HTTP.
 */
class JsonRpcProvider extends base_provider_1.BaseProvider {
    host;
    constructor(host) {
        super();
        if (/^http(s)?:\/\//i.test(host) || /^ws(s)?:\/\//i.test(host)) {
            this.host = host;
            return;
        }
        js_moi_utils_1.ErrorUtils.throwError("Invalid request url!", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
    }
    /**
     * Executes an RPC call by sending a method and parameters.
     *
     * @param method - The method to call.
     * @param params - The parameters for the method call.
     * @returns A Promise that resolves to the result of the RPC call.
     * @throws Error if there is an error executing the RPC call.
     */
    async execute(method, params) {
        try {
            return await this.send(method, [params]);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Sends an RPC request to the JSON-RPC endpoint.
     *
     * @param method - The method to call.
     * @param params - The parameters for the method call.
     * @returns A Promise that resolves to the result of the RPC call.
     * @throws Error if there is an error sending the RPC request.
     */
    async send(method, params) {
        try {
            const payload = {
                method: method,
                params: params,
                jsonrpc: "2.0",
                id: 1
            };
            const response = await (0, cross_fetch_1.default)(this.host, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errMessage = await response.text();
                if (this.isServerError(response)) {
                    js_moi_utils_1.ErrorUtils.throwError(`Error: ${errMessage}`, js_moi_utils_1.ErrorCode.SERVER_ERROR);
                }
                throw new Error(errMessage);
            }
            return await response.json();
        }
        catch (error) {
            if (error instanceof js_moi_utils_1.CustomError) {
                throw error;
            }
            js_moi_utils_1.ErrorUtils.throwError(`Error: ${error.message}`, js_moi_utils_1.ErrorCode.NETWORK_ERROR);
        }
    }
}
exports.JsonRpcProvider = JsonRpcProvider;
//# sourceMappingURL=jsonrpc-provider.js.map
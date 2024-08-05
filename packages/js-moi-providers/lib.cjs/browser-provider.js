"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserProvider = void 0;
const jsonrpc_provider_1 = require("./jsonrpc-provider");
const js_moi_utils_1 = require("js-moi-utils");
class BrowserProvider extends jsonrpc_provider_1.JsonRpcProvider {
    provider;
    constructor(moi) {
        if (moi == null) {
            js_moi_utils_1.ErrorUtils.throwError("Invalid browser provider!", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        super(moi.host);
        this.provider = moi;
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
        return await this.send(method, [params]);
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
            return await this.provider.request(method, params);
        }
        catch (error) {
            if (error instanceof js_moi_utils_1.CustomError) {
                throw error;
            }
            js_moi_utils_1.ErrorUtils.throwError(`Error: ${error.message}`, js_moi_utils_1.ErrorCode.NETWORK_ERROR);
        }
    }
}
exports.BrowserProvider = BrowserProvider;
//# sourceMappingURL=browser-provider.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoyageProvider = void 0;
const js_moi_utils_1 = require("@zenz-solutions/js-moi-utils");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const base_provider_1 = require("./base-provider");
/**
 * A provider for making RPC calls to voyage nodes.
 */
class VoyageProvider extends base_provider_1.BaseProvider {
    host;
    constructor(network) {
        super();
        switch (network) {
            case 'babylon':
                this.host = "https://voyage-rpc.moi.technology/babylon/";
                break;
            default:
                throw new Error('Unsupported network');
        }
    }
    /**
     * Executes an RPC method with the given parameters.
     *
     * @param {string} method - The method to execute.
     * @param {any} params - The parameters for the method.
     * @returns {Promise<any>} A promise that resolves to the result of the RPC call.
     * @throws {Error} Throws any error encountered during the RPC call.
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
     * Sends an RPC request to the Voyage endpoint.
     *
     * @param {string} method - The method to execute.
     * @param {any[]} params - The parameters for the method.
     * @returns {Promise<any>} A promise that resolves to the result of the RPC call.
     * @throws {Error} Throws any error encountered during the RPC call.
     */
    async send(method, params) {
        try {
            const payload = {
                method: method,
                params: params,
                jsonrpc: '2.0',
                id: 1,
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
        catch (err) {
            if (err instanceof js_moi_utils_1.CustomError) {
                throw err;
            }
            js_moi_utils_1.ErrorUtils.throwError(`Error: ${err.message}`, js_moi_utils_1.ErrorCode.NETWORK_ERROR);
        }
    }
}
exports.VoyageProvider = VoyageProvider;
//# sourceMappingURL=voyage-provider.js.map
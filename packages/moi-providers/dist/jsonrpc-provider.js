"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonRpcProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const moi_utils_1 = require("moi-utils");
const base_provider_1 = require("./base-provider");
const config = {
    headers: {
        'Content-Type': 'application/json'
    },
};
/**
 * JsonRpcProvider
 *
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
        moi_utils_1.ErrorUtils.throwError("Invalid request url!", moi_utils_1.ErrorCode.INVALID_ARGUMENT);
    }
    /**
     * execute
     *
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
     * send
     *
     * Sends an RPC request to the JSON-RPC endpoint.
     *
     * @param method - The method to call.
     * @param params - The parameters for the method call.
     * @returns A Promise that resolves to the result of the RPC call.
     * @throws Error if there is an error sending the RPC request.
     */
    async send(method, params) {
        const payload = {
            method: method,
            params: params,
            jsonrpc: "2.0",
            id: 1
        };
        return axios_1.default.post(this.host, JSON.stringify(payload), config)
            .then(res => {
            return res.data;
        }).catch(err => {
            if (this.isServerError(err)) {
                moi_utils_1.ErrorUtils.throwError(`Error: ${err.message}`, moi_utils_1.ErrorCode.SERVER_ERROR);
            }
            moi_utils_1.ErrorUtils.throwError(`Error: ${err.message}`, moi_utils_1.ErrorCode.NETWORK_ERROR);
        });
    }
    /**
     * _startEvent
     *
     * Starts an event.
     *
     * @param event - The event to start.
     */
    _startEvent(event) {
        super._startEvent(event);
    }
    /**
     * _stopEvent
     *
     * Stops an event.
     *
     * @param event - The event to stop.
     */
    _stopEvent(event) {
        super._stopEvent(event);
    }
}
exports.JsonRpcProvider = JsonRpcProvider;

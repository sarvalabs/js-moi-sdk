"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoyageProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const base_provider_1 = require("./base-provider");
const config = {
    headers: {
        'Content-Type': 'application/json',
    },
};
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
        const payload = {
            method: method,
            params: params,
            jsonrpc: '2.0',
            id: 1,
        };
        return axios_1.default
            .post(this.host, JSON.stringify(payload), config)
            .then((res) => {
            return res.data;
        })
            .catch((err) => {
            throw err;
        });
    }
}
exports.VoyageProvider = VoyageProvider;

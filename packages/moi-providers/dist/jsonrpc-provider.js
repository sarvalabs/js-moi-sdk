"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonRpcProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const base_provider_1 = require("./base-provider");
const config = {
    headers: {
        'Content-Type': 'application/json'
    },
};
class JsonRpcProvider extends base_provider_1.BaseProvider {
    host;
    constructor(host) {
        super();
        if (/^http(s)?:\/\//i.test(host) || /^ws(s)?:\/\//i.test(host)) {
            this.host = host;
            return;
        }
        throw new Error("Invalid request url!");
    }
    async execute(method, params) {
        try {
            return await this.send(method, [params]);
        }
        catch (error) {
            throw error;
        }
    }
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
            throw err;
        });
    }
    _startEvent(event) {
        super._startEvent(event);
    }
    _stopEvent(event) {
        super._stopEvent(event);
    }
}
exports.JsonRpcProvider = JsonRpcProvider;

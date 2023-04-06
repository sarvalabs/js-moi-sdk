import axios from "axios";
import { BaseProvider } from "./base-provider";
const config = {
    headers: {
        'Content-Type': 'application/json'
    },
};
export class JsonRpcProvider extends BaseProvider {
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
            return error;
        }
    }
    async send(method, params) {
        const payload = {
            method: method,
            params: params,
            jsonrpc: "2.0",
            id: 1
        };
        return axios.post(this.host, JSON.stringify(payload), config)
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

import axios from "axios";
import { BaseProvider } from "./base-provider";
import Event from "./event";

const config = {
    headers: { 
      'Content-Type': 'application/json'
    },
}

export class JsonRpcProvider extends BaseProvider {
    public host: string;

    constructor(host: string) {
        super();

        if(/^http(s)?:\/\//i.test(host) || /^ws(s)?:\/\//i.test(host)) {
            this.host = host

            return
        }

        throw new Error("Invalid request url!")
    }

    public async execute(method: string, params: any): Promise<any> {
        try {
            return await this.send(method, [params])
        } catch (error) {
            throw error
        }
    }

    public async send(method: string, params: any[]): Promise<any> {
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

    public _startEvent(event: Event): void {
        super._startEvent(event);
    }

    public _stopEvent(event: Event): void {
        super._stopEvent(event);
    }
}

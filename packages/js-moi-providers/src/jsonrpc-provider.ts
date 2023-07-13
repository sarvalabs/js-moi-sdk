import axios from "axios";
import { ErrorCode, ErrorUtils } from "js-moi-utils";
import { BaseProvider } from "./base-provider";
import Event from "./event";

const config = {
    headers: { 
      'Content-Type': 'application/json'
    },
}

/**
 * A class that represents a JSON-RPC provider for making RPC calls over HTTP.
 */
export class JsonRpcProvider extends BaseProvider {
    protected host: string;

    constructor(host: string) {
        super();

        if(/^http(s)?:\/\//i.test(host) || /^ws(s)?:\/\//i.test(host)) {
            this.host = host

            return
        }

        ErrorUtils.throwError("Invalid request url!", ErrorCode.INVALID_ARGUMENT)
    }

    /**
     * Executes an RPC call by sending a method and parameters.
     *
     * @param method - The method to call.
     * @param params - The parameters for the method call.
     * @returns A Promise that resolves to the result of the RPC call.
     * @throws Error if there is an error executing the RPC call.
     */
    protected async execute(method: string, params: any): Promise<any> {
        try {
            return await this.send(method, [params])
        } catch (error) {
            throw error
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
    protected async send(method: string, params: any[]): Promise<any> {
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
            if(this.isServerError(err)) {
                ErrorUtils.throwError(
                    `Error: ${err.message}`,
                    ErrorCode.SERVER_ERROR
                )
            }

            ErrorUtils.throwError(
                `Error: ${err.message}`,
                ErrorCode.NETWORK_ERROR
            )
        });
    }

    /**
     * Starts an event.
     *
     * @param event - The event to start.
     */
    protected _startEvent(event: Event): void {
        super._startEvent(event);
    }

    /**
     * Stops an event.
     *
     * @param event - The event to stop.
     */
    protected _stopEvent(event: Event): void {
        super._stopEvent(event);
    }
}

import { CustomError, ErrorCode, ErrorUtils } from "@zenz-solutions/js-moi-utils";
import fetch from "cross-fetch";
import { RpcResponse } from "../types/jsonrpc";
import { BaseProvider } from "./base-provider";

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
    protected async execute<T>(method: string, params: any): Promise<RpcResponse<T>> {
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
    protected async send<T>(method: string, params: any[]): Promise<RpcResponse<T>> {
        try {
            const payload = {
                method: method,
                params: params,
                jsonrpc: "2.0",
                id: 1
            };

            const response = await fetch(this.host, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                const errMessage = await response.text();
    
                if (this.isServerError(response)) {
                    ErrorUtils.throwError(
                        `Error: ${errMessage}`,
                        ErrorCode.SERVER_ERROR
                    )
                }
    
                throw new Error(errMessage)
            }
    
            return await response.json()
        } catch(error) {
            if(error instanceof CustomError) {
                throw error;
            }
    
            ErrorUtils.throwError(
                `Error: ${error.message}`,
                ErrorCode.NETWORK_ERROR
            )
        }
    }
}

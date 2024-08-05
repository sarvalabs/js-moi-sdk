import { JsonRpcProvider } from "./jsonrpc-provider";
import { MoiBrowserProvider } from "../types/browser";
import { RpcResponse } from "../types/jsonrpc";
import { CustomError, ErrorCode, ErrorUtils } from "js-moi-utils";

export class BrowserProvider extends JsonRpcProvider {
    private provider: MoiBrowserProvider

    constructor(moi: MoiBrowserProvider) {
        if(moi == null) {
            ErrorUtils.throwError(
                "Invalid browser provider!",
                ErrorCode.INVALID_ARGUMENT
            );
        }

        super(moi.host)

        this.provider = moi
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
        return await this.send(method, [params])
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
            return await this.provider.request(method, params)
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

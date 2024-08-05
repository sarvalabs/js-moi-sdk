import { JsonRpcProvider } from "./jsonrpc-provider";
import { MoiBrowserProvider } from "../types/browser";
import { RpcResponse } from "../types/jsonrpc";
export declare class BrowserProvider extends JsonRpcProvider {
    private provider;
    constructor(moi: MoiBrowserProvider);
    /**
     * Executes an RPC call by sending a method and parameters.
     *
     * @param method - The method to call.
     * @param params - The parameters for the method call.
     * @returns A Promise that resolves to the result of the RPC call.
     * @throws Error if there is an error executing the RPC call.
     */
    protected execute<T>(method: string, params: any): Promise<RpcResponse<T>>;
    /**
     * Sends an RPC request to the JSON-RPC endpoint.
     *
     * @param method - The method to call.
     * @param params - The parameters for the method call.
     * @returns A Promise that resolves to the result of the RPC call.
     * @throws Error if there is an error sending the RPC request.
     */
    protected send<T>(method: string, params: any[]): Promise<RpcResponse<T>>;
}
//# sourceMappingURL=browser-provider.d.ts.map
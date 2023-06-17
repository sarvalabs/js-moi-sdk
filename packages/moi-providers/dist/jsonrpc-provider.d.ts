import { BaseProvider } from "./base-provider";
import Event from "./event";
/**
 * JsonRpcProvider
 *
 * A class that represents a JSON-RPC provider for making RPC calls over HTTP.
 */
export declare class JsonRpcProvider extends BaseProvider {
    protected host: string;
    constructor(host: string);
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
    protected execute(method: string, params: any): Promise<any>;
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
    protected send(method: string, params: any[]): Promise<any>;
    /**
     * _startEvent
     *
     * Starts an event.
     *
     * @param event - The event to start.
     */
    protected _startEvent(event: Event): void;
    /**
     * _stopEvent
     *
     * Stops an event.
     *
     * @param event - The event to stop.
     */
    protected _stopEvent(event: Event): void;
}

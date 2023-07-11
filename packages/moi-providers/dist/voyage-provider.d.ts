import { BaseProvider } from './base-provider';
/**
 * A provider for making RPC calls to voyage nodes.
 */
export declare class VoyageProvider extends BaseProvider {
    private host;
    constructor(network: string);
    /**
     * Executes an RPC method with the given parameters.
     * @param {string} method - The method to execute.
     * @param {any} params - The parameters for the method.
     * @returns {Promise<any>} A promise that resolves to the result of the RPC call.
     * @throws {Error} Throws any error encountered during the RPC call.
     */
    protected execute(method: string, params: any): Promise<any>;
    /**
     * Sends an RPC request to the Voyage endpoint.
     *
     * @param {string} method - The method to execute.
     * @param {any[]} params - The parameters for the method.
     * @returns {Promise<any>} A promise that resolves to the result of the RPC call.
     * @throws {Error} Throws any error encountered during the RPC call.
     */
    protected send(method: string, params: any[]): Promise<any>;
}

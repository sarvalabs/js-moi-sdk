import { CustomError, ErrorCode, ErrorUtils } from "@zenz-solutions/js-moi-utils";
import fetch from 'cross-fetch';
import { RpcResponse } from '../types/jsonrpc';
import { BaseProvider } from './base-provider';

/**
 * A provider for making RPC calls to voyage nodes.
 */
export class VoyageProvider extends BaseProvider {
  private host: string;

  constructor(network: string) {
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
   * 
   * @param {string} method - The method to execute.
   * @param {any} params - The parameters for the method.
   * @returns {Promise<any>} A promise that resolves to the result of the RPC call.
   * @throws {Error} Throws any error encountered during the RPC call.
   */
  protected async execute<T>(method: string, params: any): Promise<RpcResponse<T>> {
    try {
      return await this.send(method, [params]);
    } catch (error) {
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
  protected async send(method: string, params: any[]): Promise<any> {
    try {
      const payload = {
        method: method,
        params: params,
        jsonrpc: '2.0',
        id: 1,
      };
  
      const response = await fetch(this.host, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json'
        }
      })

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
    } catch(err) {
      if(err instanceof CustomError) {
        throw err;
      }

      ErrorUtils.throwError(
          `Error: ${err.message}`,
          ErrorCode.NETWORK_ERROR
      )
    }
  }
}

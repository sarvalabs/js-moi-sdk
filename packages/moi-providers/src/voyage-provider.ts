import axios from 'axios';
import { BaseProvider } from './base-provider';

const config = {
  headers: {
    'Content-Type': 'application/json',
  },
};

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
  protected async execute(method: string, params: any): Promise<any> {
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
    const payload = {
      method: method,
      params: params,
      jsonrpc: '2.0',
      id: 1,
    };

    return axios
      .post(this.host, JSON.stringify(payload), config)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        throw err;
      });
  }
}

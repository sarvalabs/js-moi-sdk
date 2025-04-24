import { EventEmitter } from "events";
import { bytesToHex, randomBytes, type Hex, type JsonRpcResponse, type Transport } from "js-moi-utils";
import type { ExecuteIx } from "../../src.ts";

export class BrowserMockTransport extends EventEmitter implements Transport {
    getDummyResponse<TResult = any>(method: string): TResult {
        switch (method) {
            case "wallet.Accounts": {
                return Array.from<Hex>({ length: 5 }).map((v) => bytesToHex(randomBytes(32))) as TResult;
            }

            case "wallet.Account": {
                return {
                    address: randomBytes(32),
                    keyId: 0,
                    name: "Master Account",
                    path: "m/44'/6174'/0'/0/0",
                    publicKey: "dc5eb85d67415c428131dbfef694608a38c8dbb203d1ae1acd956a7415ddd7eb",
                } as TResult;
            }

            case "wallet.ClientVersion": {
                return "0.0.1" as TResult;
            }

            case "wallet.EncryptionPublicKey": {
                return "0x1234567890abcdef" as TResult;
            }

            case "wallet.Network": {
                return {
                    blockExplorer: "https://voyage.moi.technology/",
                    chain_id: 101,
                    id: "c786778a-6d0d-447e-a03b-915eb4409973",
                    jsonRpcHost: "https://voyage-rpc.moi.technology/babylon/",
                    name: "Giza Testnet",
                } as TResult;
            }

            case "wallet.RevokePermissions": {
                return null as TResult;
            }

            case "wallet.GetPermissions": {
                return [
                    {
                        capability: "wallet.Accounts",
                        caveats: [
                            {
                                type: "returnAddress",
                                value: ["0x00000000dc5eb85d67415c428131dbfef694608a38c8dbb203d1ae1a00000000", "0x0000000078648b0296bf21bf050c24695b48d3c8c58a386c4d36bdd500000000"],
                            },
                        ],
                        id: "373877e3-d4a0-41c2-a960-d9edc77523ec",
                        invoker: "http://localhost:5173/",
                    },
                ] as TResult;
            }

            case "wallet.SignMessage": {
                const signature = bytesToHex(randomBytes(30));
                return signature as TResult;
            }

            case "wallet.SignInteraction": {
                const ix: ExecuteIx = {
                    interaction: bytesToHex(randomBytes(100)),
                    signatures: [
                        {
                            id: bytesToHex(randomBytes(32)),
                            key_id: 0,
                            signature: bytesToHex(randomBytes(30)),
                        },
                    ],
                };
                return ix as TResult;
            }

            case "wallet.SendInteraction": {
                return bytesToHex(randomBytes(32)) as TResult;
            }

            case "wallet.RequestPermissions": {
                return [
                    {
                        capability: "wallet.Accounts",
                        caveats: [
                            {
                                type: "returnAddress",
                                value: ["0x00000000dc5eb85d67415c428131dbfef694608a38c8dbb203d1ae1a00000000", "0x0000000078648b0296bf21bf050c24695b48d3c8c58a386c4d36bdd500000000"],
                            },
                        ],
                        id: "373877e3-d4a0-41c2-a960-d9edc77523ec",
                        invoker: "http://localhost:5173/",
                    },
                ] as TResult;
            }
        }

        throw new Error(`Method ${method} not supported`);
    }

    async request<TResult = unknown>(method: string, params: unknown[]): Promise<JsonRpcResponse<TResult>> {
        const data = this.getDummyResponse<TResult>(method);

        return {
            id: 1,
            jsonrpc: "2.0",
            result: data,
        };
    }
}

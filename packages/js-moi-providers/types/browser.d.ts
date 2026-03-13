import type { Hex } from "js-moi-utils";

export interface RequestPermissions {
    "wallet.Accounts": {};
}

export interface RequestPermissionsResult {
    "wallet.Accounts": {
        capability: "wallet.Accounts";
        id: string;
        invoker: string;
        caveats: { type: "returnAddress"; value: Hex[] }[];
    };
}

export interface NetworkConfiguration {
    id: string;
    name: string;
    jsonRpcHost: string;
    blockExplorer?: string;
}

export interface WalletAccount {
    id: Hex;
    name?: string;
    path: string;
    pubkey: string;
}

export interface WalletParticipant {
    readonly id: string;
    name: Hex;
    accounts: WalletAccount[];
}

export interface WalletEventListenerMap {
    accountChange: (identifier: Hex) => void;
    networkChange: (host: NetworkConfiguration) => void;

    // !Important to note: (string & {}) is specifically used to prevent the type from being narrowed to a string literal type.
    // This also helps provides a better developer experience by allowing the developer to use string literals or symbols as event names along
    // with suggestions and autocompletion in modern IDEs.
    [key: (string & {}) | symbol]: (...args: any[]) => void;
}

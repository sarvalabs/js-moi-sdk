export namespace MAS1 {
    export enum Endpoint {
        TRANSFER = "Transfer",
        TRANSFERFROM = "TransferFrom",
        MINT = "Mint",
        MINTWITHMETADATA="MintWithMetadata",
        LOCKUP = "Lockup",
        BURN = "Burn",
        APPROVE = "Approve",
        RELEASE = "Release",
        REVOKE = "Revoke",
        SETSTATICMETADATA = "SetStaticMetadata",
        SETDYNAMICMETADATA = "SetDynamicMetadata",

        // Non Mutable endpoints
        SYMBOL = "Symbol",
        BALANCEOF = "BalanceOf",
        CREATOR = "Creator",
        MANAGER = "Manager",
        DECIMALS = "Decimals",
        MAXSUPPLY = "MaxSupply",
        CIRCULATINGSUPPLY = "CirculatingSupply",
        GETSTATICMETADATA ="GetStaticMetadata",
        GETDYNAMICMETADATA ="GetDynamicMetadata",
    }

    export interface Transfer {
        beneficiary: Uint8Array;
        amount: number | bigint;
    }

    export interface TransferFrom {
        benefactor: Uint8Array;
        beneficiary: Uint8Array;
        amount: number | bigint;
    }

    export interface Burn {
        amount: number | bigint;
    }

    export interface Mint {
        beneficiary: Uint8Array;
        amount: number | bigint;
    }

    export interface MintWithMetadata {
        beneficiary: Uint8Array;
        amount: number | bigint;
        static_metadata: Record<string, Uint8Array>;
    }

    export interface Approve {
        beneficiary: Uint8Array;
        amount: number | bigint;
        expires_at: number;
    }

    export interface Lockup {
        beneficiary: Uint8Array;
        amount: number | bigint;
    }

    export interface Release {
        benefactor: Uint8Array;
        beneficiary: Uint8Array;
        amount: number | bigint;
    }

    export interface SetStaticMetadata {
        key: string;
        value: Uint8Array;
    }

    export interface SetDynamicMetadata {
        key: string;
        value: Uint8Array;
    }

    export interface Revoke {
        beneficiary: Uint8Array;
    }

    export interface BalanceOf {
        address: Uint8Array;
    }

    export type OperationPayload =
        | Transfer
        | Mint
        | MintWithMetadata
        | Burn
        | Approve
        | Lockup
        | Release
        | Revoke
        | SetStaticMetadata
        | SetDynamicMetadata
        | BalanceOf;

    /** Union of all operation payloads */
    export type Operation =
        | { callsite: Endpoint.TRANSFER; payload: Transfer }
        | { callsite: Endpoint.MINT; payload: Mint }
        | { callsite: Endpoint.MINTWITHMETADATA; payload: MintWithMetadata }
        | { callsite: Endpoint.BURN; payload: Burn }
        | { callsite: Endpoint.APPROVE; payload: Approve }
        | { callsite: Endpoint.LOCKUP; payload: Lockup }
        | { callsite: Endpoint.RELEASE; payload: Release }
        | { callsite: Endpoint.REVOKE; payload: Revoke }
        | { callsite: Endpoint.BALANCEOF; payload: BalanceOf };
}


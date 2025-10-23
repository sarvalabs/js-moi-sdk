export namespace MAS0 {
    export enum Endpoint {
        TRANSFER = "Transfer",
        TRANSFERFROM = "TransferFrom",
        MINT = "Mint",
        LOCKUP = "Lockup",
        BURN = "Burn",
        APPROVE = "Approve",
        RELEASE = "Release",
        REVOKE = "Revoke",

        // Non Mutable endpoints
        SYMBOL = "Symbol",
        BALANCEOF = "BalanceOf"
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

    export interface Revoke {
        beneficiary: Uint8Array;
    }

    export interface BalanceOf {
        address: Uint8Array;
    }

    export type OperationPayload =
        | Transfer
        | Mint
        | Burn
        | Approve
        | Lockup
        | Release
        | Revoke
        | BalanceOf;

    /** Union of all operation payloads */
    export type Operation =
        | { callsite: Endpoint.TRANSFER; payload: Transfer }
        | { callsite: Endpoint.MINT; payload: Mint }
        | { callsite: Endpoint.BURN; payload: Burn }
        | { callsite: Endpoint.APPROVE; payload: Approve }
        | { callsite: Endpoint.LOCKUP; payload: Lockup }
        | { callsite: Endpoint.RELEASE; payload: Release }
        | { callsite: Endpoint.REVOKE; payload: Revoke }
        | { callsite: Endpoint.BALANCEOF; payload: BalanceOf };
}


export namespace MAS1 {
    /** MAS1 operation endpoints (NFT-style) */
    export enum Endpoint {
        TRANSFER = "Transfer",
        MINT = "Mint",
        BURN = "Burn",
        APPROVE = "Approve",
        SET_APPROVAL_FOR_ALL = "SetApprovalForAll",
    }

    /** Transfer a specific token between two ids */
    export interface Transfer {
        from: Uint8Array;
        to: Uint8Array;
        token_id: number | bigint;
    }

    /** Mint a new unique token */
    export interface Mint {
        beneficiary: Uint8Array;
        token_id: number | bigint;
        metadata?: Uint8Array; // Optional metadata
    }

    /** Burn (destroy) a token */
    export interface Burn {
        token_id: number | bigint;
    }

    /** Approve an address to manage a specific token */
    export interface Approve {
        approved: Uint8Array;
        token_id: number | bigint;
    }

    /** Approve or revoke operator rights for all tokens of an owner */
    export interface SetApprovalForAll {
        operator: Uint8Array;
        approved: boolean;
    }

    /** Union of all MAS1 operation payload types */
    export type OperationPayload =
        | Transfer
        | Mint
        | Burn
        | Approve
        | SetApprovalForAll;

    /** Discriminated union for operation callsites */
    export type Operation =
        | { callsite: Endpoint.TRANSFER; payload: Transfer }
        | { callsite: Endpoint.MINT; payload: Mint }
        | { callsite: Endpoint.BURN; payload: Burn }
        | { callsite: Endpoint.APPROVE; payload: Approve }
        | { callsite: Endpoint.SET_APPROVAL_FOR_ALL; payload: SetApprovalForAll };
}

export declare namespace MAS1 {
    /** MAS1 operation endpoints (NFT-style) */
    enum Endpoint {
        TRANSFER = "Transfer",
        MINT = "Mint",
        BURN = "Burn",
        APPROVE = "Approve",
        SET_APPROVAL_FOR_ALL = "SetApprovalForAll"
    }
    /** Transfer a specific token between two ids */
    interface Transfer {
        from: Uint8Array;
        to: Uint8Array;
        token_id: number | bigint;
    }
    /** Mint a new unique token */
    interface Mint {
        beneficiary: Uint8Array;
        token_id: number | bigint;
        metadata?: Uint8Array;
    }
    /** Burn (destroy) a token */
    interface Burn {
        token_id: number | bigint;
    }
    /** Approve an address to manage a specific token */
    interface Approve {
        approved: Uint8Array;
        token_id: number | bigint;
    }
    /** Approve or revoke operator rights for all tokens of an owner */
    interface SetApprovalForAll {
        operator: Uint8Array;
        approved: boolean;
    }
    /** Union of all MAS1 operation payload types */
    type OperationPayload = Transfer | Mint | Burn | Approve | SetApprovalForAll;
    /** Discriminated union for operation callsites */
    type Operation = {
        callsite: Endpoint.TRANSFER;
        payload: Transfer;
    } | {
        callsite: Endpoint.MINT;
        payload: Mint;
    } | {
        callsite: Endpoint.BURN;
        payload: Burn;
    } | {
        callsite: Endpoint.APPROVE;
        payload: Approve;
    } | {
        callsite: Endpoint.SET_APPROVAL_FOR_ALL;
        payload: SetApprovalForAll;
    };
}
//# sourceMappingURL=mas1.d.ts.map
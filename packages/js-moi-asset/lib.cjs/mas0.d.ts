export declare namespace MAS0 {
    enum Endpoint {
        TRANSFER = "Transfer",
        TRANSFERFROM = "TransferFrom",
        MINT = "Mint",
        LOCKUP = "Lockup",
        BURN = "Burn",
        APPROVE = "Approve",
        RELEASE = "Release",
        REVOKE = "Revoke",
        SYMBOL = "Symbol",
        BALANCEOF = "BalanceOf"
    }
    interface Transfer {
        beneficiary: Uint8Array;
        amount: number | bigint;
    }
    interface TransferFrom {
        benefactor: Uint8Array;
        beneficiary: Uint8Array;
        amount: number | bigint;
    }
    interface Burn {
        amount: number | bigint;
    }
    interface Mint {
        beneficiary: Uint8Array;
        amount: number | bigint;
    }
    interface Approve {
        beneficiary: Uint8Array;
        amount: number | bigint;
        expires_at: number;
    }
    interface Lockup {
        beneficiary: Uint8Array;
        amount: number | bigint;
    }
    interface Release {
        benefactor: Uint8Array;
        beneficiary: Uint8Array;
        amount: number | bigint;
    }
    interface Revoke {
        beneficiary: Uint8Array;
    }
    interface BalanceOf {
        address: Uint8Array;
    }
    type OperationPayload = Transfer | Mint | Burn | Approve | Lockup | Release | Revoke | BalanceOf;
    /** Union of all operation payloads */
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
        callsite: Endpoint.LOCKUP;
        payload: Lockup;
    } | {
        callsite: Endpoint.RELEASE;
        payload: Release;
    } | {
        callsite: Endpoint.REVOKE;
        payload: Revoke;
    } | {
        callsite: Endpoint.BALANCEOF;
        payload: BalanceOf;
    };
}
//# sourceMappingURL=mas0.d.ts.map
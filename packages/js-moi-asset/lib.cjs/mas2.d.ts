export declare namespace MAS2 {
    enum Endpoint {
        TRANSFER = "Transfer",
        TRANSFERFROM = "TransferFrom",
        MINT = "Mint",
        MINTWITHMETADATA = "MintWithMetadata",
        LOCKUP = "Lockup",
        BURN = "Burn",
        APPROVE = "Approve",
        RELEASE = "Release",
        REVOKE = "Revoke",
        SETSTATICMETADATA = "SetStaticMetadata",
        SETDYNAMICMETADATA = "SetDynamicMetadata",
        SYMBOL = "Symbol",
        BALANCEOF = "BalanceOf",
        CREATOR = "Creator",
        MANAGER = "Manager",
        DECIMALS = "Decimals",
        MAXSUPPLY = "MaxSupply",
        CIRCULATINGSUPPLY = "CirculatingSupply",
        GETSTATICMETADATA = "GetStaticMetadata",
        GETDYNAMICMETADATA = "GetDynamicMetadata"
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
    interface MintWithMetadata {
        beneficiary: Uint8Array;
        amount: number | bigint;
        static_metadata: Record<string, Uint8Array>;
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
    interface SetStaticMetadata {
        key: string;
        value: Uint8Array;
    }
    interface SetDynamicMetadata {
        key: string;
        value: Uint8Array;
    }
    interface Revoke {
        beneficiary: Uint8Array;
    }
    interface BalanceOf {
        address: Uint8Array;
    }
    type OperationPayload = Transfer | Mint | MintWithMetadata | Burn | Approve | Lockup | Release | Revoke | SetStaticMetadata | SetDynamicMetadata | BalanceOf;
    /** Union of all operation payloads */
    type Operation = {
        callsite: Endpoint.TRANSFER;
        payload: Transfer;
    } | {
        callsite: Endpoint.MINT;
        payload: Mint;
    } | {
        callsite: Endpoint.MINTWITHMETADATA;
        payload: MintWithMetadata;
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
//# sourceMappingURL=mas2.d.ts.map
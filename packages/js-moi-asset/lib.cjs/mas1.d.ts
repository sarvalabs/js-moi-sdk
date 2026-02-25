export declare namespace MAS1 {
    enum Endpoint {
        TRANSFER = "Transfer",
        TRANSFERFROM = "TransferFrom",
        MINT = "Mint",
        MINTWITHMETADATA = "MintWithMetadata",
        BURN = "Burn",
        LOCKUP = "Lockup",
        RELEASE = "Release",
        APPROVE = "Approve",
        REVOKE = "Revoke",
        SETSTATICMETADATA = "SetStaticMetadata",
        SETDYNAMICMETADATA = "SetDynamicMetadata",
        SETSTATICTOKENMETADATA = "SetStaticTokenMetadata",
        SETDYNAMICTOKENMETADATA = "SetDynamicTokenMetadata",
        SYMBOL = "Symbol",
        ISOWNER = "IsOwner",
        CREATOR = "Creator",
        MANAGER = "Manager",
        GETSTATICMETADATA = "GetStaticMetadata",
        GETDYNAMICMETADATA = "GetDynamicMetadata",
        GETSTATICTOKENMETADATA = "GetStaticTokenMetadata",
        GETDYNAMICTOKENMETADATA = "GetDynamicTokenMetadata"
    }
    interface Transfer {
        token_id: number | bigint;
        beneficiary: Uint8Array;
    }
    interface TransferFrom {
        token_id: number | bigint;
        benefactor: Uint8Array;
        beneficiary: Uint8Array;
    }
    interface Mint {
        beneficiary: Uint8Array;
    }
    interface MintWithMetadata {
        beneficiary: Uint8Array;
        static_metadata: Map<string, Uint8Array>;
    }
    interface Burn {
        token_id: number | bigint;
    }
    interface Lockup {
        token_id: number | bigint;
        beneficiary: Uint8Array;
    }
    interface Release {
        token_id: number | bigint;
        benefactor: Uint8Array;
        beneficiary: Uint8Array;
    }
    interface Approve {
        token_id: number | bigint;
        beneficiary: Uint8Array;
        expires_at: number;
    }
    interface Revoke {
        token_id: number | bigint;
        beneficiary: Uint8Array;
    }
    interface IsOwner {
        token_id: number | bigint;
        address: Uint8Array;
    }
    interface SetStaticMetadata {
        key: string;
        value: Uint8Array;
    }
    interface SetDynamicMetadata {
        key: string;
        value: Uint8Array;
    }
    interface GetStaticMetadata {
        key: string;
    }
    interface GetDynamicMetadata {
        key: string;
    }
    interface SetStaticTokenMetadata {
        token_id: number | bigint;
        key: string;
        value: Uint8Array;
    }
    interface SetDynamicTokenMetadata {
        token_id: number | bigint;
        key: string;
        value: Uint8Array;
    }
    interface GetStaticTokenMetadata {
        token_id: number | bigint;
        key: string;
    }
    interface GetDynamicTokenMetadata {
        token_id: number | bigint;
        key: string;
    }
    type OperationPayload = Transfer | TransferFrom | Mint | MintWithMetadata | Burn | Lockup | Release | Approve | Revoke | SetStaticMetadata | SetDynamicMetadata | GetStaticMetadata | GetDynamicMetadata | SetStaticTokenMetadata | GetStaticTokenMetadata | SetDynamicTokenMetadata | GetDynamicTokenMetadata;
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
        callsite: Endpoint.LOCKUP;
        payload: Lockup;
    } | {
        callsite: Endpoint.RELEASE;
        payload: Release;
    } | {
        callsite: Endpoint.APPROVE;
        payload: Approve;
    } | {
        callsite: Endpoint.REVOKE;
        payload: Revoke;
    } | {
        callsite: Endpoint.ISOWNER;
        payload: IsOwner;
    } | {
        callsite: Endpoint.SETSTATICMETADATA;
        payload: SetStaticMetadata;
    } | {
        callsite: Endpoint.GETSTATICMETADATA;
        payload: GetStaticMetadata;
    } | {
        callsite: Endpoint.SETDYNAMICMETADATA;
        payload: SetDynamicMetadata;
    } | {
        callsite: Endpoint.GETDYNAMICMETADATA;
        payload: GetDynamicMetadata;
    } | {
        callsite: Endpoint.SETSTATICTOKENMETADATA;
        payload: SetStaticTokenMetadata;
    } | {
        callsite: Endpoint.GETSTATICTOKENMETADATA;
        payload: GetStaticTokenMetadata;
    } | {
        callsite: Endpoint.SETDYNAMICTOKENMETADATA;
        payload: SetDynamicTokenMetadata;
    } | {
        callsite: Endpoint.GETDYNAMICTOKENMETADATA;
        payload: GetDynamicTokenMetadata;
    };
}
//# sourceMappingURL=mas1.d.ts.map
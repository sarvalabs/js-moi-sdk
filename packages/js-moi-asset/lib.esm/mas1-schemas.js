// mas1-schemas.ts
export const MINT_NFT_SCHEMA = {
    kind: "struct",
    fields: {
        beneficiary: { kind: "bytes" }, // Address of receiver
        token_id: { kind: "integer" }, // Unique token ID
        metadata: { kind: "bytes" } // Optional metadata (can be empty)
    }
};
export const BURN_NFT_SCHEMA = {
    kind: "struct",
    fields: {
        token_id: { kind: "integer" } // Token ID to burn
    }
};
export const TRANSFER_NFT_SCHEMA = {
    kind: "struct",
    fields: {
        from: { kind: "bytes" }, // Sender address
        to: { kind: "bytes" }, // Receiver address
        token_id: { kind: "integer" } // Token ID being transferred
    }
};
export const APPROVE_NFT_SCHEMA = {
    kind: "struct",
    fields: {
        approved: { kind: "bytes" }, // Address being approved
        token_id: { kind: "integer" } // Token ID approval applies to
    }
};
export const SET_APPROVAL_FOR_ALL_SCHEMA = {
    kind: "struct",
    fields: {
        operator: { kind: "bytes" }, // Operator address
        approved: { kind: "bool" } // True = approve, False = revoke
    }
};
//# sourceMappingURL=mas1-schemas.js.map
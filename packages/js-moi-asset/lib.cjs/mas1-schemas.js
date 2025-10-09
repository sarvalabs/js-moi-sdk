"use strict";
// mas1-schemas.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.SET_APPROVAL_FOR_ALL_SCHEMA = exports.APPROVE_NFT_SCHEMA = exports.TRANSFER_NFT_SCHEMA = exports.BURN_NFT_SCHEMA = exports.MINT_NFT_SCHEMA = void 0;
exports.MINT_NFT_SCHEMA = {
    kind: "struct",
    fields: {
        beneficiary: { kind: "bytes" }, // Address of receiver
        token_id: { kind: "integer" }, // Unique token ID
        metadata: { kind: "bytes" } // Optional metadata (can be empty)
    }
};
exports.BURN_NFT_SCHEMA = {
    kind: "struct",
    fields: {
        token_id: { kind: "integer" } // Token ID to burn
    }
};
exports.TRANSFER_NFT_SCHEMA = {
    kind: "struct",
    fields: {
        from: { kind: "bytes" }, // Sender address
        to: { kind: "bytes" }, // Receiver address
        token_id: { kind: "integer" } // Token ID being transferred
    }
};
exports.APPROVE_NFT_SCHEMA = {
    kind: "struct",
    fields: {
        approved: { kind: "bytes" }, // Address being approved
        token_id: { kind: "integer" } // Token ID approval applies to
    }
};
exports.SET_APPROVAL_FOR_ALL_SCHEMA = {
    kind: "struct",
    fields: {
        operator: { kind: "bytes" }, // Operator address
        approved: { kind: "bool" } // True = approve, False = revoke
    }
};
//# sourceMappingURL=mas1-schemas.js.map
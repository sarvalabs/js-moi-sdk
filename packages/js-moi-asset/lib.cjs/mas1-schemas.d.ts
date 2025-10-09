export declare const MINT_NFT_SCHEMA: {
    kind: string;
    fields: {
        beneficiary: {
            kind: string;
        };
        token_id: {
            kind: string;
        };
        metadata: {
            kind: string;
        };
    };
};
export declare const BURN_NFT_SCHEMA: {
    kind: string;
    fields: {
        token_id: {
            kind: string;
        };
    };
};
export declare const TRANSFER_NFT_SCHEMA: {
    kind: string;
    fields: {
        from: {
            kind: string;
        };
        to: {
            kind: string;
        };
        token_id: {
            kind: string;
        };
    };
};
export declare const APPROVE_NFT_SCHEMA: {
    kind: string;
    fields: {
        approved: {
            kind: string;
        };
        token_id: {
            kind: string;
        };
    };
};
export declare const SET_APPROVAL_FOR_ALL_SCHEMA: {
    kind: string;
    fields: {
        operator: {
            kind: string;
        };
        approved: {
            kind: string;
        };
    };
};
//# sourceMappingURL=mas1-schemas.d.ts.map
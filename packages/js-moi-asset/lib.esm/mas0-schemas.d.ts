export declare const TRANSFER_SCHEMA: {
    kind: string;
    fields: {
        beneficiary: {
            kind: string;
        };
        amount: {
            kind: string;
        };
    };
};
export declare const TRANSFER_FROM_SCHEMA: {
    kind: string;
    fields: {
        benefactor: {
            kind: string;
        };
        beneficiary: {
            kind: string;
        };
        amount: {
            kind: string;
        };
    };
};
export declare const BURN_SCHEMA: {
    kind: string;
    fields: {
        amount: {
            kind: string;
        };
    };
};
export declare const MINT_SCHEMA: {
    kind: string;
    fields: {
        beneficiary: {
            kind: string;
        };
        amount: {
            kind: string;
        };
    };
};
export declare const APPROVE_SCHEMA: {
    kind: string;
    fields: {
        beneficiary: {
            kind: string;
        };
        amount: {
            kind: string;
        };
        expires_at: {
            kind: string;
        };
    };
};
export declare const LOCKUP_SCHEMA: {
    kind: string;
    fields: {
        beneficiary: {
            kind: string;
        };
        amount: {
            kind: string;
        };
    };
};
export declare const RELEASE_SCHEMA: {
    kind: string;
    fields: {
        benefactor: {
            kind: string;
        };
        beneficiary: {
            kind: string;
        };
        amount: {
            kind: string;
        };
    };
};
export declare const REVOKE_SCHEMA: {
    kind: string;
    fields: {
        beneficiary: {
            kind: string;
        };
    };
};
export declare const BALANCEOF_SCHEMA: {
    kind: string;
    fields: {
        address: {
            kind: string;
        };
    };
};
//# sourceMappingURL=mas0-schemas.d.ts.map
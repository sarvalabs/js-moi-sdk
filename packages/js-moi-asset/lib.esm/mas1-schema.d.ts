export declare const TRANSFER_SCHEMA: {
    kind: string;
    fields: {
        token_id: {
            kind: string;
        };
        beneficiary: {
            kind: string;
        };
    };
};
export declare const TRANSFER_FROM_SCHEMA: {
    kind: string;
    fields: {
        token_id: {
            kind: string;
        };
        benefactor: {
            kind: string;
        };
        beneficiary: {
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
    };
};
export declare const MINT_WITH_METADATA_SCHEMA: {
    kind: string;
    fields: {
        beneficiary: {
            kind: string;
        };
        static_metadata: {
            kind: string;
            fields: {
                keys: {
                    kind: string;
                };
                values: {
                    kind: string;
                };
            };
        };
    };
};
export declare const BURN_SCHEMA: {
    kind: string;
    fields: {
        token_id: {
            kind: string;
        };
    };
};
export declare const LOCKUP_SCHEMA: {
    kind: string;
    fields: {
        token_id: {
            kind: string;
        };
        beneficiary: {
            kind: string;
        };
    };
};
export declare const RELEASE_SCHEMA: {
    kind: string;
    fields: {
        token_id: {
            kind: string;
        };
        benefactor: {
            kind: string;
        };
        beneficiary: {
            kind: string;
        };
    };
};
export declare const APPROVE_SCHEMA: {
    kind: string;
    fields: {
        token_id: {
            kind: string;
        };
        beneficiary: {
            kind: string;
        };
        expires_at: {
            kind: string;
        };
    };
};
export declare const REVOKE_SCHEMA: {
    kind: string;
    fields: {
        token_id: {
            kind: string;
        };
        beneficiary: {
            kind: string;
        };
    };
};
export declare const IS_OWNER_SCHEMA: {
    kind: string;
    fields: {
        token_id: {
            kind: string;
        };
        address: {
            kind: string;
        };
    };
};
export declare const SET_STATIC_METADATA_SCHEMA: {
    kind: string;
    fields: {
        token_id: {
            kind: string;
        };
        key: {
            kind: string;
        };
        value: {
            kind: string;
        };
    };
};
export declare const GET_STATIC_METADATA_SCHEMA: {
    kind: string;
    fields: {
        token_id: {
            kind: string;
        };
        key: {
            kind: string;
        };
    };
};
export declare const SET_DYNAMIC_METADATA_SCHEMA: {
    kind: string;
    fields: {
        token_id: {
            kind: string;
        };
        key: {
            kind: string;
        };
        value: {
            kind: string;
        };
    };
};
export declare const GET_DYNAMIC_METADATA_SCHEMA: {
    kind: string;
    fields: {
        token_id: {
            kind: string;
        };
        key: {
            kind: string;
        };
    };
};
export declare const SET_STATIC_TOKEN_METADATA_SCHEMA: {
    kind: string;
    fields: {
        token_id: {
            kind: string;
        };
        key: {
            kind: string;
        };
        value: {
            kind: string;
        };
    };
};
export declare const GET_STATIC_TOKEN_METADATA_SCHEMA: {
    kind: string;
    fields: {
        token_id: {
            kind: string;
        };
        key: {
            kind: string;
        };
    };
};
export declare const SET_DYNAMIC_TOKEN_METADATA_SCHEMA: {
    kind: string;
    fields: {
        token_id: {
            kind: string;
        };
        key: {
            kind: string;
        };
        value: {
            kind: string;
        };
    };
};
export declare const GET_DYNAMIC_TOKEN_METADATA_SCHEMA: {
    kind: string;
    fields: {
        token_id: {
            kind: string;
        };
        key: {
            kind: string;
        };
    };
};
//# sourceMappingURL=mas1-schema.d.ts.map
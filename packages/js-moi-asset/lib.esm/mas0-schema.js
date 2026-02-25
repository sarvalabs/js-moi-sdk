export const TRANSFER_SCHEMA = {
    kind: "struct",
    fields: {
        beneficiary: { kind: "bytes" },
        amount: { kind: "integer" }
    }
};
export const TRANSFER_FROM_SCHEMA = {
    kind: "struct",
    fields: {
        benefactor: { kind: "bytes" },
        beneficiary: { kind: "bytes" },
        amount: { kind: "integer" }
    }
};
export const BURN_SCHEMA = {
    kind: "struct",
    fields: {
        amount: { kind: "integer" }
    }
};
export const MINT_SCHEMA = {
    kind: "struct",
    fields: {
        beneficiary: { kind: "bytes" },
        amount: { kind: "integer" }
    }
};
export const MINT_WITH_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        beneficiary: { kind: "bytes" },
        amount: { kind: "integer" },
        static_metadata: {
            kind: "map",
            fields: {
                keys: {
                    kind: "string"
                },
                values: {
                    kind: "bytes"
                }
            }
        }
    }
};
export const APPROVE_SCHEMA = {
    kind: "struct",
    fields: {
        beneficiary: { kind: "bytes" },
        amount: { kind: "integer" },
        expires_at: { kind: "integer" }
    }
};
export const LOCKUP_SCHEMA = {
    kind: "struct",
    fields: {
        beneficiary: { kind: "bytes" },
        amount: { kind: "integer" }
    }
};
export const RELEASE_SCHEMA = {
    kind: "struct",
    fields: {
        benefactor: { kind: "bytes" },
        beneficiary: { kind: "bytes" },
        amount: { kind: "integer" }
    }
};
export const REVOKE_SCHEMA = {
    kind: "struct",
    fields: {
        beneficiary: { kind: "bytes" }
    }
};
export const BALANCEOF_SCHEMA = {
    kind: "struct",
    fields: {
        address: { kind: "bytes" }
    }
};
export const SET_STATIC_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        key: { kind: "string" },
        value: { kind: "string" },
    }
};
export const SET_DYNAMIC_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        key: { kind: "string" },
        value: { kind: "string" },
    }
};
export const GET_STATIC_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        key: { kind: "string" },
    }
};
export const GET_DYNAMIC_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        key: { kind: "string" },
    }
};
//# sourceMappingURL=mas0-schema.js.map
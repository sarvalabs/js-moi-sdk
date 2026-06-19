"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_DYNAMIC_TOKEN_METADATA_SCHEMA = exports.SET_DYNAMIC_TOKEN_METADATA_SCHEMA = exports.GET_STATIC_TOKEN_METADATA_SCHEMA = exports.SET_STATIC_TOKEN_METADATA_SCHEMA = exports.GET_DYNAMIC_METADATA_SCHEMA = exports.SET_DYNAMIC_METADATA_SCHEMA = exports.GET_STATIC_METADATA_SCHEMA = exports.SET_STATIC_METADATA_SCHEMA = exports.IS_OWNER_SCHEMA = exports.REVOKE_SCHEMA = exports.APPROVE_SCHEMA = exports.RELEASE_SCHEMA = exports.LOCKUP_SCHEMA = exports.BURN_SCHEMA = exports.MINT_WITH_METADATA_SCHEMA = exports.MINT_SCHEMA = exports.TRANSFER_FROM_SCHEMA = exports.TRANSFER_SCHEMA = void 0;
exports.TRANSFER_SCHEMA = {
    kind: "struct",
    fields: {
        token_id: { kind: "integer" },
        beneficiary: { kind: "bytes" },
    }
};
exports.TRANSFER_FROM_SCHEMA = {
    kind: "struct",
    fields: {
        token_id: { kind: "integer" },
        benefactor: { kind: "bytes" },
        beneficiary: { kind: "bytes" }
    }
};
exports.MINT_SCHEMA = {
    kind: "struct",
    fields: {
        beneficiary: { kind: "bytes" },
    }
};
exports.MINT_WITH_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        beneficiary: { kind: "bytes" },
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
exports.BURN_SCHEMA = {
    kind: "struct",
    fields: {
        token_id: { kind: "integer" }
    }
};
exports.LOCKUP_SCHEMA = {
    kind: "struct",
    fields: {
        token_id: { kind: "integer" },
        beneficiary: { kind: "bytes" },
    }
};
exports.RELEASE_SCHEMA = {
    kind: "struct",
    fields: {
        token_id: { kind: "integer" },
        benefactor: { kind: "bytes" },
        beneficiary: { kind: "bytes" }
    }
};
exports.APPROVE_SCHEMA = {
    kind: "struct",
    fields: {
        token_id: { kind: "integer" },
        beneficiary: { kind: "bytes" },
        expires_at: { kind: "integer" }
    }
};
exports.REVOKE_SCHEMA = {
    kind: "struct",
    fields: {
        token_id: { kind: "integer" },
        beneficiary: { kind: "bytes" }
    }
};
exports.IS_OWNER_SCHEMA = {
    kind: "struct",
    fields: {
        token_id: { kind: "integer" },
        address: { kind: "bytes" }
    }
};
exports.SET_STATIC_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        key: { kind: "string" },
        value: { kind: "bytes" },
    }
};
exports.GET_STATIC_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        key: { kind: "string" },
    }
};
exports.SET_DYNAMIC_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        key: { kind: "string" },
        value: { kind: "bytes" },
    }
};
exports.GET_DYNAMIC_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        key: { kind: "string" },
    }
};
exports.SET_STATIC_TOKEN_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        token_id: { kind: "integer" },
        key: { kind: "string" },
        value: { kind: "bytes" },
    }
};
exports.GET_STATIC_TOKEN_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        token_id: { kind: "integer" },
        key: { kind: "string" },
    }
};
exports.SET_DYNAMIC_TOKEN_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        token_id: { kind: "integer" },
        key: { kind: "string" },
        value: { kind: "bytes" },
    }
};
exports.GET_DYNAMIC_TOKEN_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        token_id: { kind: "integer" },
        key: { kind: "string" },
    }
};
//# sourceMappingURL=mas1-schema.js.map
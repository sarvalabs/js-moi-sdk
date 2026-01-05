"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SET_DYNAMIC_METADATA_SCHEMA = exports.SET_STATIC_METADATA_SCHEMA = exports.BALANCEOF_SCHEMA = exports.REVOKE_SCHEMA = exports.RELEASE_SCHEMA = exports.LOCKUP_SCHEMA = exports.APPROVE_SCHEMA = exports.MINT_WITH_METADATA_SCHEMA = exports.MINT_SCHEMA = exports.BURN_SCHEMA = exports.TRANSFER_FROM_SCHEMA = exports.TRANSFER_SCHEMA = void 0;
exports.TRANSFER_SCHEMA = {
    kind: "struct",
    fields: {
        beneficiary: { kind: "bytes" },
        amount: { kind: "integer" }
    }
};
exports.TRANSFER_FROM_SCHEMA = {
    kind: "struct",
    fields: {
        benefactor: { kind: "bytes" },
        beneficiary: { kind: "bytes" },
        amount: { kind: "integer" }
    }
};
exports.BURN_SCHEMA = {
    kind: "struct",
    fields: {
        amount: { kind: "integer" }
    }
};
exports.MINT_SCHEMA = {
    kind: "struct",
    fields: {
        beneficiary: { kind: "bytes" },
        amount: { kind: "integer" }
    }
};
exports.MINT_WITH_METADATA_SCHEMA = {
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
exports.APPROVE_SCHEMA = {
    kind: "struct",
    fields: {
        beneficiary: { kind: "bytes" },
        amount: { kind: "integer" },
        expires_at: { kind: "integer" }
    }
};
exports.LOCKUP_SCHEMA = {
    kind: "struct",
    fields: {
        beneficiary: { kind: "bytes" },
        amount: { kind: "integer" }
    }
};
exports.RELEASE_SCHEMA = {
    kind: "struct",
    fields: {
        benefactor: { kind: "bytes" },
        beneficiary: { kind: "bytes" },
        amount: { kind: "integer" }
    }
};
exports.REVOKE_SCHEMA = {
    kind: "struct",
    fields: {
        beneficiary: { kind: "bytes" }
    }
};
exports.BALANCEOF_SCHEMA = {
    kind: "struct",
    fields: {
        address: { kind: "bytes" }
    }
};
exports.SET_STATIC_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        key: { kind: "string" },
        value: { kind: "string" },
    }
};
exports.SET_DYNAMIC_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        key: { kind: "string" },
        value: { kind: "string" },
    }
};
//# sourceMappingURL=mas0-schemas.js.map
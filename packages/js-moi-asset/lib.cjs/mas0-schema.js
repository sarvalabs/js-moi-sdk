"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_DYNAMIC_METADATA_RESULT_SCHEMA = exports.GET_STATIC_METADATA_RESULT_SCHEMA = exports.CIRCULATING_SUPPLY_RESULT_SCHEMA = exports.MAX_SUPPLY_RESULT_SCHEMA = exports.DECIMALS_RESULT_SCHEMA = exports.MANAGER_RESULT_SCHEMA = exports.CREATOR_RESULT_SCHEMA = exports.BALANCEOF_RESULT_SCHEMA = exports.SYMBOL_RESULT_SCHEMA = exports.GET_DYNAMIC_METADATA_SCHEMA = exports.GET_STATIC_METADATA_SCHEMA = exports.SET_DYNAMIC_METADATA_SCHEMA = exports.SET_STATIC_METADATA_SCHEMA = exports.BALANCEOF_SCHEMA = exports.REVOKE_SCHEMA = exports.RELEASE_SCHEMA = exports.LOCKUP_SCHEMA = exports.APPROVE_SCHEMA = exports.MINT_WITH_METADATA_SCHEMA = exports.MINT_SCHEMA = exports.BURN_SCHEMA = exports.TRANSFER_FROM_SCHEMA = exports.TRANSFER_SCHEMA = void 0;
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
exports.GET_STATIC_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        key: { kind: "string" },
    }
};
exports.GET_DYNAMIC_METADATA_SCHEMA = {
    kind: "struct",
    fields: {
        key: { kind: "string" },
    }
};
// Result schemas for the read-only (static) callsites, one field each,
// matching go-moi's mas0.yaml `returns` block for the same callsite name.
// Used to decode a `.call()` response's raw POLO `outputs` bytes.
exports.SYMBOL_RESULT_SCHEMA = {
    kind: "struct",
    fields: {
        symbol: { kind: "string" },
    }
};
exports.BALANCEOF_RESULT_SCHEMA = {
    kind: "struct",
    fields: {
        balance: { kind: "integer" },
    }
};
exports.CREATOR_RESULT_SCHEMA = {
    kind: "struct",
    fields: {
        creator: { kind: "bytes" },
    }
};
exports.MANAGER_RESULT_SCHEMA = {
    kind: "struct",
    fields: {
        manager: { kind: "bytes" },
    }
};
exports.DECIMALS_RESULT_SCHEMA = {
    kind: "struct",
    fields: {
        decimals: { kind: "integer" },
    }
};
exports.MAX_SUPPLY_RESULT_SCHEMA = {
    kind: "struct",
    fields: {
        max_supply: { kind: "integer" },
    }
};
exports.CIRCULATING_SUPPLY_RESULT_SCHEMA = {
    kind: "struct",
    fields: {
        circulating_supply: { kind: "integer" },
    }
};
exports.GET_STATIC_METADATA_RESULT_SCHEMA = {
    kind: "struct",
    fields: {
        value: { kind: "bytes" },
    }
};
exports.GET_DYNAMIC_METADATA_RESULT_SCHEMA = {
    kind: "struct",
    fields: {
        value: { kind: "bytes" },
    }
};
//# sourceMappingURL=mas0-schema.js.map
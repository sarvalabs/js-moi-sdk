"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builtInLogEventSchema = exports.ixObjectSchema = exports.accountInheritSchema = exports.accountConfigureSchema = exports.participantCreateSchema = exports.keyRevokeSchema = exports.keyAddSchema = exports.assetActionSchema = exports.assetCreateSchema = exports.logicSchema = void 0;
exports.logicSchema = {
    kind: "struct",
    fields: {
        manifest: {
            kind: "bytes"
        },
        logic_id: {
            kind: "string"
        },
        callsite: {
            kind: "string"
        },
        calldata: {
            kind: "bytes"
        },
        interface: {
            kind: "map",
            fields: {
                keys: {
                    kind: "string"
                },
                values: {
                    kind: "string"
                }
            }
        }
    }
};
exports.assetCreateSchema = {
    kind: "struct",
    fields: {
        symbol: {
            kind: "string"
        },
        dimension: {
            kind: "integer"
        },
        decimals: {
            kind: "integer"
        },
        standard: {
            kind: "integer"
        },
        enable_events: {
            kind: "bool"
        },
        manager: {
            kind: "bytes"
        },
        max_supply: {
            kind: "integer"
        },
        metadata: {
            key: {
                kind: "string"
            },
            values: {
                kind: "bytes"
            }
        },
        logic_payload: exports.logicSchema,
    }
};
exports.assetActionSchema = {
    kind: "struct",
    fields: {
        asset_id: {
            kind: "string"
        },
        callsite: {
            kind: "string"
        },
        calldata: {
            kind: "bytes"
        },
        funds: {
            kind: "map",
            fields: {
                keys: {
                    kind: "string"
                },
                values: {
                    kind: "integer"
                }
            }
        }
    }
};
exports.keyAddSchema = {
    kind: "struct",
    fields: {
        public_key: {
            kind: "bytes"
        },
        weight: {
            kind: "integer"
        },
        signature_algorithm: {
            kind: "integer"
        }
    }
};
exports.keyRevokeSchema = {
    kind: "struct",
    fields: {
        key_id: {
            kind: "integer"
        }
    }
};
exports.participantCreateSchema = {
    kind: "struct",
    fields: {
        id: {
            kind: "bytes"
        },
        keys_payload: {
            kind: "array",
            fields: {
                values: exports.keyAddSchema
            }
        },
        value: exports.assetActionSchema,
    }
};
exports.accountConfigureSchema = {
    add: exports.keyAddSchema,
    revoke: exports.keyRevokeSchema,
};
exports.accountInheritSchema = {
    kind: "struct",
    fields: {
        target_account: {
            kind: "bytes"
        },
        value: exports.assetActionSchema,
        sub_account_index: {
            kind: "integer"
        }
    }
};
exports.ixObjectSchema = {
    kind: "struct",
    fields: {
        sender: {
            kind: "bytes"
        },
        payer: {
            kind: "bytes"
        },
        nonce: {
            kind: "integer"
        },
        fuel_price: {
            kind: "integer"
        },
        fuel_limit: {
            kind: "integer"
        },
        funds: {
            kind: "array",
            fields: {
                values: {
                    kind: "struct",
                    fields: {
                        asset_id: {
                            kind: "string"
                        },
                        amount: {
                            kind: "integer"
                        }
                    }
                }
            }
        },
        ix_operations: {
            kind: "array",
            fields: {
                values: {
                    kind: "struct",
                    fields: {
                        type: {
                            kind: "integer"
                        },
                        payload: {
                            kind: "bytes"
                        }
                    }
                }
            }
        },
        participants: {
            kind: "array",
            fields: {
                values: {
                    kind: "struct",
                    fields: {
                        address: {
                            kind: "bytes"
                        },
                        lock_type: {
                            kind: "integer"
                        }
                    }
                }
            }
        },
        perception: {
            kind: "bytes"
        },
        preferences: {
            kind: "struct",
            fields: {
                compute: {
                    kind: "bytes"
                },
                consensus: {
                    kind: "bytes"
                }
            }
        }
    }
};
exports.builtInLogEventSchema = {
    kind: "struct",
    fields: {
        value: {
            kind: "string"
        }
    }
};
//# sourceMappingURL=schema.js.map
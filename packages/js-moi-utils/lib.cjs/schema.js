"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builtInLogEventSchema = exports.ixSignaturesSchema = exports.ixSignatureSchema = exports.ixObjectSchema = exports.accountInheritSchema = exports.accountConfigureSchema = exports.participantCreateSchema = exports.keyRevokeSchema = exports.keyAddSchema = exports.assetActionSchema = exports.assetCreateSchema = exports.logicSchema = void 0;
exports.logicSchema = {
    kind: "struct",
    fields: {
        manifest: {
            kind: "bytes"
        },
        logic_id: {
            kind: "bytes"
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
            kind: "map",
            fields: {
                keys: {
                    kind: "string"
                },
                values: {
                    kind: "bytes"
                }
            }
        },
        logic_payload: exports.logicSchema,
    }
};
exports.assetActionSchema = {
    kind: "struct",
    fields: {
        asset_id: {
            kind: "bytes"
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
    kind: "struct",
    fields: {
        add: {
            kind: "array",
            fields: {
                values: exports.keyAddSchema
            }
        },
        revoke: {
            kind: "array",
            fields: {
                values: exports.keyRevokeSchema
            }
        },
    }
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
            kind: "struct",
            fields: {
                id: {
                    kind: "bytes"
                },
                sequence: {
                    kind: "integer"
                },
                key_id: {
                    kind: "integer"
                }
            }
        },
        payer: {
            kind: "bytes"
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
                            kind: "bytes"
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
                        id: {
                            kind: "bytes"
                        },
                        lock_type: {
                            kind: "integer"
                        },
                        notary: {
                            kind: "bool"
                        }
                    }
                }
            }
        },
        preferences: {
            kind: "struct",
            fields: {
                compute: {
                    kind: "bytes"
                },
                consensus: {
                    kind: "struct",
                    fields: {
                        mtq: {
                            kind: "integer"
                        },
                        trusted_nodes: {
                            kind: "array",
                            fields: {
                                values: {
                                    kind: "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        perception: {
            kind: "bytes"
        },
    }
};
exports.ixSignatureSchema = {
    kind: "struct",
    fields: {
        id: {
            kind: "bytes"
        },
        key_id: {
            kind: "integer"
        },
        signature: {
            kind: "bytes"
        }
    }
};
exports.ixSignaturesSchema = {
    kind: "array",
    fields: {
        values: exports.ixSignatureSchema
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
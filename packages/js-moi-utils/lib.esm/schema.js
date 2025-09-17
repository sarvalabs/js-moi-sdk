export const logicSchema = {
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
export const assetCreateSchema = {
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
        logic_payload: logicSchema,
    }
};
export const assetActionSchema = {
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
export const keyAddSchema = {
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
export const keyRevokeSchema = {
    kind: "struct",
    fields: {
        key_id: {
            kind: "integer"
        }
    }
};
export const participantCreateSchema = {
    kind: "struct",
    fields: {
        id: {
            kind: "bytes"
        },
        keys_payload: {
            kind: "array",
            fields: {
                values: keyAddSchema
            }
        },
        value: assetActionSchema,
    }
};
export const accountConfigureSchema = {
    add: keyAddSchema,
    revoke: keyRevokeSchema,
};
export const accountInheritSchema = {
    kind: "struct",
    fields: {
        target_account: {
            kind: "bytes"
        },
        value: assetActionSchema,
        sub_account_index: {
            kind: "integer"
        }
    }
};
export const ixObjectSchema = {
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
export const builtInLogEventSchema = {
    kind: "struct",
    fields: {
        value: {
            kind: "string"
        }
    }
};
//# sourceMappingURL=schema.js.map
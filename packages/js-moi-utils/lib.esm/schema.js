export const logicSchema = {
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
        },
        dynamic_metadata: {
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
        logic_payload: logicSchema,
    }
};
export const assetActionSchema = {
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
    kind: "struct",
    fields: {
        add: {
            kind: "array",
            fields: {
                values: keyAddSchema
            }
        },
        revoke: {
            kind: "array",
            fields: {
                values: keyRevokeSchema
            }
        },
    }
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
export const storagePayloadSchema = {
    kind: "struct",
    fields: {
        target_account: {
            kind: "bytes"
        },
        deposit_for: {
            kind: "bytes"
        },
        amount: {
            kind: "integer"
        },
        bytes_to_release: {
            kind: "integer"
        }
    }
};
export const callerConstraintSchema = {
    kind: "struct",
    fields: {
        kind: {
            kind: "integer"
        },
        set: {
            kind: "array",
            fields: {
                values: {
                    kind: "bytes"
                }
            }
        }
    }
};
export const accessPolicySchema = {
    kind: "struct",
    fields: {
        resource: {
            kind: "integer"
        },
        resource_id: {
            kind: "bytes"
        },
        actions: {
            kind: "integer"
        },
        scope: {
            kind: "struct",
            fields: {
                prefixes: {
                    kind: "array",
                    fields: {
                        values: {
                            kind: "bytes"
                        }
                    }
                },
                // Reserved/unused on go-moi's side (always nil in v1), but the field still
                // occupies its ordered slot on the wire - must encode as an explicit POLO
                // null, not be omitted, or every field after it misaligns on decode.
                predicate: {
                    kind: "null"
                }
            }
        },
        caller: callerConstraintSchema,
        origin: callerConstraintSchema,
    }
};
export const accessPayloadSchema = {
    kind: "struct",
    fields: {
        target_account: {
            kind: "bytes"
        },
        access_policy: accessPolicySchema,
    }
};
export const accessDeletePayloadSchema = {
    kind: "struct",
    fields: {
        target_account: {
            kind: "bytes"
        },
        resource: {
            kind: "integer"
        },
        resource_id: {
            kind: "bytes"
        }
    }
};
export const ixObjectSchema = {
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
export const ixSignatureSchema = {
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
export const ixSignaturesSchema = {
    kind: "array",
    fields: {
        values: ixSignatureSchema
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
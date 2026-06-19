export declare const logicSchema: {
    kind: string;
    fields: {
        manifest: {
            kind: string;
        };
        logic_id: {
            kind: string;
        };
        callsite: {
            kind: string;
        };
        calldata: {
            kind: string;
        };
        interface: {
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
export declare const assetCreateSchema: {
    kind: string;
    fields: {
        symbol: {
            kind: string;
        };
        dimension: {
            kind: string;
        };
        decimals: {
            kind: string;
        };
        standard: {
            kind: string;
        };
        enable_events: {
            kind: string;
        };
        manager: {
            kind: string;
        };
        max_supply: {
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
        dynamic_metadata: {
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
        logic_payload: {
            kind: string;
            fields: {
                manifest: {
                    kind: string;
                };
                logic_id: {
                    kind: string;
                };
                callsite: {
                    kind: string;
                };
                calldata: {
                    kind: string;
                };
                interface: {
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
    };
};
export declare const assetActionSchema: {
    kind: string;
    fields: {
        asset_id: {
            kind: string;
        };
        callsite: {
            kind: string;
        };
        calldata: {
            kind: string;
        };
        funds: {
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
export declare const keyAddSchema: {
    kind: string;
    fields: {
        public_key: {
            kind: string;
        };
        weight: {
            kind: string;
        };
        signature_algorithm: {
            kind: string;
        };
    };
};
export declare const keyRevokeSchema: {
    kind: string;
    fields: {
        key_id: {
            kind: string;
        };
    };
};
export declare const participantCreateSchema: {
    kind: string;
    fields: {
        id: {
            kind: string;
        };
        keys_payload: {
            kind: string;
            fields: {
                values: {
                    kind: string;
                    fields: {
                        public_key: {
                            kind: string;
                        };
                        weight: {
                            kind: string;
                        };
                        signature_algorithm: {
                            kind: string;
                        };
                    };
                };
            };
        };
        value: {
            kind: string;
            fields: {
                asset_id: {
                    kind: string;
                };
                callsite: {
                    kind: string;
                };
                calldata: {
                    kind: string;
                };
                funds: {
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
    };
};
export declare const accountConfigureSchema: {
    kind: string;
    fields: {
        add: {
            kind: string;
            fields: {
                values: {
                    kind: string;
                    fields: {
                        public_key: {
                            kind: string;
                        };
                        weight: {
                            kind: string;
                        };
                        signature_algorithm: {
                            kind: string;
                        };
                    };
                };
            };
        };
        revoke: {
            kind: string;
            fields: {
                values: {
                    kind: string;
                    fields: {
                        key_id: {
                            kind: string;
                        };
                    };
                };
            };
        };
    };
};
export declare const accountInheritSchema: {
    kind: string;
    fields: {
        target_account: {
            kind: string;
        };
        value: {
            kind: string;
            fields: {
                asset_id: {
                    kind: string;
                };
                callsite: {
                    kind: string;
                };
                calldata: {
                    kind: string;
                };
                funds: {
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
        sub_account_index: {
            kind: string;
        };
    };
};
export declare const ixObjectSchema: {
    kind: string;
    fields: {
        sender: {
            kind: string;
            fields: {
                id: {
                    kind: string;
                };
                sequence: {
                    kind: string;
                };
                key_id: {
                    kind: string;
                };
            };
        };
        payer: {
            kind: string;
        };
        fuel_price: {
            kind: string;
        };
        fuel_limit: {
            kind: string;
        };
        funds: {
            kind: string;
            fields: {
                values: {
                    kind: string;
                    fields: {
                        asset_id: {
                            kind: string;
                        };
                        amount: {
                            kind: string;
                        };
                    };
                };
            };
        };
        ix_operations: {
            kind: string;
            fields: {
                values: {
                    kind: string;
                    fields: {
                        type: {
                            kind: string;
                        };
                        payload: {
                            kind: string;
                        };
                    };
                };
            };
        };
        participants: {
            kind: string;
            fields: {
                values: {
                    kind: string;
                    fields: {
                        id: {
                            kind: string;
                        };
                        lock_type: {
                            kind: string;
                        };
                        notary: {
                            kind: string;
                        };
                    };
                };
            };
        };
        preferences: {
            kind: string;
            fields: {
                compute: {
                    kind: string;
                };
                consensus: {
                    kind: string;
                    fields: {
                        mtq: {
                            kind: string;
                        };
                        trusted_nodes: {
                            kind: string;
                            fields: {
                                values: {
                                    kind: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        perception: {
            kind: string;
        };
    };
};
export declare const ixSignatureSchema: {
    kind: string;
    fields: {
        id: {
            kind: string;
        };
        key_id: {
            kind: string;
        };
        signature: {
            kind: string;
        };
    };
};
export declare const ixSignaturesSchema: {
    kind: string;
    fields: {
        values: {
            kind: string;
            fields: {
                id: {
                    kind: string;
                };
                key_id: {
                    kind: string;
                };
                signature: {
                    kind: string;
                };
            };
        };
    };
};
export declare const builtInLogEventSchema: {
    kind: string;
    fields: {
        value: {
            kind: string;
        };
    };
};
//# sourceMappingURL=schema.d.ts.map
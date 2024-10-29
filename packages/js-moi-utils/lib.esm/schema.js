export const logicSchema = {
    kind: "struct",
    fields: {
        logic_id: {
            kind: "string"
        },
        callsite: {
            kind: "string"
        },
        calldata: {
            kind: "bytes"
        },
        manifest: {
            kind: "bytes"
        }
    }
};
export const assetCreateSchema = {
    kind: "struct",
    fields: {
        symbol: {
            kind: "string"
        },
        supply: {
            kind: "integer"
        },
        standard: {
            kind: "integer"
        },
        dimension: {
            kind: "integer"
        },
        is_stateful: {
            kind: "bool"
        },
        is_logical: {
            kind: "bool"
        },
        logic_payload: logicSchema
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
export const assetMintOrBurnSchema = {
    kind: "struct",
    fields: {
        asset_id: {
            kind: "string"
        },
        amount: {
            kind: "integer"
        }
    }
};
export const ixObjectSchema = {
    kind: "struct",
    fields: {
        type: {
            kind: "integer"
        },
        nonce: {
            kind: "integer"
        },
        sender: {
            kind: "bytes"
        },
        receiver: {
            kind: "bytes"
        },
        payer: {
            kind: "bytes"
        },
        transfer_values: {
            kind: "map",
            fields: {
                keys: {
                    kind: "string"
                },
                values: {
                    kind: "integer"
                }
            }
        },
        perceived_values: {
            kind: "map",
            fields: {
                keys: {
                    kind: "string"
                },
                values: {
                    kind: "integer"
                }
            }
        },
        fuel_price: {
            kind: "integer"
        },
        fuel_limit: {
            kind: "integer"
        },
        payload: {
            kind: "bytes"
        }
    }
};
//# sourceMappingURL=schema.js.map
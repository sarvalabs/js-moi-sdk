export declare const logicSchema: {
    kind: string;
    fields: {
        logic_id: {
            kind: string;
        };
        callsite: {
            kind: string;
        };
        calldata: {
            kind: string;
        };
        manifest: {
            kind: string;
        };
    };
};
export declare const assetCreateSchema: {
    kind: string;
    fields: {
        symbol: {
            kind: string;
        };
        supply: {
            kind: string;
        };
        standard: {
            kind: string;
        };
        dimension: {
            kind: string;
        };
        is_stateful: {
            kind: string;
        };
        is_logical: {
            kind: string;
        };
        logic_payload: {
            kind: string;
            fields: {
                logic_id: {
                    kind: string;
                };
                callsite: {
                    kind: string;
                };
                calldata: {
                    kind: string;
                };
                manifest: {
                    kind: string;
                };
            };
        };
    };
};
export declare const assetMintOrBurnSchema: {
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
export declare const ixObjectSchema: {
    kind: string;
    fields: {
        type: {
            kind: string;
        };
        nonce: {
            kind: string;
        };
        sender: {
            kind: string;
        };
        receiver: {
            kind: string;
        };
        payer: {
            kind: string;
        };
        transfer_values: {
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
        perceived_values: {
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
        fuel_price: {
            kind: string;
        };
        fuel_limit: {
            kind: string;
        };
        payload: {
            kind: string;
        };
    };
};

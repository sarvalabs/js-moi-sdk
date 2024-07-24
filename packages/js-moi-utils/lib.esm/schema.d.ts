export declare const logicDeploySchema: {
    kind: string;
    fields: {
        manifest: {
            kind: string;
        };
        callsite: {
            kind: string;
        };
        calldata: {
            kind: string;
        };
    };
};
export declare const logicInteractSchema: {
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
            };
        };
    };
};
export declare const assetApproveOrTransferSchema: {
    kind: string;
    fields: {
        beneficiary: {
            kind: string;
        };
        asset_id: {
            kind: string;
        };
        amount: {
            kind: string;
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
        sender: {
            kind: string;
        };
        payer: {
            kind: string;
        };
        nonce: {
            kind: string;
        };
        fuel_price: {
            kind: string;
        };
        fuel_limit: {
            kind: string;
        };
        asset_funds: {
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
        steps: {
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
                        address: {
                            kind: string;
                        };
                        lock_type: {
                            kind: string;
                        };
                    };
                };
            };
        };
        perception: {
            kind: string;
        };
        preferences: {
            kind: string;
            fields: {
                compute: {
                    kind: string;
                };
                consensus: {
                    kind: string;
                };
            };
        };
    };
};
//# sourceMappingURL=schema.d.ts.map
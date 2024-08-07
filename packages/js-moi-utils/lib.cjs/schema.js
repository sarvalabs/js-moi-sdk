"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ixObjectSchema = exports.assetMintOrBurnSchema = exports.assetApproveOrTransferSchema = exports.assetCreateSchema = exports.logicInteractSchema = exports.logicDeploySchema = void 0;
exports.logicDeploySchema = {
    kind: "struct",
    fields: {
        manifest: {
            kind: "bytes"
        },
        callsite: {
            kind: "string"
        },
        calldata: {
            kind: "bytes"
        },
    }
};
exports.logicInteractSchema = {
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
        }
    }
};
exports.assetCreateSchema = {
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
        logic_payload: exports.logicInteractSchema
    }
};
exports.assetApproveOrTransferSchema = {
    kind: "struct",
    fields: {
        beneficiary: {
            kind: "bytes"
        },
        asset_id: {
            kind: "string"
        },
        amount: {
            kind: "integer"
        }
    }
};
exports.assetMintOrBurnSchema = {
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
        asset_funds: {
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
        transactions: {
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
//# sourceMappingURL=schema.js.map
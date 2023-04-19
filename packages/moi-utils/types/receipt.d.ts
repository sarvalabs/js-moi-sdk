
export interface AssetCreationReceipt {
    asset_id: string;
}

export interface LogicDeployReceipt {
    logic_id: string;
}

export interface LogicExecuteReceipt {
    return_data: string;
}

export interface Receipt {
    ix_type: number;
    ix_hash: string;
    fuel_used: bigint;
    state_hashes: Map<string, string>;
    context_hashes: Map<string, string>;
    extra_data: AssetCreationReceipt | LogicDeployReceipt | LogicExecuteReceipt | null;
}

export type Receipts = Map<string, Receipt>;

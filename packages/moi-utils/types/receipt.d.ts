
export interface AssetCreationReceipt {
    asset_id: string;
}

export interface AssetMintOrBurnReceipt {
    total_supply: string;
}

export interface LogicDeployReceipt {
    logic_id: string;
    error: string
}

export interface LogicExecuteReceipt {
    outputs: string;
    error: string
}

export type IxReceiptData = string | LogicDeployReceipt | LogicExecuteReceipt

export interface Receipt {
    ix_type: number;
    ix_hash: string;
    fuel_used: bigint;
    state_hashes: Map<string, string>;
    context_hashes: Map<string, string>;
    extra_data: AssetCreationReceipt | AssetMintOrBurnReceipt | LogicDeployReceipt | LogicExecuteReceipt | null;
}

export type Receipts = Map<string, Receipt>;

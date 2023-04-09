
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
    IxType: number;
    IxHash: string;
    FuelUsed: bigint;
    StateHashes: Map<string, string>;
    ContextHashes: Map<string, string>;
    extraData: AssetCreationReceipt | LogicDeployReceipt | LogicExecuteReceipt | null;
}

export type Receipts = Map<string, Receipt>;

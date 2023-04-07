export interface AssetCreationReceipt {
    asset_id: string;
}

export interface LogicDeployReceipt {
    logic_id: string;
}

export interface LogicExecuteReceipt {
    return_data: Uint8Array;
}
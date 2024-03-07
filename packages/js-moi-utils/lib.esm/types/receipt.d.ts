export interface AssetCreationReceipt {
    asset_id: string;
    address: string;
}
export interface AssetMintOrBurnReceipt {
    total_supply: string;
}
export interface LogicDeployReceipt {
    logic_id?: string;
    error: string;
}
export interface LogicInvokeReceipt {
    outputs: string;
    error: string;
}
export type IxReceiptData = string | LogicDeployReceipt | LogicInvokeReceipt;
export interface Receipt {
    ix_type: number;
    ix_hash: string;
    fuel_used: bigint;
    state_hashes: Map<string, string>;
    context_hashes: Map<string, string>;
    extra_data: AssetCreationReceipt | AssetMintOrBurnReceipt | LogicDeployReceipt | LogicInvokeReceipt | null;
}
//# sourceMappingURL=receipt.d.ts.map
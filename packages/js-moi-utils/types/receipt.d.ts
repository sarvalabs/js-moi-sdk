import type { Hex } from "./hex";

export interface AssetCreationResult {
    asset_id: Hex;
    address: Hex;
}

export interface AssetSupplyResult {
    total_supply: string;
}

export interface LogicDeployResult {
    logic_id?: Hex;
    error: string;
}

export interface LogicInvokeResult {
    outputs: string;
    error: string;
}

export interface LogicEnlistResult {
    outputs: string;
    error: string;
}

export interface AccountInheritResult {
    sub_account: Hex;
    error: string;
}

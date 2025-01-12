import type { OperationStatus, OpType, ReceiptStatus } from "../../enums";
import type { Hex } from "../../hex";
import type { OperationResult } from "./ix-result";

export interface NetworkInfo {
    /**
     * The chain ID of the network.
     */
    chain_id: number;
    /**
     * The version of the network.
     */
    version: string;
}

export interface SimulationResult<TOpType extends OpType> {
    op_type: OpType;
    op_status: OperationStatus;
    data: OperationResult<TOpType>;
}

export type IxOperationResult = SimulationResult<OpType.AssetCreate>;

export interface SimulationEffects {
    events: unknown[];
    BalanceChanges: unknown;
}

export interface Simulate {
    hash: Hex;
    status: ReceiptStatus;
    result: IxOperationResult[];
    effort: number;
    effects: SimulationEffects[] | null;
}

import type { OpType } from "../../enums";
import type { Hex } from "../../hex";
export interface AssetCreateResult {
    asset_id: Hex;
    address: Hex;
}
export interface LogicResult {
    logic_id: Hex;
    outputs: Hex;
    error: Hex;
}
export type LogicActionResult = Omit<LogicResult, "logic_id">;
export type LogicDeployResult = Pick<LogicResult, "logic_id"> | Pick<LogicResult, "error">;
export type AssetSupplyResult = null;
export type NoOperationResult = null;
export type OperationResult<TOpType extends OpType> = TOpType extends OpType.AssetCreate ? AssetCreateResult : TOpType extends OpType.AssetBurn | OpType.AssetMint ? AssetSupplyResult : TOpType extends OpType.LogicDeploy ? LogicDeployResult : TOpType extends OpType.LogicInvoke | OpType.LogicEnlist ? LogicActionResult : TOpType extends OpType.ParticipantCreate | OpType.AssetTransfer ? NoOperationResult : unknown;
//# sourceMappingURL=ix-result.d.ts.map
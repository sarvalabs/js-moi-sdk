import type { OpType } from "../../enums";
import type { Hex } from "../../hex";
export interface AssetCreateResult {
    asset_id: Hex;
    address: Hex;
}
export type AssetSupplyResult = null;
export type OperationResult<TOpType extends OpType> = TOpType extends OpType.AssetCreate ? AssetCreateResult : TOpType extends OpType.AssetBurn | OpType.AssetMint ? AssetSupplyResult : unknown;
//# sourceMappingURL=ix-result.d.ts.map
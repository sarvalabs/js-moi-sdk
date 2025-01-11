import { OpType } from "../enums";
import type { OperationPayload } from "./ix-payload";
/**
 * `IxRawOperation` is a type that holds the raw operation data.
 */
export interface IxRawOperation {
    /**
     * The type of the operation.
     */
    type: OpType;
    /**
     * The POLO serialized payload of the operation.
     */
    payload: Uint8Array;
}
export interface Operation<TOpType extends OpType> {
    /**
     * The type of the operation.
     */
    type: TOpType;
    /**
     * The payload of the operation.
     */
    payload: OperationPayload<TOpType>;
}
/**
 * `IxOperation` is a union type that holds all the operations.
 */
export type IxOperation = Operation<OpType.AssetBurn> | Operation<OpType.AssetCreate> | Operation<OpType.AssetMint> | Operation<OpType.AssetTransfer> | Operation<OpType.LogicDeploy> | Operation<OpType.LogicEnlist> | Operation<OpType.LogicInvoke> | Operation<OpType.ParticipantCreate>;
//# sourceMappingURL=ix-operation.d.ts.map
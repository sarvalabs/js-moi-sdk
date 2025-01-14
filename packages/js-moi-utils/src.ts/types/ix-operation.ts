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

export interface IxOperation<TOpType extends OpType> {
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
export type IxOp =
    | IxOperation<OpType.AssetBurn>
    | IxOperation<OpType.AssetCreate>
    | IxOperation<OpType.AssetMint>
    | IxOperation<OpType.AssetTransfer>
    | IxOperation<OpType.LogicDeploy>
    | IxOperation<OpType.LogicEnlist>
    | IxOperation<OpType.LogicInvoke>
    | IxOperation<OpType.ParticipantCreate>;

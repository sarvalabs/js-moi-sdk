import { OpType } from "js-moi-utils";
import { type Schema } from "js-polo";
import type { OperationPayload } from "../types/moi-rpc-method";
export declare abstract class OperationSerializer {
    abstract readonly type: number;
    abstract readonly schema: Schema;
    serialize(payload: any): Uint8Array;
}
export declare class AssetCreateSerializer extends OperationSerializer {
    readonly type: OpType;
    readonly schema: Schema;
}
export declare const AssetMintSerializer: {
    new (): {
        readonly type: OpType;
        readonly schema: Schema;
        serialize(payload: any): Uint8Array;
    };
};
export declare const AssetBurnSerializer: {
    new (): {
        readonly type: OpType;
        readonly schema: Schema;
        serialize(payload: any): Uint8Array;
    };
};
export declare class ParticipantCreateSerializer extends OperationSerializer {
    readonly type = OpType.ParticipantCreate;
    readonly schema: Schema;
    serialize(payload: OperationPayload<OpType.ParticipantCreate>): Uint8Array;
}
export declare class AssetActionSerializer extends OperationSerializer {
    readonly type = OpType.AssetTransfer;
    readonly schema: Schema;
    serialize(payload: OperationPayload<OpType.AssetTransfer>): Uint8Array;
}
export declare const LogicDeploySerializer: {
    new (): {
        readonly type: OpType;
        readonly schema: Schema;
        serialize(payload: OperationPayload<OpType.LogicDeploy | OpType.LogicEnlist | OpType.LogicInvoke>): Uint8Array;
    };
};
export declare const LogicInvokeSerializer: {
    new (): {
        readonly type: OpType;
        readonly schema: Schema;
        serialize(payload: OperationPayload<OpType.LogicDeploy | OpType.LogicEnlist | OpType.LogicInvoke>): Uint8Array;
    };
};
export declare const LogicEnlistSerializer: {
    new (): {
        readonly type: OpType;
        readonly schema: Schema;
        serialize(payload: OperationPayload<OpType.LogicDeploy | OpType.LogicEnlist | OpType.LogicInvoke>): Uint8Array;
    };
};
//# sourceMappingURL=operation-serializer.d.ts.map
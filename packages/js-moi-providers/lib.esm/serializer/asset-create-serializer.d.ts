import { OpType } from "js-moi-utils";
import type { Schema } from "js-polo";
import type { OperationPayload } from "../types/moi-rpc-method";
import { OperationSerializer } from "./op-serializer";
export declare class AssetCreateSerializer extends OperationSerializer {
    readonly type: OpType;
    readonly schema: Schema;
    serialize(payload: OperationPayload<OpType.ASSET_CREATE>): Uint8Array;
}
//# sourceMappingURL=asset-create-serializer.d.ts.map
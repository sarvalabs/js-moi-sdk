import { OpType } from "js-moi-utils";
import type { Schema } from "js-polo";
import { polo } from "polo-schema";
import type { OperationPayload } from "../types/moi-rpc-method";
import { OperationSerializer } from "./op-serializer";

export class AssetCreateSerializer extends OperationSerializer {
    public readonly type: OpType = OpType.ASSET_CREATE;

    public readonly schema: Schema = {
        kind: "struct",
        fields: {
            symbol: polo.string,
            standard: polo.integer,
            supply: polo.integer,
            dimension: polo.integer,
            is_stateful: { kind: "bool" },
            is_logical: { kind: "bool" },
            logic_payload: polo.null,
        },
    };

    public serialize(payload: OperationPayload<OpType.ASSET_CREATE>): Uint8Array {
        return super.serialize({
            ...payload,
            supply: 500,
            dimension: 0,
            is_stateful: false,
            is_logical: false,
            logic_payload: null,
        });
    }
}

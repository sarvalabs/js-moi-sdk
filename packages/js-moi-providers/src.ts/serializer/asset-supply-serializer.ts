import { OpType } from "js-moi-utils";
import type { Schema } from "js-polo";
import { polo } from "polo-schema";
import { OperationSerializer } from "./op-serializer";

const createAssetSupplySerializer = (type: OpType) => {
    return class AssetSupplySerializer extends OperationSerializer {
        public readonly type = type;

        public readonly schema: Schema = polo.struct({
            asset_id: polo.string,
            amount: polo.integer,
        });
    };
};

export const AssetMintSerializer = createAssetSupplySerializer(OpType.ASSET_MINT);
export const AssetBurnSerializer = createAssetSupplySerializer(OpType.ASSET_BURN);

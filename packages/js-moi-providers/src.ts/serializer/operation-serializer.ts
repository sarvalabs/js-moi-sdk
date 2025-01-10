import { hexToBytes, OpType } from "js-moi-utils";
import { Polorizer, type Schema } from "js-polo";
import { polo } from "polo-schema";
import type { OperationPayload } from "../types/moi-rpc-method";

export abstract class OperationSerializer {
    public abstract readonly type: number;

    public abstract readonly schema: Schema;

    public serialize(payload: any): Uint8Array {
        const polorizer = new Polorizer();
        polorizer.polorize(payload, this.schema);
        return polorizer.bytes();
    }
}

export class AssetCreateSerializer extends OperationSerializer {
    public readonly type: OpType = OpType.ASSET_CREATE;

    public readonly schema: Schema = polo.struct({
        symbol: polo.string,
        supply: polo.integer,
        standard: polo.integer,
        dimension: polo.integer,
        is_stateful: polo.boolean,
        is_logical: polo.boolean,
        logic_payload: polo.struct({
            manifest: polo.bytes,
            logic_id: polo.string,
            callsite: polo.string,
            calldata: polo.bytes,
            interface: polo.map({
                keys: polo.string,
                values: polo.string,
            }),
        }),
    });
}

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

export class ParticipantCreateSerializer extends OperationSerializer {
    public readonly type = OpType.PARTICIPANT_CREATE;

    public readonly schema: Schema = {
        kind: "struct",
        fields: {
            address: polo.bytes,
            keys_payload: polo.arrayOf(
                polo.struct({
                    public_key: polo.bytes,
                    weight: polo.integer,
                    signature_algorithm: polo.integer,
                })
            ),
            amount: polo.integer,
        },
    };

    override serialize(payload: OperationPayload<OpType.PARTICIPANT_CREATE>): Uint8Array {
        return super.serialize({ ...payload, address: hexToBytes(payload.address) });
    }
}

export class AssetActionSerializer extends OperationSerializer {
    public readonly type = OpType.ASSET_TRANSFER;

    public readonly schema: Schema = polo.struct({
        benefactor: polo.bytes,
        beneficiary: polo.bytes,
        asset_id: polo.string,
        amount: polo.integer,
        timestamp: polo.integer,
    });

    public override serialize(payload: OperationPayload<OpType.ASSET_TRANSFER>): Uint8Array {
        return super.serialize({
            ...payload,
            benefactor: hexToBytes(payload.benefactor),
            beneficiary: hexToBytes(payload.beneficiary),
        });
    }
}

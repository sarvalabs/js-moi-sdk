import { OpType } from "js-moi-utils";
import type { Schema } from "js-polo";
import { polo } from "polo-schema";
import type { OperationPayload } from "../types/moi-rpc-method";
import { OperationSerializer } from "./op-serializer";

export const logicSchema = {
    kind: "struct",
    fields: {
        manifest: {
            kind: "bytes",
        },
        logic_id: {
            kind: "string",
        },
        callsite: {
            kind: "string",
        },
        calldata: {
            kind: "bytes",
        },
        interface: {
            kind: "map",
            fields: {
                keys: {
                    kind: "string",
                },
                values: {
                    kind: "string",
                },
            },
        },
    },
};

export const participantCreateSchema = {
    kind: "struct",
    fields: {
        address: {
            kind: "bytes",
        },
        amount: {
            kind: "integer",
        },
    },
};

export const assetCreateSchema = {
    kind: "struct",
    fields: {
        symbol: {
            kind: "string",
        },
        supply: {
            kind: "integer",
        },
        standard: {
            kind: "integer",
        },
        dimension: {
            kind: "integer",
        },
        is_stateful: {
            kind: "bool",
        },
        is_logical: {
            kind: "bool",
        },
        logic_payload: logicSchema,
    },
};

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

    public serialize(payload: OperationPayload<OpType.ASSET_CREATE>): Uint8Array {
        return super.serialize(payload);
    }
}

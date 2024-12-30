import { hexToBytes, OpType } from "js-moi-utils";
import type { Schema } from "js-polo";
import type { OperationPayload } from "../types/moi-rpc-method";
import { OperationSerializer } from "./op-serializer";

export class AssetCreateSerializer extends OperationSerializer {
    public readonly type: OpType = OpType.ASSET_CREATE;

    public readonly schema: Schema = {
        kind: "struct",
        fields: {
            symbol: { kind: "string" },
            standard: { kind: "integer" },
            supply: { kind: "integer" },
            logic: {
                kind: "struct",
                fields: {
                    manifest: { kind: "bytes" },
                    call: {
                        kind: "struct",
                        fields: {
                            callsite: { kind: "string" },
                            calldata: { kind: "bytes" },
                            interfaces: {
                                kind: "array",
                                fields: {
                                    kind: "struct",
                                    fields: {
                                        name: { kind: "string" },
                                        logic_id: { kind: "bytes" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    public serialize(payload: OperationPayload<OpType.ASSET_CREATE>): Uint8Array {
        return super.serialize({
            ...payload,
            logic: {
                manifest: hexToBytes(payload.logic.manifest),
                call: {
                    ...payload.logic.call,
                    calldata: hexToBytes(payload.logic.call.calldata),
                    interfaces: payload.logic.call.interfaces.map((i) => ({
                        ...i,
                        logic_id: hexToBytes(i.logic_id),
                    })),
                },
            },
        });
    }
}

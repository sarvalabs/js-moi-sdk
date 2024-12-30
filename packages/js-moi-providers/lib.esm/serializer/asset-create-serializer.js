import { hexToBytes, OpType } from "js-moi-utils";
import { OperationSerializer } from "./op-serializer";
export class AssetCreateSerializer extends OperationSerializer {
    type = OpType.ASSET_CREATE;
    schema = {
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
    serialize(payload) {
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
//# sourceMappingURL=asset-create-serializer.js.map
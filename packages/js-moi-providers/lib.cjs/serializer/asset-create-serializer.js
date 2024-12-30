"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetCreateSerializer = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const op_serializer_1 = require("./op-serializer");
class AssetCreateSerializer extends op_serializer_1.OperationSerializer {
    type = js_moi_utils_1.OpType.ASSET_CREATE;
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
                manifest: (0, js_moi_utils_1.hexToBytes)(payload.logic.manifest),
                call: {
                    ...payload.logic.call,
                    calldata: (0, js_moi_utils_1.hexToBytes)(payload.logic.call.calldata),
                    interfaces: payload.logic.call.interfaces.map((i) => ({
                        ...i,
                        logic_id: (0, js_moi_utils_1.hexToBytes)(i.logic_id),
                    })),
                },
            },
        });
    }
}
exports.AssetCreateSerializer = AssetCreateSerializer;
//# sourceMappingURL=asset-create-serializer.js.map
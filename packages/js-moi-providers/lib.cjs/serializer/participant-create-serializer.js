"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantCreateSerializer = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const op_serializer_1 = require("./op-serializer");
class ParticipantCreateSerializer extends op_serializer_1.OperationSerializer {
    type = js_moi_utils_1.OpType.PARTICIPANT_CREATE;
    schema = {
        kind: "struct",
        fields: {
            account: { kind: "bytes" },
            amount: { kind: "integer" },
            keys: {
                kind: "array",
                fields: {
                    kind: "struct",
                    fields: {
                        public_key: { kind: "bytes" },
                        weight: { kind: "integer" },
                        algorithm: { kind: "string" },
                    },
                },
            },
        },
    };
}
exports.ParticipantCreateSerializer = ParticipantCreateSerializer;
//# sourceMappingURL=participant-create-serializer.js.map
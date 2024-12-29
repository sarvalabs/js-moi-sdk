"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantCreateSerializer = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_polo_1 = require("js-polo");
class ParticipantCreateSerializer {
    type = js_moi_utils_1.OpType.PARTICIPANT_CREATE;
    static SCHEMA = {
        kind: "struct",
        fields: {
            account: {
                kind: "bytes",
            },
            amount: {
                kind: "integer",
            },
            keys: {
                kind: "array",
                fields: {
                    kind: "struct",
                    fields: {
                        keys: {
                            kind: "bytes",
                        },
                    },
                },
            },
        },
    };
    serialize(payload) {
        const polorizer = new js_polo_1.Polorizer();
        console.log(payload);
        polorizer.polorize(payload, this.getSchema());
        return polorizer.bytes();
    }
    getSchema() {
        return ParticipantCreateSerializer.SCHEMA;
    }
}
exports.ParticipantCreateSerializer = ParticipantCreateSerializer;
//# sourceMappingURL=participant-create-serializer.js.map
import { OpType } from "js-moi-utils";
import { Polorizer } from "js-polo";
export class ParticipantCreateSerializer {
    type = OpType.PARTICIPANT_CREATE;
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
        const polorizer = new Polorizer();
        console.log(payload);
        polorizer.polorize(payload, this.getSchema());
        return polorizer.bytes();
    }
    getSchema() {
        return ParticipantCreateSerializer.SCHEMA;
    }
}
//# sourceMappingURL=participant-create-serializer.js.map
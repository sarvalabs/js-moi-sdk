import { OpType } from "js-moi-utils";
import { OperationSerializer } from "./op-serializer";
export class ParticipantCreateSerializer extends OperationSerializer {
    type = OpType.PARTICIPANT_CREATE;
    schema = {
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
}
//# sourceMappingURL=participant-create-serializer.js.map
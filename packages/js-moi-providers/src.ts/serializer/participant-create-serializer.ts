import { OpType } from "js-moi-utils";
import type { Schema } from "js-polo";
import { OperationSerializer } from "./op-serializer";

export class ParticipantCreateSerializer extends OperationSerializer {
    public readonly type = OpType.PARTICIPANT_CREATE;

    public readonly schema: Schema = {
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

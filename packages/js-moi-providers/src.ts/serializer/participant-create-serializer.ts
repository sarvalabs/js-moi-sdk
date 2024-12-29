import { Address, OpType } from "js-moi-utils";
import { Polorizer, type Schema } from "js-polo";
import type { OperationSerializer } from "./op-serializer";

export interface ParticipantCreatePayload {
    account: Address;
    amount: number;
    keys: { keys: string }[];
}

export class ParticipantCreateSerializer implements OperationSerializer<ParticipantCreatePayload> {
    public readonly type = OpType.PARTICIPANT_CREATE;

    private static SCHEMA: Schema = {
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

    serialize(payload: ParticipantCreatePayload): Uint8Array {
        const polorizer = new Polorizer();
        console.log(payload);
        polorizer.polorize(payload, this.getSchema());
        return polorizer.bytes();
    }

    getSchema() {
        return ParticipantCreateSerializer.SCHEMA;
    }
}

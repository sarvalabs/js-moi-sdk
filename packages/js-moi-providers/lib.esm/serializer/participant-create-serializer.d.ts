import { Address, OpType } from "js-moi-utils";
import { type Schema } from "js-polo";
import type { OperationSerializer } from "./op-serializer";
export interface ParticipantCreatePayload {
    account: Address;
    amount: number;
    keys: {
        keys: string;
    }[];
}
export declare class ParticipantCreateSerializer implements OperationSerializer<ParticipantCreatePayload> {
    readonly type = OpType.PARTICIPANT_CREATE;
    private static SCHEMA;
    serialize(payload: ParticipantCreatePayload): Uint8Array;
    getSchema(): Schema;
}
//# sourceMappingURL=participant-create-serializer.d.ts.map
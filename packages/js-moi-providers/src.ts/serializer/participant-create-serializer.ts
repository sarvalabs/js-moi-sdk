import { hexToBytes, OpType } from "js-moi-utils";
import { polo, type PoloSchema } from "polo-schema";
import type { OperationPayload } from "../types/moi-rpc-method";
import { OperationSerializer } from "./op-serializer";

export class ParticipantCreateSerializer extends OperationSerializer {
    public readonly type = OpType.PARTICIPANT_CREATE;

    public readonly schema: PoloSchema = {
        kind: "struct",
        fields: {
            address: polo.bytes,
            keys_payload: polo.arrayOf(
                polo.struct({
                    public_key: polo.bytes,
                    weight: polo.integer,
                    signature_algorithm: polo.integer,
                })
            ),
            amount: polo.integer,
        },
    };

    override serialize(payload: OperationPayload<OpType.PARTICIPANT_CREATE>): Uint8Array {
        return super.serialize({ ...payload, address: hexToBytes(payload.address) });
    }
}

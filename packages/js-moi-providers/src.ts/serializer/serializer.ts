import { ErrorCode, ErrorUtils, OpType } from "js-moi-utils";
import type { InteractionRequest, Operation } from "../types/moi-rpc-method";
import type { OperationSerializer } from "./op-serializer";
import { ParticipantCreateSerializer } from "./participant-create-serializer";

export class InteractionSerializer {
    private static serializers: Map<OpType, OperationSerializer> = new Map();

    private static IX_POLO_SCHEMA = {
        kind: "struct",
        fields: {
            sender: {
                kind: "struct",
                fields: {
                    address: {
                        kind: "bytes",
                    },
                    sequence: {
                        kind: "integer",
                    },
                    key_id: {
                        kind: "integer",
                    },
                },
            },
            payer: {
                kind: "struct",
                fields: {
                    address: {
                        kind: "bytes",
                    },
                    sequence: {
                        kind: "integer",
                    },
                    key_id: {
                        kind: "integer",
                    },
                },
            },
            fuel_limit: {
                kind: "integer",
            },
            fuel_tip: {
                kind: "integer",
            },
            operations: {
                kind: "array",
                fields: {
                    kind: "struct",
                    fields: {
                        type: {
                            kind: "integer",
                        },
                        payload: {
                            kind: "bytes",
                        },
                    },
                },
            },
        },
    };

    public serializeOperation<T extends OpType>(operation: Operation<T>): Uint8Array {
        const serializer = InteractionSerializer.serializers.get(operation.type);

        if (serializer == null) {
            ErrorUtils.throwError(
                `Serializer for operation type "${operation.type}" is not registered. Please pass the correct operation type or register a serializer for the given operation type.`,
                ErrorCode.NOT_INITIALIZED
            );
        }

        return serializer.serialize(operation.payload);
    }

    public serialize(interaction: InteractionRequest) {
        return InteractionSerializer.IX_POLO_SCHEMA;
    }

    /**
     * Register a serializer for a given operation type
     *
     * If a serializer is already registered for the given operation type, it will be overwritten
     *
     * @param serializer The serializer to register
     * @returns void
     */
    static register(serializer: OperationSerializer) {
        this.serializers.set(serializer.type, serializer);
    }

    static {
        // Register all serializers
        this.register(new ParticipantCreateSerializer());
    }
}

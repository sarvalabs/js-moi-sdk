import { OpType } from "js-moi-utils";
import type { InteractionRequest, Operation } from "../types/moi-rpc-method";
import type { OperationSerializer } from "./op-serializer";
export declare class InteractionSerializer {
    private static serializers;
    private static IX_POLO_SCHEMA;
    serializeOperation<T extends OpType>(operation: Operation<T>): Uint8Array;
    serialize(interaction: InteractionRequest): {
        kind: string;
        fields: {
            sender: {
                kind: string;
                fields: {
                    address: {
                        kind: string;
                    };
                    sequence: {
                        kind: string;
                    };
                    key_id: {
                        kind: string;
                    };
                };
            };
            payer: {
                kind: string;
                fields: {
                    address: {
                        kind: string;
                    };
                    sequence: {
                        kind: string;
                    };
                    key_id: {
                        kind: string;
                    };
                };
            };
            fuel_limit: {
                kind: string;
            };
            fuel_tip: {
                kind: string;
            };
            operations: {
                kind: string;
                fields: {
                    kind: string;
                    fields: {
                        type: {
                            kind: string;
                        };
                        payload: {
                            kind: string;
                        };
                    };
                };
            };
        };
    };
    /**
     * Register a serializer for a given operation type
     *
     * If a serializer is already registered for the given operation type, it will be overwritten
     *
     * @param serializer The serializer to register
     * @returns void
     */
    static register(serializer: OperationSerializer): void;
}
//# sourceMappingURL=serializer.d.ts.map
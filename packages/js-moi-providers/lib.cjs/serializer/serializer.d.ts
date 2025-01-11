import { OpType } from "js-moi-utils";
import type { BaseInteractionRequest, Operation } from "../types/moi-rpc-method";
import { type OperationSerializer } from "./operation-serializer";
export declare class InteractionSerializer {
    private static serializers;
    private static IX_POLO_SCHEMA;
    serializeOperation<T extends OpType>(operation: Operation<T>): Uint8Array;
    serialize(interaction: BaseInteractionRequest): Uint8Array;
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
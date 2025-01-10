import { ErrorCode, ErrorUtils, OpType } from "js-moi-utils";
import { Polorizer } from "js-polo";
import { polo } from "polo-schema";
import type { BaseInteractionRequest, Operation } from "../types/moi-rpc-method";
import {
    AssetActionSerializer,
    AssetBurnSerializer,
    AssetCreateSerializer,
    AssetMintSerializer,
    LogicDeploySerializer,
    LogicEnlistSerializer,
    LogicInvokeSerializer,
    ParticipantCreateSerializer,
    type OperationSerializer,
} from "./operation-serializer";

export class InteractionSerializer {
    private static serializers: Map<OpType, OperationSerializer> = new Map();

    private static IX_POLO_SCHEMA = {
        kind: "struct",
        fields: {
            sender: polo.struct({ address: polo.bytes, sequence: polo.integer, key_id: polo.integer }),
            payer: polo.string,
            fuel_limit: polo.integer,
            fuel_price: polo.integer,
            ix_operations: polo.arrayOf(
                polo.struct({
                    type: polo.integer,
                    payload: polo.bytes,
                })
            ),
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

    public serialize(interaction: BaseInteractionRequest) {
        const polorizer = new Polorizer();
        const payload = {
            ...interaction,
            operations: interaction.ix_operations.map((op) => ({
                type: op.type,
                payload: this.serializeOperation(op),
            })),
        };
        polorizer.polorize(payload, InteractionSerializer.IX_POLO_SCHEMA);
        return polorizer.bytes();
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

        this.register(new AssetCreateSerializer());
        this.register(new AssetBurnSerializer());
        this.register(new AssetMintSerializer());
        this.register(new AssetActionSerializer());

        this.register(new LogicDeploySerializer());
        this.register(new LogicEnlistSerializer());
        this.register(new LogicInvokeSerializer());
    }
}

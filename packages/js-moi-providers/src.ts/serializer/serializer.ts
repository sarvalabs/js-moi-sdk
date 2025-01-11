import { ErrorCode, ErrorUtils, hexToBytes, OpType } from "js-moi-utils";
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

    private static IX_POLO_SCHEMA = polo.struct({
        sender: polo.struct({
            address: polo.bytes,
            sequence_id: polo.integer,
            key_id: polo.integer,
        }),
        payer: polo.bytes,
        fuel_price: polo.integer,
        fuel_limit: polo.integer,
        funds: polo.arrayOf(
            polo.struct({
                asset_id: polo.string,
                amount: polo.integer,
            })
        ),
        ix_operations: polo.arrayOf(
            polo.struct({
                type: polo.integer,
                payload: polo.bytes,
            })
        ),
        participants: polo.arrayOf(
            polo.struct({
                address: polo.bytes,
                lock_type: polo.integer,
                notary: polo.boolean,
            })
        ),
        preferences: polo.struct({
            compute: polo.bytes,
            consensus: polo.struct({
                mtq: polo.integer,
                trust_nodes: polo.arrayOf(polo.string),
            }),
        }),
        perception: polo.bytes,
    });

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

    private getSerializationPayload(interaction: BaseInteractionRequest) {
        return {
            ...interaction,
            sender: {
                ...interaction.sender,
                address: hexToBytes(interaction.sender.address),
            },
            ix_operations: interaction.ix_operations.map((op) => ({
                type: op.type,
                payload: this.serializeOperation(op),
            })),
            payer: interaction.payer != null ? hexToBytes(interaction.payer) : undefined,
            participants: interaction.participants?.map((participant) => ({
                ...participant,
                address: hexToBytes(participant.address),
            })),
            perception: interaction.perception != null ? hexToBytes(interaction.perception) : undefined,
        };
    }

    private ensureValidInteraction(interaction: BaseInteractionRequest) {
        if (interaction.sender == null) {
            ErrorUtils.throwError("Sender is required in the interaction", ErrorCode.INVALID_ARGUMENT, {
                field: "sender",
            });
        }

        if (interaction.fuel_price == null) {
            ErrorUtils.throwError("Fuel price is required in the interaction", ErrorCode.INVALID_ARGUMENT, {
                field: "fuel_price",
            });
        }

        if (interaction.fuel_limit == null) {
            ErrorUtils.throwError("Fuel limit is required in the interaction", ErrorCode.INVALID_ARGUMENT, {
                field: "fuel_limit",
            });
        }

        if (interaction.fuel_price < 0) {
            ErrorUtils.throwError("Fuel price must be a unsigned number", ErrorCode.INVALID_ARGUMENT, {
                field: "fuel_price",
                value: interaction.fuel_price,
            });
        }

        if (interaction.fuel_limit < 0) {
            ErrorUtils.throwError("Fuel limit must be a unsigned number", ErrorCode.INVALID_ARGUMENT, {
                field: "fuel_limit",
                value: interaction.fuel_limit,
            });
        }

        if (interaction.ix_operations == null || interaction.ix_operations.length === 0) {
            ErrorUtils.throwError("At least one operation is required in the interaction", ErrorCode.INVALID_ARGUMENT);
        }
    }

    public serialize(interaction: BaseInteractionRequest) {
        this.ensureValidInteraction(interaction);
        const polorizer = new Polorizer();
        polorizer.polorize(this.getSerializationPayload(interaction), InteractionSerializer.IX_POLO_SCHEMA);
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

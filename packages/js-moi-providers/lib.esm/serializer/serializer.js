import { ErrorCode, ErrorUtils, hexToBytes } from "js-moi-utils";
import { Polorizer } from "js-polo";
import { polo } from "polo-schema";
import { AssetActionSerializer, AssetBurnSerializer, AssetCreateSerializer, AssetMintSerializer, LogicDeploySerializer, LogicEnlistSerializer, LogicInvokeSerializer, ParticipantCreateSerializer, } from "./operation-serializer";
export class InteractionSerializer {
    static serializers = new Map();
    static IX_POLO_SCHEMA = polo.struct({
        sender: polo.struct({
            address: polo.bytes,
            sequence_id: polo.integer,
            key_id: polo.integer,
        }),
        payer: polo.bytes,
        fuel_price: polo.integer,
        fuel_limit: polo.integer,
        funds: polo.arrayOf(polo.struct({
            asset_id: polo.string,
            amount: polo.integer,
        })),
        ix_operations: polo.arrayOf(polo.struct({
            type: polo.integer,
            payload: polo.bytes,
        })),
        participants: polo.arrayOf(polo.struct({
            address: polo.bytes,
            lock_type: polo.integer,
            notary: polo.boolean,
        })),
        preferences: polo.struct({
            compute: polo.bytes,
            consensus: polo.struct({
                mtq: polo.integer,
                trust_nodes: polo.arrayOf(polo.string),
            }),
        }),
        perception: polo.bytes,
    });
    serializeOperation(operation) {
        const serializer = InteractionSerializer.serializers.get(operation.type);
        if (serializer == null) {
            ErrorUtils.throwError(`Serializer for operation type "${operation.type}" is not registered. Please pass the correct operation type or register a serializer for the given operation type.`, ErrorCode.NOT_INITIALIZED);
        }
        return serializer.serialize(operation.payload);
    }
    getSerializationPayload(interaction) {
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
    serialize(interaction) {
        const polorizer = new Polorizer();
        console.log(JSON.stringify(interaction, null, 2));
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
    static register(serializer) {
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
//# sourceMappingURL=serializer.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionSerializer = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_polo_1 = require("js-polo");
const polo_schema_1 = require("polo-schema");
const operation_serializer_1 = require("./operation-serializer");
class InteractionSerializer {
    static serializers = new Map();
    static IX_POLO_SCHEMA = polo_schema_1.polo.struct({
        sender: polo_schema_1.polo.struct({
            address: polo_schema_1.polo.bytes,
            sequence_id: polo_schema_1.polo.integer,
            key_id: polo_schema_1.polo.integer,
        }),
        payer: polo_schema_1.polo.bytes,
        fuel_price: polo_schema_1.polo.integer,
        fuel_limit: polo_schema_1.polo.integer,
        funds: polo_schema_1.polo.arrayOf(polo_schema_1.polo.struct({
            asset_id: polo_schema_1.polo.string,
            amount: polo_schema_1.polo.integer,
        })),
        ix_operations: polo_schema_1.polo.arrayOf(polo_schema_1.polo.struct({
            type: polo_schema_1.polo.integer,
            payload: polo_schema_1.polo.bytes,
        })),
        participants: polo_schema_1.polo.arrayOf(polo_schema_1.polo.struct({
            address: polo_schema_1.polo.bytes,
            lock_type: polo_schema_1.polo.integer,
            notary: polo_schema_1.polo.boolean,
        })),
        preferences: polo_schema_1.polo.struct({
            compute: polo_schema_1.polo.bytes,
            consensus: polo_schema_1.polo.struct({
                mtq: polo_schema_1.polo.integer,
                trust_nodes: polo_schema_1.polo.arrayOf(polo_schema_1.polo.string),
            }),
        }),
        perception: polo_schema_1.polo.bytes,
    });
    serializeOperation(operation) {
        const serializer = InteractionSerializer.serializers.get(operation.type);
        if (serializer == null) {
            js_moi_utils_1.ErrorUtils.throwError(`Serializer for operation type "${operation.type}" is not registered. Please pass the correct operation type or register a serializer for the given operation type.`, js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        return serializer.serialize(operation.payload);
    }
    getSerializationPayload(interaction) {
        return {
            ...interaction,
            sender: {
                ...interaction.sender,
                address: (0, js_moi_utils_1.hexToBytes)(interaction.sender.address),
            },
            ix_operations: interaction.ix_operations.map((op) => ({
                type: op.type,
                payload: this.serializeOperation(op),
            })),
            payer: interaction.payer != null ? (0, js_moi_utils_1.hexToBytes)(interaction.payer) : undefined,
            participants: interaction.participants?.map((participant) => ({
                ...participant,
                address: (0, js_moi_utils_1.hexToBytes)(participant.address),
            })),
            perception: interaction.perception != null ? (0, js_moi_utils_1.hexToBytes)(interaction.perception) : undefined,
        };
    }
    serialize(interaction) {
        const polorizer = new js_polo_1.Polorizer();
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
        this.register(new operation_serializer_1.ParticipantCreateSerializer());
        this.register(new operation_serializer_1.AssetCreateSerializer());
        this.register(new operation_serializer_1.AssetBurnSerializer());
        this.register(new operation_serializer_1.AssetMintSerializer());
        this.register(new operation_serializer_1.AssetActionSerializer());
        this.register(new operation_serializer_1.LogicDeploySerializer());
        this.register(new operation_serializer_1.LogicEnlistSerializer());
        this.register(new operation_serializer_1.LogicInvokeSerializer());
    }
}
exports.InteractionSerializer = InteractionSerializer;
//# sourceMappingURL=serializer.js.map
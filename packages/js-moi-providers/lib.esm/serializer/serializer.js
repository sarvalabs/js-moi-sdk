import { encodeIxOperationToPolo, hexToBytes } from "js-moi-utils";
import { Polorizer } from "js-polo";
import { polo } from "polo-schema";
export class InteractionSerializer {
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
    getSerializationPayload(interaction) {
        return {
            ...interaction,
            sender: {
                ...interaction.sender,
                address: hexToBytes(interaction.sender.address),
            },
            ix_operations: interaction.ix_operations.map((op) => ({
                type: op.type,
                payload: encodeIxOperationToPolo(op),
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
}
//# sourceMappingURL=serializer.js.map
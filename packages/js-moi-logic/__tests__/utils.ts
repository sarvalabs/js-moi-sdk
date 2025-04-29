import { bytesToHex, InteractionStatus, randomBytes, ReceiptStatus, type AnyIxOperationResult, type Interaction } from "js-moi-utils";

export const mockConfirmedInteraction = (...operations: AnyIxOperationResult[]): Interaction => {
    return {
        hash: bytesToHex(randomBytes(32)),
        status: InteractionStatus.Finalized,
        confirmation: {
            status: ReceiptStatus.Ok,
            fuel_spent: Math.floor(Math.random() * 1000),
            operations: operations,
            tesseract: {
                hash: bytesToHex(randomBytes(32)),
                ix_index: 0,
            },
        },
        interaction: {
            sender: {
                id: bytesToHex(randomBytes(32)),
                key_id: 0,
                sequence: 0,
            },
            accounts: [],
            fuel_bonus: 0,
            fuel_limit: 1000,
            fuel_price: 1,
            metadata: "0x",
            operations: [],
            perception: "0x",
            preferences: {
                compute: "0x",
                consensus: {
                    mtq: 0,
                    nodes: [],
                },
            },
            sponsor: {
                id: bytesToHex(randomBytes(32)),
                key_id: 0,
                sequence: 0,
            },
        },
    };
};

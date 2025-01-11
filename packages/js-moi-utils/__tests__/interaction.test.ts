import { AssetStandard, bytesToHex, encodeInteraction, LockType, OpType, type InteractionRequest } from "../src.ts";

describe("Polo serialization of interaction", () => {
    const interaction: InteractionRequest = {
        sender: {
            address: "0xb15d30b2e885efb1b45bd64db1d5adc231eaf5188bdff72013416deb75bf313e",
            key_id: 0,
            sequence_id: 0,
        },
        funds: [
            {
                asset_id: "0x000000004cd973c4eb83cdb8870c0de209736270491b7acc99873da1eddced5826c3b548",
                amount: 100,
            },
        ],
        fuel_price: 1,
        fuel_limit: 200,
        operations: [
            {
                type: OpType.AssetCreate,
                payload: {
                    symbol: "MOI",
                    supply: 500,
                    standard: AssetStandard.MAS0,
                },
            },
        ],
        participants: [
            {
                address: "0xb15d30b2e885efb1b45bd64db1d5adc231eaf5188bdff72013416deb75bf313e",
                lock_type: LockType.MutateLock,
                notary: false,
            },
        ],
    };

    test("should serialize an interaction", () => {
        const serialized = encodeInteraction(interaction);
        const expected =
            "0x0e9f020ee004e304f3048e059e0fde11d016d0165f0683048304b15d30b2e885efb1b45bd64db1d5adc231eaf5188bdff72013416deb75bf313e01c81f0e3f06a3093078303030303030303034636439373363346562383363646238383730633064653230393733363237303439316237616363393938373364613165646463656435383236633362353438641f0e2f0316050e7f063353535151504d4f4901f41f0e5f0683048104b15d30b2e885efb1b45bd64db1d5adc231eaf5188bdff72013416deb75bf313e";

        expect(bytesToHex(serialized)).toEqual(expected);
    });
});

import { AssetStandard, bytesToHex, encodeInteraction, LockType, OpType, type InteractionRequest } from "../src.ts";

interface EncodeInteractionTestcase {
    request: InteractionRequest;
    expected: string;
}

const testcases: EncodeInteractionTestcase[] = [
    {
        request: {
            sender: {
                id: "0x0000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee600000000",
                key_id: 0,
                sequence: 0,
            },
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
                    id: "0x0000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee600000000",
                    lock_type: LockType.MutateLock,
                    notary: false,
                },
            ],
        },
        expected:
            "0x0eff010eee04c309d309ee09ae0ca011a0115f06830483040000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee6000000005f0683048304000000000000000000000000000000000000000000000000000000000000000001c81f0e2f0316060e7f063353535151504d4f4901f41f0e5f06830481040000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee600000000",
    },
    {
        request: {
            sender: {
                id: "0x0000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee600000000",
                key_id: 0,
                sequence: 0,
            },
            fuel_price: 1,
            fuel_limit: 200,
            operations: [
                {
                    type: OpType.ParticipantCreate,
                    payload: {
                        amount: 100,
                        id: "0x00",
                        keys_payload: [
                            {
                                public_key: "0x7a56899142b01abd1c0a28a89b95f742336daca373c0c82c110cae1836049a03",
                                signature_algorithm: 0,
                                weight: 10000,
                            },
                        ],
                    },
                },
            ],
            participants: [
                {
                    id: "0x0000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee600000000",
                    lock_type: LockType.NoLock,
                    notary: false,
                },
            ],
        },
        expected:
            "0x0eff010eee04c309d309ee09ee10f015f0155f06830483040000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee6000000005f0683048304000000000000000000000000000000000000000000000000000000000000000001c81f0e2f0316010e4f061eb305001f0e5f068304a3047a56899142b01abd1c0a28a89b95f742336daca373c0c82c110cae1836049a032710641f0e5f06830491040000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee60000000002",
    },
    {
        request: {
            sender: {
                id: "0x0000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee600000000",
                key_id: 0,
                sequence: 0,
            },
            fuel_price: 1,
            fuel_limit: 200,
            operations: [
                {
                    type: OpType.LogicEnlist,
                    payload: {
                        logic_id: "0x208300005edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f7800000000",
                        callsite: "TEST",
                    },
                },
            ],
            participants: [
                {
                    id: "0x0000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee600000000",
                    lock_type: LockType.NoLock,
                    notary: false,
                },
            ],
        },
        expected:
            "0x0eff010eee04c309d309ee09be10c015c0155f06830483040000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee6000000005f0683048304000000000000000000000000000000000000000000000000000000000000000001c81f0e2f03160f0e8f0100068604c004c004208300005edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f7800000000544553541f0e5f06830491040000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee60000000002",
    },
];

describe("Polo serialization of interaction", () => {
    test("should serialize an interaction", () => {
        for (const testcase of testcases) {
            expect(bytesToHex(encodeInteraction(testcase.request))).toEqual(testcase.expected);
        }
    });
});

import { AssetStandard, bytesToHex, encodeOperation, getIxOperationDescriptor, listIxOperationDescriptors, OpType, type IxOperation } from "../src.ts";

interface TestCase {
    operation: IxOperation;
    expected: string;
}

describe(encodeOperation, () => {
    const cases: TestCase[] = [
        {
            operation: {
                type: OpType.AssetCreate,
                payload: {
                    symbol: "MOI",
                    supply: 500,
                    standard: AssetStandard.MAS0,
                },
            },
            expected: "0x0e7f063353535151504d4f4901f4",
        },
        {
            operation: {
                type: OpType.ParticipantCreate,
                payload: {
                    address: "0x28027ab68bd59c6cf54c83b32e02126859809436cd141b341d5fcb02bf7f6d64",
                    amount: 100,
                    keys_payload: [],
                },
            },
            expected: "0x0e5f068e04930428027ab68bd59c6cf54c83b32e02126859809436cd141b341d5fcb02bf7f6d640f64",
        },
        {
            operation: {
                type: OpType.AssetMint,
                payload: {
                    asset_id: "0x00000000a9f5e8463babc197252de33a265eefc71c3497440c06faa233bda94125dbc668",
                    amount: 100,
                },
            },
            expected:
                "0x0e3f06a309307830303030303030306139663565383436336261626331393732353264653333613236356565666337316333343937343430633036666161323333626461393431323564626336363864",
        },
        {
            operation: {
                type: OpType.AssetBurn,
                payload: {
                    asset_id: "0x00000000a9f5e8463babc197252de33a265eefc71c3497440c06faa233bda94125dbc661",
                    amount: 100,
                },
            },
            expected:
                "0x0e3f06a309307830303030303030306139663565383436336261626331393732353264653333613236356565666337316333343937343430633036666161323333626461393431323564626336363164",
        },
        {
            operation: {
                type: OpType.AssetTransfer,
                payload: {
                    benefactor: "0x94c1e6005ba03c48130c9c32c1fd7d1a0364413253eb5cf1c56164f93a6c8757",
                    beneficiary: "0x86d8826ac7dc4ffb73fae39dedf72958a405b878f25ed362f2f496c60a4604f4",
                    asset_id: "0x000000004cd973c4eb83cdb8870c0de209736270491b7acc99873da1eddced5826c3b548",
                    amount: 100,
                    timestamp: 1736513677,
                },
            },
            expected:
                "0x0e9f010686048608a311b31194c1e6005ba03c48130c9c32c1fd7d1a0364413253eb5cf1c56164f93a6c875786d8826ac7dc4ffb73fae39dedf72958a405b878f25ed362f2f496c60a4604f43078303030303030303034636439373363346562383363646238383730633064653230393733363237303439316237616363393938373364613165646463656435383236633362353438646781188d",
        },
        {
            operation: {
                type: OpType.LogicDeploy,
                payload: {
                    manifest: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    callsite: "AnyCallsite",
                    calldata: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    interfaces: {
                        ["hello"]: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    },
                },
            },
            expected:
                "0x0e9f0106b604b604e6059e0a080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782416e7943616c6c73697465080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b7822f065668656c6c6f307830383030303066633631643439323636353931653263366661323766363039373365303835353836643236616361623063376630643335346266396336316166653762373832",
        },

        {
            operation: {
                type: OpType.LogicDeploy,
                payload: {
                    manifest: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    callsite: "AnyCallsite",
                    interfaces: {
                        ["hello"]: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    },
                },
            },
            expected:
                "0x0e9f0106b604b604e005ee05080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782416e7943616c6c736974652f065668656c6c6f307830383030303066633631643439323636353931653263366661323766363039373365303835353836643236616361623063376630643335346266396336316166653762373832",
        },
        {
            operation: {
                type: OpType.LogicDeploy,
                payload: {
                    manifest: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    callsite: "AnyCallsite",
                },
            },
            expected: "0x0e9f0106b604b604e005e005080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782416e7943616c6c73697465",
        },
        {
            operation: {
                type: OpType.LogicEnlist,
                payload: {
                    logic_id: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    callsite: "AnyCallsite",
                },
            },
            expected:
                "0x0e8f0100068609b00ab00a307830383030303066633631643439323636353931653263366661323766363039373365303835353836643236616361623063376630643335346266396336316166653762373832416e7943616c6c73697465",
        },
        {
            operation: {
                type: OpType.LogicInvoke,
                payload: {
                    logic_id: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    callsite: "AnyCallsite",
                    calldata: "0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49",
                },
            },
            expected:
                "0x0e8f0100068609b60a800e307830383030303066633631643439323636353931653263366661323766363039373365303835353836643236616361623063376630643335346266396336316166653762373832416e7943616c6c736974650d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49",
        },
    ];

    it.each(cases.map((v) => ({ ...v, name: OpType[v.operation.type] })))("should encodes $name operation with correct payload and type matching", ({ operation, expected }) => {
        const { payload, type } = encodeOperation(operation);

        expect(type).toBe(operation.type);
        expect(bytesToHex(payload)).toEqual(expected);
    });

    it("should throw an error when an unknown operation type is provided", () => {
        const operation = {
            type: 0x0f,
            payload: {},
        };

        expect(() => encodeOperation(operation as IxOperation)).toThrow();
    });
});

describe(listIxOperationDescriptors, () => {
    it("should list all operation descriptors", () => {
        const descriptors = listIxOperationDescriptors();
        expect(descriptors.length).toBeGreaterThan(0);
    });
});

describe(getIxOperationDescriptor, () => {
    it("should return a logic deploy operation descriptor", () => {
        const record = listIxOperationDescriptors().find((record) => record.type === OpType.LogicDeploy);

        expect(getIxOperationDescriptor(OpType.LogicDeploy)).toBe(record?.descriptor);
    });
});

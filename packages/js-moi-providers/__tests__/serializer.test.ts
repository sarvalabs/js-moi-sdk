import { AssetStandard, bytesToHex, OpType } from "js-moi-utils";
import { InteractionSerializer, type IxOperation } from "../src.ts";

const serializer = new InteractionSerializer();

interface TestCase {
    name: string;
    payload: IxOperation;
    expected: string;
}

describe("Serialization of ix operation payload", () => {
    const tests: TestCase[] = [
        {
            name: "should serialize a participant create operation payload",
            payload: {
                type: OpType.ASSET_CREATE,
                payload: {
                    symbol: "MOI",
                    supply: 500,
                    standard: AssetStandard.MAS0,
                },
            },
            expected: "0x0e7f063353535151504d4f4901f4",
        },
    ];

    for (const test of tests) {
        it(test.name, () => {
            const serialized = serializer.serializeOperation(test.payload);
            expect(bytesToHex(serialized)).toEqual(test.expected);
        });
    }
});

import { AssetStandard, bytesToHex, OpType } from "js-moi-utils";
import { InteractionSerializer } from "../src.ts";

const serializer = new InteractionSerializer();

describe("Serialization of ix operation payload", () => {
    it("should serialize an asset create operation payload", () => {
        const a = serializer.serializeOperation({
            type: OpType.ASSET_CREATE,
            payload: {
                symbol: "MOI",
                supply: 500,
                standard: AssetStandard.MAS0,
            },
        });

        console.log(a);
        expect(bytesToHex(a)).toBe("0x0e7f063353535151504d4f4901f4");
    });
});

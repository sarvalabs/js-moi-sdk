import { Identifier, predictAssetId } from "js-moi-identifiers";
import { Signer } from "js-moi-signer";
import { AssetStandard, OpType } from "js-moi-utils";
import { MAS0AssetLogic } from "../src.ts/mas0-asset";
import { MAS1AssetLogic } from "../src.ts/mas1-asset";
import { MAS2AssetLogic } from "../src.ts/mas2-asset";

const SENDER_ID = "0x0000000067bc504a470c5e31586eeedbefe73ccef20e0a49e1dc75ed00000000";

class FakeSigner extends Signer {
    connect(): void {}
    async getKeyId(): Promise<number> {
        return 0;
    }
    async getIdentifier(): Promise<Identifier> {
        return new Identifier(SENDER_ID);
    }
    async sign(): Promise<string> {
        return "0x";
    }
    isInitialized(): boolean {
        return true;
    }
    async signInteraction(): Promise<never> {
        throw new Error("not used in this test");
    }
    async getNonce(): Promise<number> {
        return 3;
    }
    getProvider(): any {
        return {};
    }
}

describe.each([
    ["MAS0AssetLogic", MAS0AssetLogic, AssetStandard.MAS0, [new FakeSigner(), "MOI", 1000, SENDER_ID, false] as const],
    ["MAS1AssetLogic", MAS1AssetLogic, AssetStandard.MAS1, [new FakeSigner(), "MOI", SENDER_ID, false] as const],
    ["MAS2AssetLogic", MAS2AssetLogic, AssetStandard.MAS2, [new FakeSigner(), "MOI", 1000, SENDER_ID, false] as const],
])("%s.create funding bundle", (_name, cls: any, standard, args) => {
    it("bundles a second ASSET_INVOKE Transfer op alongside ASSET_CREATE", async () => {
        const ctx = cls.create(...args);
        const ixData = await ctx.ixData();

        expect(ixData.ix_operations).toHaveLength(2);
        expect(ixData.ix_operations[0].type).toBe(OpType.ASSET_CREATE);
        expect(ixData.ix_operations[1].type).toBe(OpType.ASSET_INVOKE);
        expect((ixData.ix_operations[1].payload as any).callsite).toBe("Transfer");
    });

    it("targets the bundled transfer at the predicted asset id for that standard", async () => {
        const ctx = cls.create(...args);
        const ixData = await ctx.ixData();

        const expected = predictAssetId({ id: SENDER_ID, sequence: 3, key_id: 0 }, standard);
        const { Depolorizer } = require("js-polo");
        const calldata = (ixData.ix_operations[1].payload as any).calldata as string;
        const decoded = new Depolorizer(Buffer.from(calldata.replace(/^0x/, ""), "hex")).depolorize({
            kind: "struct",
            fields: { beneficiary: { kind: "bytes" }, amount: { kind: "integer" } },
        }) as { beneficiary: Uint8Array };

        expect("0x" + Buffer.from(decoded.beneficiary).toString("hex")).toBe(expected.toHex());
    });
});

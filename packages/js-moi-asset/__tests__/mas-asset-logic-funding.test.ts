import { Identifier, deriveAssetId } from "js-moi-identifiers";
import { Signer } from "js-moi-signer";
import { AssetStandard, OpType } from "js-moi-utils";
import { RoutineOption } from "js-moi-logic";
import { Depolorizer } from "js-polo";
import { MAS0AssetLogic } from "../src.ts/mas0-asset";
import { MAS1AssetLogic } from "../src.ts/mas1-asset";
import { MAS2AssetLogic } from "../src.ts/mas2-asset";

const decodeTransfer = (calldata: string) =>
    new Depolorizer(Buffer.from(calldata.replace(/^0x/, ""), "hex")).depolorize({
        kind: "struct",
        fields: { beneficiary: { kind: "bytes" }, amount: { kind: "integer" } },
    }) as { beneficiary: Uint8Array; amount: bigint };

const SENDER_ID = "0x0000000067bc504a470c5e31586eeedbefe73ccef20e0a49e1dc75ed00000000";

class TestSigner extends Signer {
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
    ["MAS0AssetLogic", MAS0AssetLogic, AssetStandard.MAS0, [new TestSigner(), "MOI", 1000, SENDER_ID, false] as const],
    ["MAS1AssetLogic", MAS1AssetLogic, AssetStandard.MAS1, [new TestSigner(), "MOI", SENDER_ID, false] as const],
    ["MAS2AssetLogic", MAS2AssetLogic, AssetStandard.MAS2, [new TestSigner(), "MOI", 1000, SENDER_ID, false] as const],
])("%s.create funding bundle", (_name, cls: any, standard, args) => {
    it("bundles a second ASSET_INVOKE Transfer op alongside ASSET_CREATE", async () => {
        const ctx = cls.create(...args);
        const ixData = await ctx.ixData();

        expect(ixData.ix_operations).toHaveLength(2);
        expect(ixData.ix_operations[0].type).toBe(OpType.ASSET_CREATE);
        expect(ixData.ix_operations[1].type).toBe(OpType.ASSET_INVOKE);
        expect((ixData.ix_operations[1].payload as any).callsite).toBe("Transfer");
    });

    it("targets the bundled transfer at the derived asset id for that standard", async () => {
        const ctx = cls.create(...args);
        const ixData = await ctx.ixData();

        const expected = deriveAssetId({ id: SENDER_ID, sequence: 3, key_id: 0 }, standard);
        const decoded = decodeTransfer((ixData.ix_operations[1].payload as any).calldata);

        expect("0x" + Buffer.from(decoded.beneficiary).toString("hex")).toBe(expected.toHex());
    });

    it("defaults the funding amount to DEFAULT_STORAGE_FUND", async () => {
        const { DEFAULT_STORAGE_FUND } = await import("js-moi-constants");

        const ctx = cls.create(...args);
        const ixData = await ctx.ixData();
        const decoded = decodeTransfer((ixData.ix_operations[1].payload as any).calldata);

        expect(decoded.amount.toString()).toBe(DEFAULT_STORAGE_FUND.toString());
    });

    it("honors a custom storageFund amount from RoutineOption", async () => {
        const option = new RoutineOption({ storageFund: 42 });
        const ctx = cls.create(...args, option);
        const ixData = await ctx.ixData();
        const decoded = decodeTransfer((ixData.ix_operations[1].payload as any).calldata);

        expect(decoded.amount.toString()).toBe("42");
    });
});

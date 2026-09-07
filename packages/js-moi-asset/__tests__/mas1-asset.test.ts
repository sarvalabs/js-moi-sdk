import { Identifier } from "js-moi-identifiers";
import { Signer } from "js-moi-signer";
import { MAS1AssetLogic } from "../src.ts/mas1-asset";

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
        return 0;
    }
    getProvider(): any {
        return {};
    }
}

describe("MAS1AssetLogic.create", () => {
    // MAS1 is single-unit (NFT-like): every asset under this standard has a
    // fixed max_supply of 1. There is no decimals parameter, unlike MAS0 and
    // MAS2: MAS1 has no Decimals endpoint to ever read it back, and no
    // operation carries an amount for decimals to describe.
    it("always creates an asset with max_supply 1", async () => {
        const ctx = MAS1AssetLogic.create(new TestSigner(), "GOLD", SENDER_ID, false);
        const ixData = await ctx.ixData();
        const payload = ixData.ix_operations[0].payload as any;

        expect(payload.max_supply).toBe(1);
    });

    it("does not set a decimals field on the create payload", async () => {
        const ctx = MAS1AssetLogic.create(new TestSigner(), "GOLD", SENDER_ID, false);
        const ixData = await ctx.ixData();
        const payload = ixData.ix_operations[0].payload as any;

        expect(payload.decimals).toBeUndefined();
    });

    it("ignores a stray 6th argument - decimals is not part of this signature", async () => {
        // create() only declares 5 parameters now. Passing a 6th
        // (positionally where decimals used to be) has no effect.
        const ctx = (MAS1AssetLogic.create as any)(new TestSigner(), "GOLD", SENDER_ID, false, undefined, 9);
        const ixData = await ctx.ixData();
        const payload = ixData.ix_operations[0].payload as any;

        expect(payload.decimals).toBeUndefined();
    });
});

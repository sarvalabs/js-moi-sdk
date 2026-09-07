import { Identifier } from "js-moi-identifiers";
import { Signer } from "js-moi-signer";
import { LockType } from "js-moi-utils";
import { KMOI_ASSET_ID } from "js-moi-constants";
import { MASNAssetLogic } from "../src.ts/masn-asset";

const SENDER_ID = "0x0000000067bc504a470c5e31586eeedbefe73ccef20e0a49e1dc75ed00000000";
const BENEFICIARY_ID = "0x00000000f6f2f4f0c53d3a0e0c0c5c2f3a1b2c3d4e5f60718293a4b5c6d7e800000000";

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

describe("MASNAssetLogic", () => {
    const asset = new MASNAssetLogic(new TestSigner());

    describe("transfer (mutating)", () => {
        it("targets the KMOI asset id with the Transfer callsite", async () => {
            const ctx = asset.transfer(BENEFICIARY_ID, 1_000_000n);
            const ixData = await ctx.ixData();
            const payload = ixData.ix_operations[0].payload as any;

            expect(payload.asset_id).toBe(KMOI_ASSET_ID);
            expect(payload.callsite).toBe("Transfer");
        });

        it("locks the beneficiary and includes the KMOI asset as a participant", async () => {
            const ctx = asset.transfer(BENEFICIARY_ID, 1_000_000n);
            const ixData = await ctx.ixData();

            expect(ixData.participants).toContainEqual({
                id: BENEFICIARY_ID,
                lock_type: LockType.MUTATE_LOCK,
            });
            expect(ixData.participants).toContainEqual({
                id: KMOI_ASSET_ID,
                lock_type: LockType.NO_LOCK,
            });
        });
    });

    describe("balanceOf (read-only)", () => {
        it("targets the KMOI asset id with the BalanceOf callsite", async () => {
            const ctx = asset.balanceOf(SENDER_ID);
            const ixData = await ctx.ixData();
            const payload = ixData.ix_operations[0].payload as any;

            expect(payload.asset_id).toBe(KMOI_ASSET_ID);
            expect(payload.callsite).toBe("BalanceOf");
        });
    });

    it("does not expose the endpoints reserved for protocol code", () => {
        const reserved = ["mint", "mintWithMetadata", "burn", "SetStaticMetadata", "SetDynamicMetadata"];

        for (const name of reserved) {
            expect((asset as any)[name]).toBeUndefined();
        }
    });

    it("does not expose create/newAsset - only genesis can create a MASN asset", () => {
        expect((MASNAssetLogic as any).create).toBeUndefined();
        expect((MASNAssetLogic as any).newAsset).toBeUndefined();
    });
});

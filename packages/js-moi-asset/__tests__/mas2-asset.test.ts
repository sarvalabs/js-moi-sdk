import { Identifier } from "js-moi-identifiers";
import { Signer } from "js-moi-signer";
import { MAS2AssetLogic } from "../src.ts/mas2-asset";

const SENDER_ID = "0x0000000067bc504a470c5e31586eeedbefe73ccef20e0a49e1dc75ed00000000";
const ASSET_ID = "0x108000021111111111111111111111111111111111111111111111100000000";

const ASSET_INFO_FIXTURE = {
    asset_id: ASSET_ID,
    symbol: "GLD2",
    dimension: "0x0",
    decimals: "0x4",
    creator: SENDER_ID,
    manager: SENDER_ID,
    max_supply: "0xfa",
    circulating_supply: "0x0",
    enable_events: "0x0",
    metadata: {},
};

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
    private readonly mockProvider = {
        getAssetInfoByAssetID: jest.fn().mockResolvedValue(ASSET_INFO_FIXTURE),
    };
    getProvider(): any {
        return this.mockProvider;
    }
}

describe("MAS2AssetLogic.getAssetInfo", () => {
    // MAS2's manifest has no Decimals/MaxSupply/CirculatingSupply endpoint
    // (confirmed against go-moi's common/artifacts/mas2.yaml), so this
    // reads asset metadata via the generic, standard-agnostic asset-info
    // RPC instead of a callsite.
    it("delegates to provider.getAssetInfoByAssetID with this asset's id", async () => {
        const signer = new TestSigner();
        const provider = signer.getProvider();
        const asset = new MAS2AssetLogic(ASSET_ID, signer);

        const info = await asset.getAssetInfo();

        expect(provider.getAssetInfoByAssetID).toHaveBeenCalledWith(ASSET_ID);
        expect(info.decimals).toBe(ASSET_INFO_FIXTURE.decimals);
        expect(info.max_supply).toBe(ASSET_INFO_FIXTURE.max_supply);
    });
});

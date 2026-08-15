import fs from "node:fs";
import path from "node:path";
import { Identifier, deriveAssetId } from "js-moi-identifiers";
import { Signer } from "js-moi-signer";
import { AssetStandard, OpType } from "js-moi-utils";
import { Depolorizer } from "js-polo";
import type { LogicManifest } from "js-moi-manifest";
import { AssetFactory } from "../src.ts/asset-factory";

const SENDER_ID = "0x0000000067bc504a470c5e31586eeedbefe73ccef20e0a49e1dc75ed00000000";

const MANIFEST: LogicManifest.Manifest = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../js-moi-manifest/manifests/lock-ledger.json"), "utf8"),
);
const DEPLOY_CALLSITE = "Seed";

// No callable elements at all, so no "deploy"-kind routine - the blockchain's DeployLogic
// only allows omitting the callsite when the manifest defines none (see
// compute/ixlogicdeploy.go: `if len(descriptor.DeployerCallsite) == 0 && op.Callsite() == ""`).
const NO_DEPLOY_ROUTINE_MANIFEST = { elements: [] } as unknown as LogicManifest.Manifest;

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

const decodeTransfer = (calldata: string) =>
    new Depolorizer(Buffer.from(calldata.replace(/^0x/, ""), "hex")).depolorize({
        kind: "struct",
        fields: { beneficiary: { kind: "bytes" }, amount: { kind: "integer" } },
    }) as { beneficiary: Uint8Array; amount: bigint };

const create = () =>
    AssetFactory.create(new TestSigner(), "MOI", 1000, SENDER_ID, false, MANIFEST, DEPLOY_CALLSITE, "MOI Ledger", "MOI", 1000n);

describe("AssetFactory.create funding bundle", () => {
    it("bundles a second ASSET_INVOKE Transfer op alongside ASSET_CREATE", async () => {
        const ctx = create();
        const ixData = await ctx.ixData();

        expect(ixData.ix_operations).toHaveLength(2);
        expect(ixData.ix_operations[0].type).toBe(OpType.ASSET_CREATE);
        expect(ixData.ix_operations[1].type).toBe(OpType.ASSET_INVOKE);
        expect((ixData.ix_operations[1].payload as any).callsite).toBe("Transfer");
    });

    it("always deploys as MASX - AssetFactory is for custom logic only", async () => {
        const ctx = create();
        const ixData = await ctx.ixData();

        expect((ixData.ix_operations[0].payload as any).standard).toBe(AssetStandard.MASX);
        expect((ixData.ix_operations[0].payload as any).logic_payload).toBeDefined();
    });

    it("rejects a manifest with no deploy routine matching the given callsite", () => {
        expect(() => AssetFactory.create(new TestSigner(), "MOI", 1000, SENDER_ID, false, MANIFEST, "NotARealCallsite")).toThrow();
    });

    it("allows omitting callsite when the manifest defines no deploy routine at all", async () => {
        const ctx = AssetFactory.create(new TestSigner(), "MOI", 1000, SENDER_ID, false, NO_DEPLOY_ROUTINE_MANIFEST);
        const ixData = await ctx.ixData();

        const logicPayload = (ixData.ix_operations[0].payload as any).logic_payload;
        expect(logicPayload.manifest).toBeDefined();
        expect(logicPayload.callsite).toBeUndefined();
    });

    it("rejects omitting callsite when the manifest defines one or more deploy routines", () => {
        expect(() => AssetFactory.create(new TestSigner(), "MOI", 1000, SENDER_ID, false, MANIFEST)).toThrow(
            "callsite is required",
        );
    });

    it("targets the bundled transfer at the derived asset id for that sender/sequence/standard", async () => {
        const ctx = create();
        const ixData = await ctx.ixData();

        const expected = deriveAssetId({ id: SENDER_ID, sequence: 3, key_id: 0 }, AssetStandard.MASX);
        const decoded = decodeTransfer((ixData.ix_operations[1].payload as any).calldata);

        expect("0x" + Buffer.from(decoded.beneficiary).toString("hex")).toBe(expected.toHex());
    });

    it("defaults the funding amount to DEFAULT_STORAGE_FUND", async () => {
        const { DEFAULT_STORAGE_FUND } = await import("js-moi-constants");

        const ctx = create();
        const ixData = await ctx.ixData();
        const decoded = decodeTransfer((ixData.ix_operations[1].payload as any).calldata);

        expect(decoded.amount.toString()).toBe(DEFAULT_STORAGE_FUND.toString());
    });
});

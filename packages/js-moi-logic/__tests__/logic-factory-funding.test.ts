import type { LogicManifest } from "js-moi-manifest";
import { Identifier } from "js-moi-identifiers";
import { Signer } from "js-moi-signer";
import { OpType } from "js-moi-utils";
import { LogicFactory } from "../src.ts/logic-factory";
import { createRoutineOption } from "../src.ts/routine-options";

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

const EMPTY_MANIFEST = { elements: [] } as unknown as LogicManifest.Manifest;

describe("LogicFactory deploy funding bundle", () => {
    it("bundles a second ASSET_INVOKE Transfer op alongside LOGIC_DEPLOY", async () => {
        const factory = new LogicFactory(EMPTY_MANIFEST, new FakeSigner());

        const ctx = factory.deploy();
        const ixData = await ctx.ixData();

        expect(ixData.ix_operations).toHaveLength(2);
        expect(ixData.ix_operations[0].type).toBe(OpType.LOGIC_DEPLOY);
        expect(ixData.ix_operations[1].type).toBe(OpType.ASSET_INVOKE);
        expect((ixData.ix_operations[1].payload as any).callsite).toBe("Transfer");
    });

    it("defaults the funding amount to DEFAULT_NEW_ACCOUNT_FUNDING when no RoutineOption is given", async () => {
        const { DEFAULT_NEW_ACCOUNT_FUNDING } = await import("js-moi-constants");
        const { Depolorizer } = await import("js-polo");

        const factory = new LogicFactory(EMPTY_MANIFEST, new FakeSigner());
        const ixData = await factory.deploy().ixData();

        const calldata = (ixData.ix_operations[1].payload as any).calldata as string;
        const decoded = new Depolorizer(Buffer.from(calldata.replace(/^0x/, ""), "hex")).depolorize({
            kind: "struct",
            fields: { beneficiary: { kind: "bytes" }, amount: { kind: "integer" } },
        }) as { beneficiary: Uint8Array; amount: bigint };

        expect(decoded.amount.toString()).toBe(DEFAULT_NEW_ACCOUNT_FUNDING.toString());
    });

    it("honors a custom fundNewAccount amount from RoutineOption", async () => {
        const { Depolorizer } = await import("js-polo");

        const factory = new LogicFactory(EMPTY_MANIFEST, new FakeSigner());
        const option = createRoutineOption({ fundNewAccount: 42 });
        const ixData = await factory.deploy(undefined, option).ixData();

        const calldata = (ixData.ix_operations[1].payload as any).calldata as string;
        const decoded = new Depolorizer(Buffer.from(calldata.replace(/^0x/, ""), "hex")).depolorize({
            kind: "struct",
            fields: { beneficiary: { kind: "bytes" }, amount: { kind: "integer" } },
        }) as { beneficiary: Uint8Array; amount: bigint };

        expect(decoded.amount.toString()).toBe("42");
    });

    it("targets the bundled transfer at the predicted logic id for that sender/sequence", async () => {
        const { predictLogicId } = await import("js-moi-identifiers");
        const { Depolorizer } = await import("js-polo");

        const factory = new LogicFactory(EMPTY_MANIFEST, new FakeSigner());
        const ixData = await factory.deploy().ixData();

        const expected = predictLogicId({ id: SENDER_ID, sequence: 3, key_id: 0 });

        const calldata = (ixData.ix_operations[1].payload as any).calldata as string;
        const decoded = new Depolorizer(Buffer.from(calldata.replace(/^0x/, ""), "hex")).depolorize({
            kind: "struct",
            fields: { beneficiary: { kind: "bytes" }, amount: { kind: "integer" } },
        }) as { beneficiary: Uint8Array; amount: bigint };

        expect("0x" + Buffer.from(decoded.beneficiary).toString("hex")).toBe(expected.toHex());
    });
});

import { OpType } from "js-moi-utils";
import { StorageDeposit, StorageWithdraw } from "../src.ts/storage";

type Hex = `0x${string}`;

const TARGET: Hex = `0x${"22".repeat(32)}`;
const SIGNER_ID: Hex = `0x${"aa".repeat(32)}`;
const OTHER: Hex = `0x${"33".repeat(32)}`;

const mockSigner = {
    getIdentifier: jest.fn().mockResolvedValue({ toHex: () => SIGNER_ID }),
} as any;

describe("StorageDeposit", () => {
    test("target/for/amount return the builder for chaining", () => {
        const builder = new StorageDeposit(mockSigner);

        expect(builder.target(TARGET)).toBe(builder);
        expect(builder.for(OTHER)).toBe(builder);
        expect(builder.amount(100)).toBe(builder);
    });

    test("build() returns a STORAGE_DEPOSIT context with the correct payload", async () => {
        const ctx = await new StorageDeposit(mockSigner).target(TARGET).for(OTHER).amount(5000).build();

        expect(ctx.type()).toBe(OpType.STORAGE_DEPOSIT);
        expect(ctx.payload().target_account).toBe(TARGET);
        expect(ctx.payload().deposit_for).toBe(OTHER);
        expect(ctx.payload().amount).toBe(5000);
    });

    test("build() defaults deposit_for to the signer's own identifier when .for() is omitted", async () => {
        const ctx = await new StorageDeposit(mockSigner).target(TARGET).amount(5000).build();

        expect(ctx.payload().deposit_for).toBe(SIGNER_ID);
        expect(mockSigner.getIdentifier).toHaveBeenCalled();
    });

    test("build() does not call getIdentifier when .for() is explicitly set", async () => {
        mockSigner.getIdentifier.mockClear();

        await new StorageDeposit(mockSigner).target(TARGET).for(OTHER).amount(5000).build();

        expect(mockSigner.getIdentifier).not.toHaveBeenCalled();
    });

    test("build() throws when target is not set", async () => {
        await expect(new StorageDeposit(mockSigner).amount(5000).build()).rejects.toThrow("target account is required");
    });

    test("build() throws when amount is not set", async () => {
        await expect(new StorageDeposit(mockSigner).target(TARGET).build()).rejects.toThrow("amount is required");
    });
});

describe("StorageWithdraw", () => {
    test("target/release return the builder for chaining", () => {
        const builder = new StorageWithdraw(mockSigner);

        expect(builder.target(TARGET)).toBe(builder);
        expect(builder.release(100)).toBe(builder);
    });

    test("build() returns a STORAGE_WITHDRAW context with the correct payload", () => {
        const ctx = new StorageWithdraw(mockSigner).target(TARGET).release(1000).build();

        expect(ctx.type()).toBe(OpType.STORAGE_WITHDRAW);
        expect(ctx.payload().target_account).toBe(TARGET);
        expect(ctx.payload().bytes_to_release).toBe(1000);
    });

    test("build() defaults bytes_to_release to 0 (release everything available) when .release() is omitted", () => {
        const ctx = new StorageWithdraw(mockSigner).target(TARGET).build();

        expect(ctx.payload().bytes_to_release).toBe(0);
    });

    test("build() throws when target is not set", () => {
        expect(() => new StorageWithdraw(mockSigner).build()).toThrow("target account is required");
    });
});

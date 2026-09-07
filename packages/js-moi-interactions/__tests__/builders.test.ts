import { KMOI_ASSET_ID } from "js-moi-constants";
import { LockType, OpType } from "js-moi-utils";
import { AccountConfigure, AccountInherit } from "../src.ts/account";
import { InteractionContext } from "../src.ts/context";
import { ParticipantCreate } from "../src.ts/participant";
import { TRANSFER_SCHEMA } from "../src.ts/schema";
import type { AllowedOps, IxContext } from "../types/context";

type Hex = `0x${string}`;

const BENEFICIARY: Hex = `0x${"00".repeat(32)}`;
const ASSET_ID: Hex = `0x${"11".repeat(32)}`;
const TARGET: Hex = `0x${"22".repeat(32)}`;
const PUBLIC_KEY: Hex = "0x02870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b";

const mockSigner = {} as any;

describe("TRANSFER_SCHEMA", () => {
    test("is a struct with beneficiary (bytes) and amount (integer) fields", () => {
        expect(TRANSFER_SCHEMA.kind).toBe("struct");
        expect(TRANSFER_SCHEMA.fields.beneficiary.kind).toBe("bytes");
        expect(TRANSFER_SCHEMA.fields.amount.kind).toBe("integer");
    });
});

describe("InteractionContext", () => {
    const makeCtx = <T extends AllowedOps>(ctx: IxContext<T>) => new InteractionContext(ctx);

    test("type() returns the operation type", () => {
        const ctx = makeCtx({
            opType: OpType.ACCOUNT_CONFIGURE,
            payload: { add: [], revoke: [{ key_id: 0 }] },
            participants: [],
            signer: mockSigner,
        });

        expect(ctx.type()).toBe(OpType.ACCOUNT_CONFIGURE);
    });

    test("payload() returns the stored payload", () => {
        const payload = { add: [{ public_key: PUBLIC_KEY as Hex, weight: 1, signature_algorithm: 0 }], revoke: [] };
        const ctx = makeCtx({
            opType: OpType.ACCOUNT_CONFIGURE,
            payload,
            participants: [],
            signer: mockSigner,
        });

        expect(ctx.payload()).toStrictEqual(payload);
    });

    test("participants() returns the stored participants", () => {
        const participants = [{ id: ASSET_ID, lock_type: LockType.NO_LOCK }];
        const ctx = makeCtx({
            opType: OpType.ACCOUNT_CONFIGURE,
            payload: { add: [], revoke: [{ key_id: 0 }] },
            participants,
            signer: mockSigner,
        });

        expect(ctx.participants()).toStrictEqual(participants);
    });

    describe("mergeParticipants (via buildOperation)", () => {
        test("buildOperation returns the correct type and payload object", () => {
            const payload = { add: [], revoke: [{ key_id: 1 }] };
            class TestCtx<T extends AllowedOps> extends InteractionContext<T> {
                public testBuildOperation() {
                    return this.buildOperation();
                }
                public testMergeParticipants(option?: any) {
                    return this.mergeParticipants(option);
                }
            }

            const ctx = new TestCtx({
                opType: OpType.ACCOUNT_CONFIGURE,
                payload,
                participants: [],
                signer: mockSigner,
            } as IxContext<OpType.ACCOUNT_CONFIGURE>);

            const op = ctx.testBuildOperation();
            expect(op.type).toBe(OpType.ACCOUNT_CONFIGURE);
        });

        test("mergeParticipants deduplicates by id, with option entries overriding base", () => {
            class TestCtx<T extends AllowedOps> extends InteractionContext<T> {
                public testMerge(option?: any) {
                    return this.mergeParticipants(option);
                }
            }

            const base = [{ id: ASSET_ID, lock_type: LockType.MUTATE_LOCK }];
            const ctx = new TestCtx({
                opType: OpType.ACCOUNT_CONFIGURE,
                payload: { add: [], revoke: [{ key_id: 0 }] },
                participants: base,
                signer: mockSigner,
            } as IxContext<OpType.ACCOUNT_CONFIGURE>);

            const override = [{ id: ASSET_ID, lock_type: LockType.NO_LOCK }];
            const merged = ctx.testMerge({ participants: override });

            expect(merged).toHaveLength(1);
            expect(merged[0].lock_type).toBe(LockType.NO_LOCK);
        });

        test("mergeParticipants combines base and option participants when ids differ", () => {
            const OTHER: Hex = `0x${"33".repeat(32)}`;

            class TestCtx<T extends AllowedOps> extends InteractionContext<T> {
                public testMerge(option?: any) {
                    return this.mergeParticipants(option);
                }
            }

            const ctx = new TestCtx({
                opType: OpType.ACCOUNT_CONFIGURE,
                payload: { add: [], revoke: [{ key_id: 0 }] },
                participants: [{ id: ASSET_ID, lock_type: LockType.MUTATE_LOCK }],
                signer: mockSigner,
            } as IxContext<OpType.ACCOUNT_CONFIGURE>);

            const merged = ctx.testMerge({ participants: [{ id: OTHER, lock_type: LockType.NO_LOCK }] });

            expect(merged).toHaveLength(2);
        });
    });
});

describe("AccountConfigure", () => {
    test("addKey accumulates keys and returns the builder for chaining", () => {
        const builder = new AccountConfigure(mockSigner);
        const result = builder.addKey(PUBLIC_KEY as Hex, 1);

        expect(result).toBe(builder);
    });

    test("revokeKey accumulates revoke entries and returns the builder for chaining", () => {
        const builder = new AccountConfigure(mockSigner);
        const result = builder.revokeKey(0);

        expect(result).toBe(builder);
    });

    test("build() with only add entries returns a ACCOUNT_CONFIGURE context", () => {
        const ctx = new AccountConfigure(mockSigner)
            .addKey(PUBLIC_KEY as Hex, 1)
            .build();

        expect(ctx.type()).toBe(OpType.ACCOUNT_CONFIGURE);
        expect(ctx.payload().add).toHaveLength(1);
        expect(ctx.payload().add![0].public_key).toBe(PUBLIC_KEY);
        expect(ctx.payload().add![0].weight).toBe(1);
        expect(ctx.payload().add![0].signature_algorithm).toBe(0);
    });

    test("build() with only revoke entries returns a valid context", () => {
        const ctx = new AccountConfigure(mockSigner)
            .revokeKey(2)
            .build();

        expect(ctx.type()).toBe(OpType.ACCOUNT_CONFIGURE);
        expect(ctx.payload().revoke).toHaveLength(1);
        expect(ctx.payload().revoke![0].key_id).toBe(2);
    });

    test("build() with both add and revoke entries succeeds", () => {
        const ctx = new AccountConfigure(mockSigner)
            .addKey(PUBLIC_KEY as Hex, 1)
            .revokeKey(3)
            .build();

        expect(ctx.payload().add).toHaveLength(1);
        expect(ctx.payload().revoke).toHaveLength(1);
    });

    test("build() uses the default signature_algorithm of 0 when not specified", () => {
        const ctx = new AccountConfigure(mockSigner).addKey(PUBLIC_KEY as Hex, 1).build();

        expect(ctx.payload().add![0].signature_algorithm).toBe(0);
    });

    test("build() throws when both add and revoke are empty", () => {
        expect(() => new AccountConfigure(mockSigner).build()).toThrow("add or revoke");
    });
});

describe("AccountInherit", () => {
    const validCtx = () =>
        new AccountInherit(mockSigner)
            .target(TARGET)
            .value(ASSET_ID, BENEFICIARY, 100)
            .index(0)
            .build();

    test("build() returns an ACCOUNT_INHERIT context with the correct payload", () => {
        const ctx = validCtx();

        expect(ctx.type()).toBe(OpType.ACCOUNT_INHERIT);
        expect(ctx.payload().target_account).toBe(TARGET);
        expect(ctx.payload().sub_account_index).toBe(0);
        expect(ctx.payload().value.asset_id).toBe(ASSET_ID);
        expect(ctx.payload().value.callsite).toBe("Transfer");
        expect(ctx.payload().value.calldata).toBeDefined();
    });

    test("build() includes the KMOI asset as a NO_LOCK participant", () => {
        const ctx = validCtx();
        const participants = ctx.participants();

        expect(participants).toHaveLength(1);
        expect(participants[0].id.toLowerCase()).toBe(KMOI_ASSET_ID.toLowerCase());
        expect(participants[0].lock_type).toBe(LockType.NO_LOCK);
    });

    test("target() returns the builder for chaining", () => {
        const builder = new AccountInherit(mockSigner);
        expect(builder.target(TARGET)).toBe(builder);
    });

    test("value() returns the builder for chaining", () => {
        const builder = new AccountInherit(mockSigner);
        expect(builder.value(ASSET_ID, BENEFICIARY, 100)).toBe(builder);
    });

    test("index() returns the builder for chaining", () => {
        const builder = new AccountInherit(mockSigner);
        expect(builder.index(1)).toBe(builder);
    });

    test("build() throws when target is not set", () => {
        expect(() =>
            new AccountInherit(mockSigner).value(ASSET_ID, BENEFICIARY, 100).index(0).build()
        ).toThrow("target account is required");
    });

    test("build() throws when value is not set", () => {
        expect(() =>
            new AccountInherit(mockSigner).target(TARGET).index(0).build()
        ).toThrow("asset payload is required");
    });

    test("build() throws when index is not set", () => {
        expect(() =>
            new AccountInherit(mockSigner).target(TARGET).value(ASSET_ID, BENEFICIARY, 100).build()
        ).toThrow("sub account index is required");
    });
});

describe("ParticipantCreate", () => {
    const validCtx = () =>
        new ParticipantCreate(mockSigner)
            .id(TARGET)
            .addKey(PUBLIC_KEY as Hex, 1)
            .value(ASSET_ID, BENEFICIARY, 50)
            .build();

    test("build() returns a PARTICIPANT_CREATE context with the correct payload", () => {
        const ctx = validCtx();

        expect(ctx.type()).toBe(OpType.PARTICIPANT_CREATE);
        expect(ctx.payload().id).toBe(TARGET);
        expect(ctx.payload().keys_payload).toHaveLength(1);
        expect(ctx.payload().keys_payload[0].public_key).toBe(PUBLIC_KEY);
        expect(ctx.payload().keys_payload[0].weight).toBe(1);
        expect(ctx.payload().value.asset_id).toBe(ASSET_ID);
        expect(ctx.payload().value.callsite).toBe("Transfer");
    });

    test("build() includes the asset as a NO_LOCK participant", () => {
        const ctx = validCtx();
        const participants = ctx.participants();

        expect(participants).toHaveLength(1);
        expect(participants[0].id).toBe(ASSET_ID);
        expect(participants[0].lock_type).toBe(LockType.NO_LOCK);
    });

    test("addKey() supports multiple keys", () => {
        const ctx = new ParticipantCreate(mockSigner)
            .id(TARGET)
            .addKey(PUBLIC_KEY as Hex, 1)
            .addKey(PUBLIC_KEY as Hex, 2)
            .value(ASSET_ID, BENEFICIARY, 50)
            .build();

        expect(ctx.payload().keys_payload).toHaveLength(2);
    });

    test("id() returns the builder for chaining", () => {
        const builder = new ParticipantCreate(mockSigner);
        expect(builder.id(TARGET)).toBe(builder);
    });

    test("addKey() returns the builder for chaining", () => {
        const builder = new ParticipantCreate(mockSigner);
        expect(builder.addKey(PUBLIC_KEY as Hex, 1)).toBe(builder);
    });

    test("value() returns the builder for chaining", () => {
        const builder = new ParticipantCreate(mockSigner);
        expect(builder.value(ASSET_ID, BENEFICIARY, 100)).toBe(builder);
    });

    test("build() throws when id is not set", () => {
        expect(() =>
            new ParticipantCreate(mockSigner).addKey(PUBLIC_KEY as Hex, 1).value(ASSET_ID, BENEFICIARY, 50).build()
        ).toThrow("participant id is required");
    });

    test("build() throws when value is not set", () => {
        expect(() =>
            new ParticipantCreate(mockSigner).id(TARGET).addKey(PUBLIC_KEY as Hex, 1).build()
        ).toThrow("asset payload is required");
    });

    test("build() throws when no keys are added", () => {
        expect(() =>
            new ParticipantCreate(mockSigner).id(TARGET).value(ASSET_ID, BENEFICIARY, 50).build()
        ).toThrow("atleast one key is required");
    });
});

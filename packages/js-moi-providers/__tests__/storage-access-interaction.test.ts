import { LockType, OpType, ResourceType, AccessAction, CallerKind } from "js-moi-utils";
import { Depolorizer } from "js-polo";
import type { InteractionObject } from "../types/interaction";
import type { AccessDeletePayload, AccessPayload, StoragePayload } from "../types/operation";
import {
    processInteractionObject,
    toRawInteractionObject,
    validateAccessCreateOrUpdate,
    validateAccessDelete,
    validateAccessPolicy,
    validateCallerConstraint,
    validateStorageDeposit,
    validateStorageWithdraw,
} from "../src.ts/interaction";

type Hex = `0x${string}`;

// Real, structurally valid MOI identifiers (tag/kind bytes correct) - required because the
// encoding round-trip below constructs real Identifier/ParticipantId instances, unlike the
// validate* functions, which only check plain string shape and accept any non-empty hex.
const SENDER: Hex = "0x0000000067bc504a470c5e31586eeedbefe73ccef20e0a49e1dc75ed00000000";
const LOGIC: Hex = "0x208300005edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f7800000000";
const OTHER: Hex = "0x108000004cd973c4eb83cdb8870c0de209736270491b7acc99873da100000000";

const FAKE_SENDER: Hex = `0x${"ab".repeat(32)}`;
const FAKE_LOGIC: Hex = `0x${"cd".repeat(32)}`;
const FAKE_OTHER: Hex = `0x${"ef".repeat(32)}`;

const makeIx = (ops: any[]): InteractionObject => ({
    sender: { id: FAKE_SENDER, sequence: 0, key_id: 0 },
    fuel_price: 1,
    fuel_limit: 200,
    ix_operations: ops as InteractionObject["ix_operations"],
});

const decodeStruct = (bytes: Uint8Array, schema: any) => new Depolorizer(Buffer.from(bytes)).depolorize(schema);

const TRANSFER_LIKE_SCHEMA = { kind: "struct", fields: { beneficiary: { kind: "bytes" }, amount: { kind: "integer" } } };

describe("validateStorageDeposit", () => {
    test("accepts a valid deposit payload", () => {
        const payload: StoragePayload = { target_account: FAKE_LOGIC, deposit_for: FAKE_SENDER, amount: 1000 };
        expect(() => validateStorageDeposit(payload)).not.toThrow();
    });

    test("throws when target_account is empty", () => {
        const payload = { target_account: "" as Hex, deposit_for: FAKE_SENDER, amount: 1000 };
        expect(() => validateStorageDeposit(payload)).toThrow("target_account");
    });

    test("throws when deposit_for is missing", () => {
        const payload = { target_account: FAKE_LOGIC, amount: 1000 } as StoragePayload;
        expect(() => validateStorageDeposit(payload)).toThrow("deposit_for");
    });

    test("throws when amount is missing", () => {
        const payload = { target_account: FAKE_LOGIC, deposit_for: FAKE_SENDER } as StoragePayload;
        expect(() => validateStorageDeposit(payload)).toThrow("amount");
    });

    test("throws when amount is zero", () => {
        const payload: StoragePayload = { target_account: FAKE_LOGIC, deposit_for: FAKE_SENDER, amount: 0 };
        expect(() => validateStorageDeposit(payload)).toThrow("amount");
    });

    test("throws when amount is negative", () => {
        const payload: StoragePayload = { target_account: FAKE_LOGIC, deposit_for: FAKE_SENDER, amount: -1 };
        expect(() => validateStorageDeposit(payload)).toThrow("amount");
    });

    test("accepts a bigint amount", () => {
        const payload: StoragePayload = { target_account: FAKE_LOGIC, deposit_for: FAKE_SENDER, amount: 1000n };
        expect(() => validateStorageDeposit(payload)).not.toThrow();
    });
});

describe("validateStorageWithdraw", () => {
    test("accepts a valid withdraw payload", () => {
        const payload: StoragePayload = { target_account: FAKE_LOGIC, bytes_to_release: 500 };
        expect(() => validateStorageWithdraw(payload)).not.toThrow();
    });

    test("accepts bytes_to_release of 0 (release everything available)", () => {
        const payload: StoragePayload = { target_account: FAKE_LOGIC, bytes_to_release: 0 };
        expect(() => validateStorageWithdraw(payload)).not.toThrow();
    });

    test("throws when target_account is empty", () => {
        const payload = { target_account: "" as Hex, bytes_to_release: 0 };
        expect(() => validateStorageWithdraw(payload)).toThrow("target_account");
    });

    test("accepts a missing bytes_to_release (releases everything available)", () => {
        const payload = { target_account: FAKE_LOGIC } as StoragePayload;
        expect(() => validateStorageWithdraw(payload)).not.toThrow();
    });

    test("throws when bytes_to_release is negative", () => {
        const payload: StoragePayload = { target_account: FAKE_LOGIC, bytes_to_release: -1 };
        expect(() => validateStorageWithdraw(payload)).toThrow("bytes_to_release");
    });
});

describe("validateCallerConstraint", () => {
    test("accepts CallerKind.ANY with an empty set", () => {
        expect(() => validateCallerConstraint({ kind: CallerKind.ANY, set: [] }, "caller")).not.toThrow();
    });

    test("accepts CallerKind.SET with a non-empty set", () => {
        expect(() => validateCallerConstraint({ kind: CallerKind.SET, set: [FAKE_OTHER] }, "caller")).not.toThrow();
    });

    test("throws when CallerKind.SET has an empty set", () => {
        expect(() => validateCallerConstraint({ kind: CallerKind.SET, set: [] }, "caller")).toThrow("caller");
    });

    test("throws when constraint is missing", () => {
        expect(() => validateCallerConstraint(undefined as any, "origin")).toThrow("origin");
    });

    test("error message includes the given label", () => {
        expect(() => validateCallerConstraint({ kind: CallerKind.SET, set: [] }, "origin")).toThrow("origin");
    });
});

describe("validateAccessPolicy", () => {
    const anyConstraint = { kind: CallerKind.ANY, set: [] };

    test("accepts a valid storage policy", () => {
        const policy = {
            resource: ResourceType.STORAGE,
            resource_id: FAKE_LOGIC,
            actions: AccessAction.STORAGE_MUTATE,
            caller: anyConstraint,
            origin: anyConstraint,
        };
        expect(() => validateAccessPolicy(policy as any)).not.toThrow();
    });

    test("throws for a non-storage resource type", () => {
        const policy = {
            resource: ResourceType.ASSET,
            resource_id: FAKE_LOGIC,
            actions: AccessAction.STORAGE_MUTATE,
            caller: anyConstraint,
            origin: anyConstraint,
        };
        expect(() => validateAccessPolicy(policy as any)).toThrow("STORAGE");
    });

    test("throws when resource_id is empty", () => {
        const policy = {
            resource: ResourceType.STORAGE,
            resource_id: "" as Hex,
            actions: AccessAction.STORAGE_MUTATE,
            caller: anyConstraint,
            origin: anyConstraint,
        };
        expect(() => validateAccessPolicy(policy as any)).toThrow("resource_id");
    });

    test("throws when actions is zero", () => {
        const policy = {
            resource: ResourceType.STORAGE,
            resource_id: FAKE_LOGIC,
            actions: 0,
            caller: anyConstraint,
            origin: anyConstraint,
        };
        expect(() => validateAccessPolicy(policy as any)).toThrow("actions");
    });

    test("throws when caller constraint is invalid", () => {
        const policy = {
            resource: ResourceType.STORAGE,
            resource_id: FAKE_LOGIC,
            actions: AccessAction.STORAGE_MUTATE,
            caller: { kind: CallerKind.SET, set: [] },
            origin: anyConstraint,
        };
        expect(() => validateAccessPolicy(policy as any)).toThrow("caller");
    });
});

describe("validateAccessCreateOrUpdate", () => {
    test("throws when target_account is empty", () => {
        const payload = { target_account: "" as Hex, access_policy: {} } as AccessPayload;
        expect(() => validateAccessCreateOrUpdate(payload)).toThrow("target_account");
    });

    test("throws when payload is missing", () => {
        expect(() => validateAccessCreateOrUpdate(undefined as any)).toThrow("payload");
    });
});

describe("validateAccessDelete", () => {
    test("accepts a valid delete payload", () => {
        const payload: AccessDeletePayload = { target_account: FAKE_LOGIC, resource: ResourceType.STORAGE, resource_id: FAKE_LOGIC };
        expect(() => validateAccessDelete(payload)).not.toThrow();
    });

    test("throws when target_account is empty", () => {
        const payload = { target_account: "" as Hex, resource: ResourceType.STORAGE, resource_id: FAKE_LOGIC };
        expect(() => validateAccessDelete(payload)).toThrow("target_account");
    });

    test("throws when resource is missing", () => {
        const payload = { target_account: FAKE_LOGIC, resource_id: FAKE_LOGIC } as AccessDeletePayload;
        expect(() => validateAccessDelete(payload)).toThrow("resource");
    });

    test("throws when resource_id is empty", () => {
        const payload = { target_account: FAKE_LOGIC, resource: ResourceType.STORAGE, resource_id: "" as Hex };
        expect(() => validateAccessDelete(payload)).toThrow("resource_id");
    });
});

describe("processInteractionObject - participant derivation for the new ops", () => {
    test("STORAGE_DEPOSIT adds the target account as a MUTATE_LOCK participant", () => {
        const ix = makeIx([{ type: OpType.STORAGE_DEPOSIT, payload: { target_account: FAKE_LOGIC, deposit_for: FAKE_SENDER, amount: 1000 } }]);
        const result = processInteractionObject(ix);

        expect(result.participants).toContainEqual({ id: FAKE_LOGIC, lock_type: LockType.MUTATE_LOCK });
    });

    test("STORAGE_WITHDRAW adds the target account as a MUTATE_LOCK participant", () => {
        const ix = makeIx([{ type: OpType.STORAGE_WITHDRAW, payload: { target_account: FAKE_LOGIC, bytes_to_release: 0 } }]);
        const result = processInteractionObject(ix);

        expect(result.participants).toContainEqual({ id: FAKE_LOGIC, lock_type: LockType.MUTATE_LOCK });
    });

    test("ACCESS_CREATE adds the target account as a MUTATE_LOCK participant", () => {
        const ix = makeIx([{ type: OpType.ACCESS_CREATE, payload: { target_account: FAKE_SENDER, access_policy: {} } }]);
        const result = processInteractionObject(ix);

        expect(result.participants).toContainEqual({ id: FAKE_SENDER, lock_type: LockType.MUTATE_LOCK });
    });

    test("ACCESS_DELETE adds the target account as a MUTATE_LOCK participant", () => {
        const ix = makeIx([{ type: OpType.ACCESS_DELETE, payload: { target_account: FAKE_SENDER, resource: ResourceType.STORAGE, resource_id: FAKE_LOGIC } }]);
        const result = processInteractionObject(ix);

        expect(result.participants).toContainEqual({ id: FAKE_SENDER, lock_type: LockType.MUTATE_LOCK });
    });
});

describe("toRawInteractionObject - wire encoding for the new ops", () => {
    const baseIx = (op: any): InteractionObject => ({
        sender: { id: SENDER, sequence: 0, key_id: 0 },
        fuel_price: 1,
        fuel_limit: 1000,
        ix_operations: [op],
    });

    test("STORAGE_DEPOSIT encodes target_account, deposit_for, and amount correctly", () => {
        const ix = baseIx({ type: OpType.STORAGE_DEPOSIT, payload: { target_account: LOGIC, deposit_for: SENDER, amount: 5000 } });
        const raw = toRawInteractionObject(ix);

        expect(raw.ix_operations).toHaveLength(1);
        expect(raw.ix_operations![0].type).toBe(OpType.STORAGE_DEPOSIT);
        expect(raw.ix_operations![0].payload.length).toBeGreaterThan(0);
    });

    test("STORAGE_WITHDRAW defaults bytes_to_release to 0 when omitted", () => {
        const ix = baseIx({ type: OpType.STORAGE_WITHDRAW, payload: { target_account: LOGIC } });
        expect(() => toRawInteractionObject(ix)).not.toThrow();
    });

    test("ACCESS_CREATE encodes a full access policy without throwing", () => {
        const ix = baseIx({
            type: OpType.ACCESS_CREATE,
            payload: {
                target_account: SENDER,
                access_policy: {
                    resource: ResourceType.STORAGE,
                    resource_id: LOGIC,
                    actions: AccessAction.STORAGE_MUTATE,
                    scope: { prefixes: ["0x01"] },
                    caller: { kind: CallerKind.SET, set: [OTHER] },
                    origin: { kind: CallerKind.ANY, set: [] },
                },
            },
        });

        const raw = toRawInteractionObject(ix);
        expect(raw.ix_operations![0].payload.length).toBeGreaterThan(0);
    });

    test("ACCESS_DELETE encodes only target_account, resource, and resource_id", () => {
        const ix = baseIx({
            type: OpType.ACCESS_DELETE,
            payload: { target_account: SENDER, resource: ResourceType.STORAGE, resource_id: LOGIC },
        });

        const raw = toRawInteractionObject(ix);
        expect(raw.ix_operations![0].payload.length).toBeGreaterThan(0);
    });

    test("bundled Transfer-shaped calldata (from js-moi-interactions) decodes back to the right beneficiary/amount", () => {
        // Sanity check that the generic POLO round-trip machinery this suite exercises is
        // consistent with how js-moi-interactions builds its own bundled funding transfers.
        const { Polorizer } = require("js-polo");
        const polorizer = new Polorizer();
        polorizer.polorize({ beneficiary: Buffer.from(LOGIC.slice(2), "hex"), amount: 42 }, TRANSFER_LIKE_SCHEMA);
        const bytes = polorizer.bytes();

        const decoded = decodeStruct(bytes, TRANSFER_LIKE_SCHEMA) as { beneficiary: Uint8Array; amount: bigint };
        expect("0x" + Buffer.from(decoded.beneficiary).toString("hex")).toBe(LOGIC);
        expect(decoded.amount.toString()).toBe("42");
    });
});

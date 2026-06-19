import { KMOI_ASSET_ID, ZERO_ADDRESS } from "js-moi-constants";
import { LockType, OpType } from "js-moi-utils";
import type { InteractionObject, Signature } from "../types/interaction";
import {
    processInteractionObject,
    toRawSignatures,
    validateAccountConfigure,
    validateAccountInherit,
    validateAssetAction,
    validateAssetCreate,
    validateKeyAdd,
    validateKeyRevoke,
    validateLogicAction,
    validateLogicDeploy,
    validateLogicPayload,
    validateParticipantCreate,
} from "../src.ts/interaction";

type Hex = `0x${string}`;

const SENDER: Hex = `0x${"ab".repeat(32)}`;
const ASSET: Hex = `0x${"cd".repeat(32)}`;
const LOGIC: Hex = `0x${"ef".repeat(32)}`;
const PAYER: Hex = `0x${"12".repeat(32)}`;
const PUBLIC_KEY: Hex = "0x02870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b";

const makeIx = (ops: any[], payer?: Hex, extra?: Partial<InteractionObject>): InteractionObject => ({
    sender: { id: SENDER, sequence: 0, key_id: 0 },
    fuel_price: 1,
    fuel_limit: 200,
    ix_operations: ops as InteractionObject["ix_operations"],
    ...(payer !== undefined ? { payer } : {}),
    ...extra,
});

describe("validateKeyAdd", () => {
    test("accepts a valid key add payload", () => {
        expect(() => validateKeyAdd({ public_key: PUBLIC_KEY, weight: 1, signature_algorithm: 0 }, 0)).not.toThrow();
    });

    test("throws when public_key is empty", () => {
        expect(() => validateKeyAdd({ public_key: "" as Hex, weight: 1, signature_algorithm: 0 }, 0)).toThrow("public key");
    });

    test("throws when weight is zero", () => {
        expect(() => validateKeyAdd({ public_key: PUBLIC_KEY, weight: 0, signature_algorithm: 0 }, 0)).toThrow("weight");
    });

    test("throws when weight is negative", () => {
        expect(() => validateKeyAdd({ public_key: PUBLIC_KEY, weight: -1, signature_algorithm: 0 }, 0)).toThrow("weight");
    });

    test("throws when signature_algorithm is not 0", () => {
        expect(() => validateKeyAdd({ public_key: PUBLIC_KEY, weight: 1, signature_algorithm: 1 }, 0)).toThrow("signature algorithm");
    });
});

describe("validateKeyRevoke", () => {
    test("accepts a valid revoke payload", () => {
        expect(() => validateKeyRevoke({ key_id: 0 }, 0)).not.toThrow();
    });

    test("throws when key_id is negative", () => {
        expect(() => validateKeyRevoke({ key_id: -1 }, 0)).toThrow("key id");
    });

    test("throws when key_id is not a number", () => {
        expect(() => validateKeyRevoke({ key_id: "abc" as any }, 0)).toThrow("key id");
    });
});

describe("validateAssetAction", () => {
    const valid = { asset_id: ASSET, callsite: "Transfer" };

    test("accepts a valid asset action payload", () => {
        expect(() => validateAssetAction(valid)).not.toThrow();
    });

    test("accepts payload with optional calldata", () => {
        expect(() => validateAssetAction({ ...valid, calldata: "0xdeadbeef" })).not.toThrow();
    });

    test("throws when payload is null", () => {
        expect(() => validateAssetAction(null as any)).toThrow("payload is required");
    });

    test("throws when asset_id is empty", () => {
        expect(() => validateAssetAction({ ...valid, asset_id: "" } as any)).toThrow("asset_id");
    });

    test("throws when callsite is empty", () => {
        expect(() => validateAssetAction({ ...valid, callsite: "" } as any)).toThrow("callsite");
    });

    test("throws when calldata is an empty string", () => {
        expect(() => validateAssetAction({ ...valid, calldata: "" } as any)).toThrow("calldata");
    });

    test("throws when funds contain a non-numeric value", () => {
        expect(() => validateAssetAction({ ...valid, funds: { "0xkey": "bad" as any } })).toThrow("funds values");
    });

    test("throws when funds contain a negative number", () => {
        expect(() => validateAssetAction({ ...valid, funds: { "0xkey": -1 } })).toThrow("non-negative");
    });
});

describe("validateAccountConfigure", () => {
    test("accepts payload with an add entry", () => {
        expect(() =>
            validateAccountConfigure({ add: [{ public_key: PUBLIC_KEY, weight: 1, signature_algorithm: 0 }], revoke: [] })
        ).not.toThrow();
    });

    test("accepts payload with a revoke entry", () => {
        expect(() => validateAccountConfigure({ add: [], revoke: [{ key_id: 0 }] })).not.toThrow();
    });

    test("accepts payload with both add and revoke entries", () => {
        expect(() =>
            validateAccountConfigure({
                add: [{ public_key: PUBLIC_KEY, weight: 1, signature_algorithm: 0 }],
                revoke: [{ key_id: 1 }],
            })
        ).not.toThrow();
    });

    test("throws when both add and revoke are empty", () => {
        expect(() => validateAccountConfigure({ add: [], revoke: [] })).toThrow("add or revoke");
    });

    test("throws when payload is null", () => {
        expect(() => validateAccountConfigure(null as any)).toThrow("payload is required");
    });
});

describe("validateAccountInherit", () => {
    const valid = {
        target_account: SENDER,
        value: { asset_id: ASSET, callsite: "Transfer" },
        sub_account_index: 0,
    };

    test("accepts a valid account inherit payload", () => {
        expect(() => validateAccountInherit(valid)).not.toThrow();
    });

    test("throws when payload is null", () => {
        expect(() => validateAccountInherit(null as any)).toThrow("payload is required");
    });

    test("throws when target_account is empty", () => {
        expect(() => validateAccountInherit({ ...valid, target_account: "" } as any)).toThrow("target account");
    });

    test("throws when sub_account_index is negative", () => {
        expect(() => validateAccountInherit({ ...valid, sub_account_index: -1 })).toThrow("sub account index");
    });

    test("throws when sub_account_index is not a number", () => {
        expect(() => validateAccountInherit({ ...valid, sub_account_index: "0" as any })).toThrow("sub account index");
    });
});

describe("validateLogicPayload", () => {
    test("accepts empty payload", () => {
        expect(() => validateLogicPayload({} as any)).not.toThrow();
    });

    test("accepts valid calldata", () => {
        expect(() => validateLogicPayload({ calldata: "0xdeadbeef" } as any)).not.toThrow();
    });

    test("throws when calldata is an empty string", () => {
        expect(() => validateLogicPayload({ calldata: "" } as any)).toThrow("calldata");
    });

    test("accepts valid interfaces map", () => {
        expect(() => validateLogicPayload({ interfaces: { myInterface: "0x1234" } } as any)).not.toThrow();
    });

    test("throws when interfaces is an array instead of an object", () => {
        expect(() => validateLogicPayload({ interfaces: [] } as any)).toThrow("interfaces must be an object");
    });

    test("throws when an interface value is empty", () => {
        expect(() => validateLogicPayload({ interfaces: { key: "" } } as any)).toThrow("interface");
    });
});

describe("validateLogicDeploy", () => {
    test("accepts a valid deploy payload", () => {
        expect(() => validateLogicDeploy({ manifest: "0x1234" })).not.toThrow();
    });

    test("throws when payload is null", () => {
        expect(() => validateLogicDeploy(null as any)).toThrow("payload is required");
    });
});

describe("validateLogicAction", () => {
    test("accepts a valid logic action payload", () => {
        expect(() => validateLogicAction({ logic_id: LOGIC, callsite: "Invoke" })).not.toThrow();
    });

    test("throws when payload is null", () => {
        expect(() => validateLogicAction(null as any)).toThrow("payload is required");
    });

    test("throws when logic_id is empty", () => {
        expect(() => validateLogicAction({ logic_id: "", callsite: "Invoke" } as any)).toThrow("logic_id");
    });

    test("throws when logic_id is missing", () => {
        expect(() => validateLogicAction({ callsite: "Invoke" } as any)).toThrow("logic_id");
    });
});

describe("validateAssetCreate", () => {
    const valid = {
        symbol: "MOI",
        standard: 0,
        enable_events: true,
        manager: SENDER,
        max_supply: 1_000_000,
    };

    test("accepts a minimal valid asset create payload", () => {
        expect(() => validateAssetCreate(valid)).not.toThrow();
    });

    test("accepts optional dimension and decimals", () => {
        expect(() => validateAssetCreate({ ...valid, dimension: 0, decimals: 8 })).not.toThrow();
    });

    test("throws when payload is null", () => {
        expect(() => validateAssetCreate(null as any)).toThrow("payload is required");
    });

    test("throws when symbol is empty", () => {
        expect(() => validateAssetCreate({ ...valid, symbol: "" })).toThrow("symbol");
    });

    test("throws when dimension is negative", () => {
        expect(() => validateAssetCreate({ ...valid, dimension: -1 })).toThrow("dimension");
    });

    test("throws when decimals is negative", () => {
        expect(() => validateAssetCreate({ ...valid, decimals: -1 })).toThrow("decimals");
    });

    test("throws when standard is missing", () => {
        expect(() => validateAssetCreate({ ...valid, standard: null as any })).toThrow("standard is required");
    });

    test("throws when enable_events is not a boolean", () => {
        expect(() => validateAssetCreate({ ...valid, enable_events: 1 as any })).toThrow("enable events");
    });

    test("throws when manager is empty", () => {
        expect(() => validateAssetCreate({ ...valid, manager: "" } as any)).toThrow("manager");
    });

    test("throws when max_supply is negative", () => {
        expect(() => validateAssetCreate({ ...valid, max_supply: -1 })).toThrow("max_supply");
    });

    test("throws when static_metadata value is empty", () => {
        expect(() => validateAssetCreate({ ...valid, static_metadata: { key: "" as Hex } })).toThrow("static metadata");
    });

    test("throws when dynamic_metadata value is empty", () => {
        expect(() => validateAssetCreate({ ...valid, dynamic_metadata: { key: "" as Hex } })).toThrow("dynamic metadata");
    });

    test("throws when logic_payload manifest is missing", () => {
        expect(() =>
            validateAssetCreate({ ...valid, logic_payload: { manifest: null as any } })
        ).not.toThrow();
    });
});

describe("validateParticipantCreate", () => {
    const validKey = { public_key: PUBLIC_KEY as Hex, weight: 1, signature_algorithm: 0 };
    const valid = {
        id: SENDER as Hex,
        keys_payload: [validKey],
        value: { asset_id: ASSET as Hex, callsite: "Transfer" },
    };

    test("accepts a valid participant create payload", () => {
        expect(() => validateParticipantCreate(valid)).not.toThrow();
    });

    test("throws when payload is null", () => {
        expect(() => validateParticipantCreate(null as any)).toThrow("payload is required");
    });

    test("throws when id is empty", () => {
        expect(() => validateParticipantCreate({ ...valid, id: "" as Hex })).toThrow("id");
    });

    test("throws when keys_payload is not an array", () => {
        expect(() => validateParticipantCreate({ ...valid, keys_payload: "bad" as any })).toThrow("array");
    });

    test("throws when keys_payload is empty", () => {
        expect(() => validateParticipantCreate({ ...valid, keys_payload: [] })).toThrow("empty");
    });
});

describe("processInteractionObject", () => {
    test("always includes the sender as a MUTATE_LOCK participant", () => {
        const result = processInteractionObject(makeIx([{ type: OpType.ACCOUNT_CONFIGURE, payload: { add: [], revoke: [{ key_id: 0 }] } }]));

        expect(result.participants).toHaveLength(1);
        expect(result.participants![0].id).toBe(SENDER);
        expect(result.participants![0].lock_type).toBe(LockType.MUTATE_LOCK);
    });

    test("adds a non-zero payer as a MUTATE_LOCK participant", () => {
        const result = processInteractionObject(makeIx([{ type: OpType.ACCOUNT_CONFIGURE, payload: { add: [], revoke: [{ key_id: 0 }] } }], PAYER));

        expect(result.participants).toHaveLength(2);
        const payerParticipant = result.participants!.find((p) => p.id === PAYER);
        expect(payerParticipant).toBeDefined();
        expect(payerParticipant!.lock_type).toBe(LockType.MUTATE_LOCK);
    });

    test("does not add the payer when it equals ZERO_ADDRESS", () => {
        const result = processInteractionObject(makeIx([{ type: OpType.ACCOUNT_CONFIGURE, payload: { add: [], revoke: [{ key_id: 0 }] } }], ZERO_ADDRESS as Hex));

        expect(result.participants).toHaveLength(1);
    });

    test("ASSET_INVOKE adds the asset as a MUTATE_LOCK participant", () => {
        const result = processInteractionObject(
            makeIx([{ type: OpType.ASSET_INVOKE, payload: { asset_id: ASSET, callsite: "Transfer" } }])
        );

        expect(result.participants).toHaveLength(2);
        const assetParticipant = result.participants!.find((p) => p.id.toLowerCase().includes("cd"));
        expect(assetParticipant).toBeDefined();
        expect(assetParticipant!.lock_type).toBe(LockType.MUTATE_LOCK);
    });

    test("ACCOUNT_INHERIT adds the KMOI asset as a NO_LOCK participant", () => {
        const result = processInteractionObject(
            makeIx([{
                type: OpType.ACCOUNT_INHERIT,
                payload: {
                    target_account: SENDER,
                    value: { asset_id: ASSET, callsite: "Transfer" },
                    sub_account_index: 0,
                },
            }])
        );

        const kmoiParticipant = result.participants!.find((p) =>
            p.id.toLowerCase() === KMOI_ASSET_ID.toLowerCase()
        );
        expect(kmoiParticipant).toBeDefined();
        expect(kmoiParticipant!.lock_type).toBe(LockType.NO_LOCK);
    });

    test("LOGIC_INVOKE adds the logic as a MUTATE_LOCK participant", () => {
        const result = processInteractionObject(
            makeIx([{ type: OpType.LOGIC_INVOKE, payload: { logic_id: LOGIC } }])
        );

        expect(result.participants).toHaveLength(2);
        const logicParticipant = result.participants!.find((p) => p.id.toLowerCase().includes("ef"));
        expect(logicParticipant).toBeDefined();
        expect(logicParticipant!.lock_type).toBe(LockType.MUTATE_LOCK);
    });

    test("LOGIC_DEPLOY adds no extra participants beyond the sender", () => {
        const result = processInteractionObject(
            makeIx([{ type: OpType.LOGIC_DEPLOY, payload: { manifest: "0x1234" } }])
        );

        expect(result.participants).toHaveLength(1);
    });

    test("ASSET_CREATE adds no extra participants beyond the sender", () => {
        const result = processInteractionObject(
            makeIx([{ type: OpType.ASSET_CREATE, payload: { symbol: "MOI", standard: 0, enable_events: true, manager: SENDER, max_supply: 1000 } }])
        );

        expect(result.participants).toHaveLength(1);
    });

    test("deduplicates participants with the same id", () => {
        const result = processInteractionObject(
            makeIx(
                [{ type: OpType.ASSET_INVOKE, payload: { asset_id: ASSET, callsite: "Transfer" } }],
                undefined,
                { participants: [{ id: SENDER, lock_type: LockType.NO_LOCK }] }
            )
        );

        const senderCount = result.participants!.filter((p) =>
            p.id.toLowerCase() === SENDER.toLowerCase()
        ).length;
        expect(senderCount).toBe(1);
    });

    test("explicit participants override auto-derived participants by id", () => {
        const customLockType = LockType.NO_LOCK;
        const result = processInteractionObject(
            makeIx(
                [{ type: OpType.ACCOUNT_CONFIGURE, payload: { add: [], revoke: [{ key_id: 0 }] } }],
                undefined,
                { participants: [{ id: SENDER, lock_type: customLockType }] }
            )
        );

        const senderParticipant = result.participants!.find((p) =>
            p.id.toLowerCase() === SENDER.toLowerCase()
        );
        expect(senderParticipant!.lock_type).toBe(customLockType);
    });

    test("does not mutate the original interaction object", () => {
        const ix = makeIx([{ type: OpType.ACCOUNT_CONFIGURE, payload: { add: [], revoke: [{ key_id: 0 }] } }]);
        const originalParticipants = ix.participants;

        processInteractionObject(ix);

        expect(ix.participants).toBe(originalParticipants);
    });
});

describe("toRawSignatures", () => {
    const signs: Signature[] = [
        { id: "0x1234", key_id: 0, signature: "0xdeadbeef" },
        { id: "0xabcd", key_id: 1, signature: "0xcafebabe" },
    ];

    test("converts id and signature from hex strings to Uint8Array", () => {
        const raw = toRawSignatures(signs);

        expect(raw[0].id).toBeInstanceOf(Uint8Array);
        expect(raw[0].signature).toBeInstanceOf(Uint8Array);
        expect(raw[1].id).toBeInstanceOf(Uint8Array);
        expect(raw[1].signature).toBeInstanceOf(Uint8Array);
    });

    test("preserves the key_id field unchanged", () => {
        const raw = toRawSignatures(signs);

        expect(raw[0].key_id).toBe(0);
        expect(raw[1].key_id).toBe(1);
    });

    test("converts hex bytes to the correct Uint8Array values", () => {
        const raw = toRawSignatures([{ id: "0x1234", key_id: 0, signature: "0xabcd" }]);

        expect(raw[0].id).toEqual(new Uint8Array([0x12, 0x34]));
        expect(raw[0].signature).toEqual(new Uint8Array([0xab, 0xcd]));
    });

    test("returns an empty array when given an empty input", () => {
        expect(toRawSignatures([])).toEqual([]);
    });
});

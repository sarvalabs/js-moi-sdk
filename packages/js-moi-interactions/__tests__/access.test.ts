import { AccessAction, CallerKind, OpType, ResourceType } from "js-moi-utils";
import { Access, access } from "../src.ts/access";

type Hex = `0x${string}`;

const RESOURCE_ID: Hex = `0x${"22".repeat(32)}`;
const SIGNER_ID: Hex = `0x${"aa".repeat(32)}`;
const TRUSTED: Hex = `0x${"33".repeat(32)}`;

const makeSigner = () => ({
    getIdentifier: jest.fn().mockResolvedValue({ toHex: () => SIGNER_ID }),
    getKeyId: jest.fn().mockResolvedValue(0),
    getNonce: jest.fn().mockResolvedValue(0),
    sendInteraction: jest.fn().mockResolvedValue({ hash: "0xdead" }),
}) as any;

describe("access helpers", () => {
    test("anyCaller() returns a CallerKind.ANY constraint with an empty set", () => {
        expect(access.anyCaller()).toStrictEqual({ kind: CallerKind.ANY, set: [] });
    });

    test("callers(...) returns a CallerKind.SET constraint with the given ids", () => {
        expect(access.callers(TRUSTED, SIGNER_ID)).toStrictEqual({ kind: CallerKind.SET, set: [TRUSTED, SIGNER_ID] });
    });
});

describe("Access", () => {
    test("storage/allow/withinPrefix/caller/origin return the builder for chaining", () => {
        const builder = new Access(makeSigner());

        expect(builder.storage(RESOURCE_ID)).toBe(builder);
        expect(builder.allow(AccessAction.STORAGE_MUTATE)).toBe(builder);
        expect(builder.withinPrefix("0x01")).toBe(builder);
        expect(builder.caller(access.anyCaller())).toBe(builder);
        expect(builder.origin(access.anyCaller())).toBe(builder);
    });

    test("create() throws when resource is not set", () => {
        expect(() => new Access(makeSigner()).allow(AccessAction.STORAGE_MUTATE).create()).toThrow(
            "resource is required"
        );
    });

    test("create() throws when no actions are allowed", () => {
        expect(() => new Access(makeSigner()).storage(RESOURCE_ID).create()).toThrow(
            "at least one action is required"
        );
    });

    test("delete() does not require allow() to have been called", () => {
        expect(() => new Access(makeSigner()).storage(RESOURCE_ID).delete()).not.toThrow();
    });

    test("delete() throws when resource is not set", () => {
        expect(() => new Access(makeSigner()).delete()).toThrow("resource is required");
    });

    test("create().send() resolves target_account from the signer and defaults caller/origin to anyone", async () => {
        const signer = makeSigner();

        await new Access(signer).storage(RESOURCE_ID).allow(AccessAction.STORAGE_MUTATE).create().send();

        expect(signer.sendInteraction).toHaveBeenCalledTimes(1);
        const ixData = signer.sendInteraction.mock.calls[0][0];
        const op = ixData.ix_operations[0];

        expect(op.type).toBe(OpType.ACCESS_CREATE);
        expect(op.payload.target_account).toBe(SIGNER_ID);
        expect(op.payload.access_policy.resource).toBe(ResourceType.STORAGE);
        expect(op.payload.access_policy.resource_id).toBe(RESOURCE_ID);
        expect(op.payload.access_policy.actions).toBe(AccessAction.STORAGE_MUTATE);
        expect(op.payload.access_policy.caller).toStrictEqual(access.anyCaller());
        expect(op.payload.access_policy.origin).toStrictEqual(access.anyCaller());
    });

    test("allow() ORs multiple actions into a single bitmask", async () => {
        const signer = makeSigner();

        await new Access(signer)
            .storage(RESOURCE_ID)
            .allow(AccessAction.STORAGE_MUTATE, AccessAction.ASSET_ACCESS)
            .create()
            .send();

        const op = signer.sendInteraction.mock.calls[0][0].ix_operations[0];
        expect(op.payload.access_policy.actions).toBe(AccessAction.STORAGE_MUTATE | AccessAction.ASSET_ACCESS);
    });

    test("caller()/origin() override the default anyone constraint", async () => {
        const signer = makeSigner();

        await new Access(signer)
            .storage(RESOURCE_ID)
            .allow(AccessAction.STORAGE_MUTATE)
            .caller(access.callers(TRUSTED))
            .create()
            .send();

        const op = signer.sendInteraction.mock.calls[0][0].ix_operations[0];
        expect(op.payload.access_policy.caller).toStrictEqual(access.callers(TRUSTED));
        expect(op.payload.access_policy.origin).toStrictEqual(access.anyCaller());
    });

    test("withinPrefix() narrows the policy scope", async () => {
        const signer = makeSigner();

        await new Access(signer).storage(RESOURCE_ID).allow(AccessAction.STORAGE_MUTATE).withinPrefix("0x01").create().send();

        const op = signer.sendInteraction.mock.calls[0][0].ix_operations[0];
        expect(op.payload.access_policy.scope).toStrictEqual({ prefixes: ["0x01"] });
    });

    test("update().send() sends an ACCESS_UPDATE op", async () => {
        const signer = makeSigner();

        await new Access(signer).storage(RESOURCE_ID).allow(AccessAction.STORAGE_MUTATE).update().send();

        const op = signer.sendInteraction.mock.calls[0][0].ix_operations[0];
        expect(op.type).toBe(OpType.ACCESS_UPDATE);
    });

    test("delete().send() sends an ACCESS_DELETE op with only resource/resource_id", async () => {
        const signer = makeSigner();

        await new Access(signer).storage(RESOURCE_ID).delete().send();

        const op = signer.sendInteraction.mock.calls[0][0].ix_operations[0];
        expect(op.type).toBe(OpType.ACCESS_DELETE);
        expect(op.payload).toStrictEqual({
            target_account: SIGNER_ID,
            resource: ResourceType.STORAGE,
            resource_id: RESOURCE_ID,
        });
    });
});

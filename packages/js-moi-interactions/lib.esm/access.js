import { CallerKind, OpType, ResourceType } from "js-moi-utils";
import { InteractionContext } from "./context";
/** Builds CallerConstraint values for Access.caller()/.origin(). */
export const access = {
    anyCaller() {
        return { kind: CallerKind.ANY, set: [] };
    },
    callers(...ids) {
        return { kind: CallerKind.SET, set: ids };
    },
};
/**
 * A single access op returned by Access.create()/.update()/.delete().
 * The target account is resolved from the signer at send time - go-moi
 * requires the policy owner to equal the sender, so there's nothing else
 * it could legally be.
 */
class PendingAccessOp {
    opType;
    signer;
    buildPayload;
    constructor(opType, signer, buildPayload) {
        this.opType = opType;
        this.signer = signer;
        this.buildPayload = buildPayload;
    }
    async send() {
        const target = (await this.signer.getIdentifier()).toHex();
        const ixnContext = new InteractionContext({
            opType: this.opType,
            payload: this.buildPayload(target),
            participants: [],
            signer: this.signer,
        });
        return await ixnContext.send();
    }
}
export class Access {
    _resource;
    _resourceId;
    _actions = 0;
    _prefixes = [];
    _caller;
    _origin;
    signer;
    constructor(signer) {
        this.signer = signer;
    }
    /** Only resource kind implemented on the network today. */
    storage(resourceId) {
        this._resource = ResourceType.STORAGE;
        this._resourceId = resourceId;
        return this;
    }
    allow(...actions) {
        for (const action of actions)
            this._actions |= action;
        return this;
    }
    /** Narrows the policy to specific key prefixes. Omit for the whole resource. */
    withinPrefix(...prefixes) {
        this._prefixes.push(...prefixes);
        return this;
    }
    /** Who may call in. Defaults to anyone. */
    caller(constraint) {
        this._caller = constraint;
        return this;
    }
    /** Who may originate the call. Defaults to anyone. */
    origin(constraint) {
        this._origin = constraint;
        return this;
    }
    resource() {
        if (this._resource == null || this._resourceId == null) {
            throw new Error("resource is required, call .storage(resourceId) first");
        }
        return { resource: this._resource, resource_id: this._resourceId };
    }
    policy() {
        const { resource, resource_id } = this.resource();
        if (this._actions === 0) {
            throw new Error("at least one action is required, call .allow(...)");
        }
        return {
            resource,
            resource_id,
            actions: this._actions,
            scope: this._prefixes.length > 0 ? { prefixes: this._prefixes } : undefined,
            caller: this._caller ?? access.anyCaller(),
            origin: this._origin ?? access.anyCaller(),
        };
    }
    create() {
        const policy = this.policy();
        return new PendingAccessOp(OpType.ACCESS_CREATE, this.signer, (target) => ({
            target_account: target,
            access_policy: policy,
        }));
    }
    update() {
        const policy = this.policy();
        return new PendingAccessOp(OpType.ACCESS_UPDATE, this.signer, (target) => ({
            target_account: target,
            access_policy: policy,
        }));
    }
    /** Only the resource needs naming - no policy body required. */
    delete() {
        const { resource, resource_id } = this.resource();
        return new PendingAccessOp(OpType.ACCESS_DELETE, this.signer, (target) => ({
            target_account: target,
            resource,
            resource_id,
        }));
    }
}
//# sourceMappingURL=access.js.map
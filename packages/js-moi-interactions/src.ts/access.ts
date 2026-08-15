import { AccessDeletePayload, AccessPayload, AccessPolicy, CallerConstraint, InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { AccessAction, CallerKind, Hex, OpType, ResourceType } from "js-moi-utils";
import { InteractionContext } from "./context";
import { OperationMap } from "../types/context";

/** Builds CallerConstraint values for Access.caller()/.origin(). */
export const access = {
  anyCaller(): CallerConstraint {
    return { kind: CallerKind.ANY, set: [] };
  },
  callers(...ids: Hex[]): CallerConstraint {
    return { kind: CallerKind.SET, set: ids };
  },
};

type AccessOpType = OpType.ACCESS_CREATE | OpType.ACCESS_UPDATE | OpType.ACCESS_DELETE;

/**
 * A single access op returned by Access.create()/.update()/.delete().
 * The target account is resolved from the signer at send time - go-moi
 * requires the policy owner to equal the sender, so there's nothing else
 * it could legally be.
 */
class PendingAccessOp<T extends AccessOpType> {
  constructor(
    private readonly opType: T,
    private readonly signer: Signer,
    private readonly buildPayload: (target: Hex) => OperationMap[T],
  ) {}

  public async send(): Promise<InteractionResponse> {
    const target = (await this.signer.getIdentifier()).toHex();

    const ixnContext = new InteractionContext<T>({
      opType: this.opType,
      payload: this.buildPayload(target),
      participants: [],
      signer: this.signer,
    });

    return await ixnContext.send();
  }
}

export class Access {
  private _resource?: ResourceType;
  private _resourceId?: Hex;
  private _actions = 0;
  private _prefixes: Hex[] = [];
  private _caller?: CallerConstraint;
  private _origin?: CallerConstraint;
  private signer: Signer;

  constructor(signer: Signer) {
    this.signer = signer;
  }

  /** Only resource kind implemented on the network today. */
  public storage(resourceId: Hex): Access {
    this._resource = ResourceType.STORAGE;
    this._resourceId = resourceId;

    return this;
  }

  public allow(...actions: AccessAction[]): Access {
    for (const action of actions) this._actions |= action;

    return this;
  }

  /** Narrows the policy to specific key prefixes. Omit for the whole resource. */
  public withinPrefix(...prefixes: Hex[]): Access {
    this._prefixes.push(...prefixes);

    return this;
  }

  /** Who may call in. Defaults to anyone. */
  public caller(constraint: CallerConstraint): Access {
    this._caller = constraint;

    return this;
  }

  /** Who may originate the call. Defaults to anyone. */
  public origin(constraint: CallerConstraint): Access {
    this._origin = constraint;

    return this;
  }

  private resource(): { resource: ResourceType; resource_id: Hex } {
    if (this._resource == null || this._resourceId == null) {
      throw new Error("resource is required, call .storage(resourceId) first");
    }

    return { resource: this._resource, resource_id: this._resourceId };
  }

  private policy(): AccessPolicy {
    const { resource, resource_id } = this.resource();

    if (this._actions === 0) {
      throw new Error("at least one action is required, call .allow(...)");
    }

    return {
      resource,
      resource_id,
      actions: this._actions as AccessAction,
      scope: this._prefixes.length > 0 ? { prefixes: this._prefixes } : undefined,
      caller: this._caller ?? access.anyCaller(),
      origin: this._origin ?? access.anyCaller(),
    };
  }

  public create(): PendingAccessOp<OpType.ACCESS_CREATE> {
    const policy = this.policy();

    return new PendingAccessOp(OpType.ACCESS_CREATE, this.signer, (target): AccessPayload => ({
      target_account: target,
      access_policy: policy,
    }));
  }

  public update(): PendingAccessOp<OpType.ACCESS_UPDATE> {
    const policy = this.policy();

    return new PendingAccessOp(OpType.ACCESS_UPDATE, this.signer, (target): AccessPayload => ({
      target_account: target,
      access_policy: policy,
    }));
  }

  /** Only the resource needs naming - no policy body required. */
  public delete(): PendingAccessOp<OpType.ACCESS_DELETE> {
    const { resource, resource_id } = this.resource();

    return new PendingAccessOp(OpType.ACCESS_DELETE, this.signer, (target): AccessDeletePayload => ({
      target_account: target,
      resource,
      resource_id,
    }));
  }
}

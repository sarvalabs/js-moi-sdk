import { CallerConstraint, InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { AccessAction, Hex, OpType } from "js-moi-utils";
import { OperationMap } from "../types/context";
/** Builds CallerConstraint values for Access.caller()/.origin(). */
export declare const access: {
    anyCaller(): CallerConstraint;
    callers(...ids: Hex[]): CallerConstraint;
};
type AccessOpType = OpType.ACCESS_CREATE | OpType.ACCESS_UPDATE | OpType.ACCESS_DELETE;
/**
 * A single access op returned by Access.create()/.update()/.delete().
 * The target account is resolved from the signer at send time - go-moi
 * requires the policy owner to equal the sender, so there's nothing else
 * it could legally be.
 */
declare class PendingAccessOp<T extends AccessOpType> {
    private readonly opType;
    private readonly signer;
    private readonly buildPayload;
    constructor(opType: T, signer: Signer, buildPayload: (target: Hex) => OperationMap[T]);
    send(): Promise<InteractionResponse>;
}
export declare class Access {
    private _resource?;
    private _resourceId?;
    private _actions;
    private _prefixes;
    private _caller?;
    private _origin?;
    private signer;
    constructor(signer: Signer);
    /** Only resource kind implemented on the network today. */
    storage(resourceId: Hex): Access;
    allow(...actions: AccessAction[]): Access;
    /** Narrows the policy to specific key prefixes. Omit for the whole resource. */
    withinPrefix(...prefixes: Hex[]): Access;
    /** Who may call in. Defaults to anyone. */
    caller(constraint: CallerConstraint): Access;
    /** Who may originate the call. Defaults to anyone. */
    origin(constraint: CallerConstraint): Access;
    private resource;
    private policy;
    create(): PendingAccessOp<OpType.ACCESS_CREATE>;
    update(): PendingAccessOp<OpType.ACCESS_UPDATE>;
    /** Only the resource needs naming - no policy body required. */
    delete(): PendingAccessOp<OpType.ACCESS_DELETE>;
}
export {};
//# sourceMappingURL=access.d.ts.map
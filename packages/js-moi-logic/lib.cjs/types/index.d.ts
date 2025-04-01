import type { Identifier } from "js-moi-identifiers";
import type { InteractionResponse } from "js-moi-providers";
import type { Signer, SignerIx } from "js-moi-signer";
import type { InteractionRequest, LogicManifest } from "js-moi-utils";
import type { AccessorBuilder } from "../state/accessor-builder";
import type { StateAccessorBuilder } from "../state/state-accessor-builder";
export interface LogicDriverOption {
    manifest: LogicManifest;
    signer: Signer;
    logicId?: Identifier;
}
export type RoutineOption = Omit<Partial<SignerIx<InteractionRequest>>, "operations">;
type RoutineExecuteResult = InteractionResponse | Record<any, any>;
export interface RoutineCallback {
    <TRes extends RoutineExecuteResult = any>(...args: [...args: any[]] | [...args: any[], option: RoutineOption]): Promise<TRes>;
}
export type LogicRoutines = Record<string, RoutineCallback>;
export type StateAccessorFn = (builder: StateAccessorBuilder) => AccessorBuilder;
export {};
//# sourceMappingURL=index.d.ts.map
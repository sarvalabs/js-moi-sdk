import { LogicManifest, Exception } from "js-moi-manifest";
import { InteractionResponse, InteractionObject, InteractionCallResponse, AssetCreatePayload, AssetActionPayload } from "js-moi-providers";

export interface AssetIxObject {
    routine: LogicManifest.Routine;
    arguments: any[];

    call(...args: any[]): Promise<InteractionCallResponse>;
    send(...args: any[]): Promise<InteractionResponse>;
    estimateFuel(...args: any[]): Promise<number|bigint>;
    createPayload(): AssetCreatePayload | AssetActionPayload;
}

// Deliberately not extending InteractionResponse: processResult() is called
// for both the "call" and "send" branches of executeRoutine (asset-base.ts),
// and only ever uses routine_name and result(). "call" responses come from
// InteractionCallResponse (receipt + a zero-arg result()), which has no
// hash or wait, so requiring them here would make that branch impossible to
// type correctly. A zero-arg result() is still structurally assignable to
// the (timeout?: number) => Promise<any> shape below, since a function
// declaring fewer parameters can always stand in for one declaring more.
export interface AssetIxResponse {
    routine_name: string;
    result: (timeout?: number) => Promise<any>;
}

export interface AssetIxResult {
    asset_id?: string;
    output?: any;
    error: Exception | null
}

export interface AssetIxArguments {
    type: string;
    params: InteractionObject;
}

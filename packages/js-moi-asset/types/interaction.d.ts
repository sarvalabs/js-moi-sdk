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

export interface AssetIxResponse extends InteractionResponse {
    routine_name: string;
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

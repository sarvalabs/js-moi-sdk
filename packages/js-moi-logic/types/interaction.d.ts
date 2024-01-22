import { LogicManifest, Exception } from "js-moi-manifest";
import { InteractionResponse, InteractionObject, LogicPayload, InteractionCallResponse } from "js-moi-providers";

export interface LogicIxObject {
    routine: LogicManifest.Routine;
    arguments: any[];

    call(...args: any[]): Promise<InteractionCallResponse>;
    send(...args: any[]): Promise<InteractionResponse>;
    estimateFuel(...args: any[]): Promise<number|bigint>;
    createPayload(): LogicPayload;
}

export interface LogicIxResponse extends InteractionResponse {
    routine_name: string;
}

export interface LogicIxResult {
    logic_id?: string;
    output?: any;
    error: Exception | null
}

export interface LogicIxArguments {
    type: string;
    params: InteractionObject;
}

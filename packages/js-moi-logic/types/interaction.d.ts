import { LogicManifest, Exception } from "js-moi-manifest";
import { InteractionCallResponse, InteractionResponse } from "js-moi-providers";

/**
 * Internal object passed to createPayload() implementations.
 */
export interface LogicIxObject {
    routine: LogicManifest.Routine;
    arguments: any[];
}

export interface LogicIxResponse extends InteractionResponse {
    routine_name: string;
}

export interface LogicIxCallResponse extends InteractionCallResponse {
    routine_name: string;
}

export interface LogicIxResult {
    logic_id?: string;
    output?: any;
    error: Exception | null
}

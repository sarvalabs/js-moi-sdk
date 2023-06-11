import { Exception } from "moi-abi";
import { InteractionResponse } from "moi-providers";
import { InteractionObject, LogicPayload } from "moi-signer";
import { LogicManifest } from "moi-utils";

export interface LogicIxObject {
    routine: LogicManifest.Routine;
    arguments: any[];

    call(...args: any[]): Promise<InteractionResponse>;
    send(...args: any[]): Promise<InteractionResponse>;
    estimateGas(...args: any[]): Promise<InteractionResponse>;
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

// Todo: params type has to be updated.
export interface LogicIxArguments {
    type: string;
    // params: InteractionObject;
    params: any
}
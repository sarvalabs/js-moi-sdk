import { InteractionResponse } from "moi-providers";

export interface LogicDeployRequest {
    send: (args: any) => Promise<InteractionResponse>;
    estimateGas: (args: any) => Promise<any>;
}

export interface LogicExecuteRequest {
    call: (args: any) => Promise<any>;
    send: (args: any) => Promise<InteractionResponse>;
    estimateGas: (args: any) => Promise<any>;
}

export interface Routines {
    [name: string]: (args?: any[]) => any
}

export interface CallSite {
    ptr: number,
    kind: string
}
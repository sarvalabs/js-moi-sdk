import { InteractionReceipt, InteractionResponse } from "js-moi-providers";
import { LogicManifest } from "js-moi-manifest";

export interface LogicDeployRequest {
    send: (args: any) => Promise<InteractionResponse>;
    estimateFuel: (args: any) => Promise<number | bigint>;
}

export interface LogicExecuteRequest {
    call: (args: any) => Promise<InteractionReceipt>;
    send: (args: any) => Promise<InteractionResponse>;
    estimateFuel: (args: any) => Promise<number|bigint>;
}

export interface Routine {
    (args?: any[]): any;
    isMutable: () => boolean;
    accepts: () => LogicManifest.TypeField[] | null;
    returns: () => LogicManifest.TypeField[] | null;
}
  
export interface Routines {
    [name: string]: Routine;
}

export interface CallSite {
    ptr: number,
    kind: string
}

export interface MethodDef {
    ptr: number;
    class: string;
}
